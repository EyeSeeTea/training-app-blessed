import _, { isEmpty, isEqual, merge } from "lodash";

import { ConfigRepository } from "../../domain/repositories/ConfigRepository";
import { D2Api } from "../../types/d2-api";
import { cache } from "../../utils/cache";
import { DataStoreStorageClient } from "../clients/storage/DataStoreStorageClient";
import { Namespaces } from "../clients/storage/Namespaces";
import { StorageClient } from "../clients/storage/StorageClient";
import { User } from "../entities/User";
import { setTranslationValue, TranslatableText } from "../../domain/entities/TranslatableText";
import { CustomText, getDefaultCustomText } from "../../domain/entities/CustomText";
import { Config, getDefaultConfig } from "../../domain/entities/Config";
import { PersistedConfig } from "../entities/PersistedConfig";
import { Maybe } from "../../types/utils";

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

    public async get(): Promise<Config> {
        const persistedConfig = await this.storageClient.getObject<PersistedConfig>(Namespaces.CONFIG);
        return getMergedConfig(persistedConfig);
    }

    public async save(update: Config): Promise<void> {
        return this.storageClient.saveObject(Namespaces.CONFIG, {
            ...update,
            customText: cleanCustomText(update.customText),
        });
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

        const updatedConfig: Config = {
            ...config,
            customText: {
                rootTitle: translatedText.rootTitle ?? config.customText.rootTitle,
                rootSubtitle: translatedText.rootSubtitle ?? config.customText.rootSubtitle,
            },
        };

        await this.save(updatedConfig);

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

function getMergedConfig(config: Maybe<PersistedConfig>): Config {
    const defaultConfig = getDefaultConfig();
    const defaultCustomText = defaultConfig.customText;

    const mergedCustomText = {
        rootTitle: config?.customText?.rootTitle ?? defaultCustomText.rootTitle,
        rootSubtitle: config?.customText?.rootSubtitle ?? defaultCustomText.rootSubtitle,
    };

    const { customText: _, ...defaultConfigWithoutCustomText } = defaultConfig;

    return merge({}, defaultConfigWithoutCustomText, {
        ...config,
        customText: mergedCustomText,
    });
}

function cleanCustomText(customText: Partial<CustomText>): Partial<CustomText> {
    const defaultCustomText = getDefaultCustomText();

    return Object.entries(customText).reduce((acc, [key, value]) => {
        if (isEmpty(value)) return acc;

        const defaultValue = defaultCustomText[key as keyof CustomText];
        const hasEqualReferenceValue = value.referenceValue === defaultValue?.referenceValue;
        const hasEmptyOrEqualTranslation =
            isEmpty(value.translations) ||
            Object.values(value.translations || {}).every(translation => !translation || translation.trim() === "") ||
            isEqual(value.translations, defaultValue?.translations);

        if (hasEqualReferenceValue && hasEmptyOrEqualTranslation) {
            return { ...acc, [key]: undefined };
        }

        return { ...acc, [key]: value };
    }, {});
}
