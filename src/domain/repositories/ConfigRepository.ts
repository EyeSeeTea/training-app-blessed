import { Instance } from "../../data/entities/Instance";
import { User } from "../../data/entities/User";
import { Permission } from "../entities/Permission";
import { CustomText } from "../entities/CustomText";

export interface ConfigRepository {
    getUser(): Promise<User>;
    getInstance(): Instance;
    getSettingsPermissions(): Promise<Permission>;
    updateSettingsPermissions(update: Partial<Permission>): Promise<void>;
    getShowAllModules(): Promise<boolean>;
    setShowAllModules(flag: boolean): Promise<void>;
    getCustomText(): Promise<Partial<CustomText>>;
    setCustomText(update: Partial<CustomText>): Promise<void>;
    getLogo(): Promise<string | null>;
    setLogo(logo: string): Promise<void>;
}
