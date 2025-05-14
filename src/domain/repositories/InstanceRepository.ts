import { UserSearch } from "../../data/entities/SearchUser";
import { InstalledApp } from "../entities/InstalledApp";

export interface InstanceRepository {
    installApp(appId: string): Promise<boolean>;
    isAppInstalledByUrl(launchUrl: string): Promise<boolean>;
    searchUsers(query: string): Promise<UserSearch>;
    listInstalledApps(): Promise<InstalledApp[]>;
    getVersion(): Promise<string>;
}
