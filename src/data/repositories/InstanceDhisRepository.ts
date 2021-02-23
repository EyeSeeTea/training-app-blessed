import FileType from "file-type/browser";
import reduce from "image-blob-reduce";
import { ConfigRepository } from "../../domain/repositories/ConfigRepository";
import { InstanceRepository } from "../../domain/repositories/InstanceRepository";
import { D2Api } from "../../types/d2-api";
import { cache, clearCache } from "../../utils/cache";
import { getD2APiFromInstance } from "../utils/d2-api";
import { SearchResult } from "../entities/SearchUser";

export class InstanceDhisRepository implements InstanceRepository {
    private api: D2Api;

    constructor(config: ConfigRepository) {
        this.api = getD2APiFromInstance(config.getInstance());
    }

    public async uploadFile(data: ArrayBuffer): Promise<string> {
        const type = await FileType.fromBuffer(data);
        const { mime = "application/unknown" } = type ?? {};
        const blob = new Blob([data], { type: mime });
        const resized = mime.startsWith("image") ? await reduce().toBlob(blob, { max: 1000 }) : blob;

        const { id } = await this.api.files
            .upload({
                name: `[Training App] Uploaded file`,
                data: resized,
            })
            .getData();

        return `${this.api.apiPath}/documents/${id}/data`;
    }

    public async installApp(appName: string): Promise<boolean> {
        clearCache(this.isAppInstalledByUrl, this);

        const storeApps = await this.listStoreApps();
        const { versions = [] } = storeApps.find(({ name }) => name === appName) ?? {};
        const latestVersion = versions[0]?.id;
        if (!latestVersion) return false;

        try {
            await this.api.appHub.install(latestVersion).getData();
        } catch (error) {
            return false;
        }

        return true;
    }

    public async searchUsers(query: string): Promise<SearchResult> {
        const options = {
            fields: { id: true, displayName: true },
            filter: { displayName: { ilike: query } },
        };

        return await this.api.metadata.get({ users: options, userGroups: options }).getData();
    }
    @cache()
    public async isAppInstalledByUrl(launchUrl: string): Promise<boolean> {
        try {
            await this.api.baseConnection.request({ method: "get", url: launchUrl }).getData();
        } catch (error) {
            return false;
        }

        return true;
    }

    private async listStoreApps() {
        try {
            return this.api.appHub.list().getData();
        } catch (error) {
            console.error(error);
            return [];
        }
    }
}
