import _, { assign } from "lodash";

import { ConfigRepository } from "../../domain/repositories/ConfigRepository";
import { D2Api } from "../../types/d2-api";
import { cache } from "../../utils/cache";
import { DataStoreStorageClient } from "../clients/storage/DataStoreStorageClient";
import { Namespaces } from "../clients/storage/Namespaces";
import { StorageClient } from "../clients/storage/StorageClient";
import { User } from "../entities/User";
import { setTranslationValue, TranslatableText } from "../../domain/entities/TranslatableText";
import { CustomText } from "../../domain/entities/CustomText";
import { Config, PartialConfig } from "../../domain/entities/Config";

export class Dhis2ConfigRepository implements ConfigRepository {
    private storageClient: StorageClient;

    constructor(private api: D2Api) {
        this.storageClient = new DataStoreStorageClient("global", api);
    }

    // FIXME: This method is being used in other repositories, something that shouldn't happen (code smell)
    @cache()
    public async getUser(): Promise<User> {
        const d2User = await this.api.currentUser
            .get({
                fields: {
                    id: true,
                    displayName: true,
                    userGroups: { id: true, name: true },
                    userCredentials: {
                        username: true,
                        userRoles: { id: true, name: true, authorities: true },
                    },
                },
            })
            .getData();

        return {
            id: d2User.id,
            name: d2User.displayName,
            userGroups: d2User.userGroups,
            ...d2User.userCredentials,
        };
    }

    public async get(): Promise<Partial<Config>> {
        return (await this.storageClient.getObject<Partial<Config>>(Namespaces.CONFIG)) ?? {};
    }

    public async save(update: PartialConfig): Promise<Partial<Config>> {
        const config = await this.get();
        const updatedConfig: Partial<Config> = assign({}, config, update);

        return this.storageClient
            .saveObject<Partial<Config>>(Namespaces.CONFIG, updatedConfig)
            .then(() => updatedConfig);
    }

    public async importTranslations(language: string, terms: Record<string, string>): Promise<TranslatableText[]> {
        const config = await this.get();

        if (!config?.customText) return [];
        const { customText } = config;

        const translatedText: Partial<CustomText> = {
            ...customText,
            rootTitle: customText.rootTitle
                ? setTranslationValue(customText.rootTitle, language, terms[customText.rootTitle.key])
                : undefined,
            rootSubtitle: customText.rootSubtitle
                ? setTranslationValue(customText.rootSubtitle, language, terms[customText.rootSubtitle.key])
                : undefined,
        };

        const updatedConfig = await this.save({ customText: translatedText });

        return this.extractTranslatableText(updatedConfig);
    }

    public async extractTranslations(): Promise<TranslatableText[]> {
        const config = await this.get();
        return this.extractTranslatableText(config);
    }

    private extractTranslatableText(config: Partial<Config>): TranslatableText[] {
        return _.compact(_.values(config.customText));
    }
}
