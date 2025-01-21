import { ConfigRepository } from "../../domain/repositories/ConfigRepository";
import { D2Api } from "../../types/d2-api";
import { cache } from "../../utils/cache";
import { DataStoreStorageClient } from "../clients/storage/DataStoreStorageClient";
import { Namespaces } from "../clients/storage/Namespaces";
import { StorageClient } from "../clients/storage/StorageClient";
import { Instance } from "../entities/Instance";
import { defaultConfig, PersistedConfig } from "../entities/PersistedConfig";
import { User } from "../entities/User";
import { getD2APiFromInstance } from "../utils/d2-api";

export class Dhis2ConfigRepository implements ConfigRepository {
    private readonly instance: Instance;
    private api: D2Api;
    private storageClient: StorageClient;

    constructor(baseUrl: string) {
        this.instance = new Instance({ url: baseUrl });
        this.api = getD2APiFromInstance(this.instance);
        this.storageClient = new DataStoreStorageClient("global", this.instance);
    }

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
                    settings: { keyUiLocale: true },
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

    public getInstance(): Instance {
        return this.instance;
    }

    private async getConfig() {
        return this.storageClient.getObject<PersistedConfig>(Namespaces.CONFIG);
    }

    public async get(): Promise<PersistedConfig> {
        const config = (await this.getConfig()) ?? {};
        return {
            ...defaultConfig,
            ...config,
        };
    }

    public async save(update: PersistedConfig): Promise<PersistedConfig> {
        const config = await this.getConfig();
        const updatedConfig = {
            ...config,
            ...update,
        };

        return this.storageClient
            .saveObject<PersistedConfig>(Namespaces.CONFIG, updatedConfig)
            .then(() => updatedConfig);
    }
}
