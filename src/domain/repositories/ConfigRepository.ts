import { Instance } from "../../data/entities/Instance";
import { User } from "../../data/entities/User";
import { Permission } from "../entities/Permission";
import { CustomText } from "../entities/CustomText";
import { Config } from "../entities/Config";

export interface ConfigRepository {
    getUser(): Promise<User>;
    getInstance(): Instance;
    get(): Promise<Config>;
    save(update: Config): Promise<Config>;
}
