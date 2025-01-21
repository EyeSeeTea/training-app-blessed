import { Instance } from "../../data/entities/Instance";
import { User } from "../../data/entities/User";
import { Config } from "../entities/Config";
import { ImportExportTranslationRepository } from "./ImportExportTranslationRepository";

export interface ConfigRepository extends ImportExportTranslationRepository {
    getUser(): Promise<User>;
    getInstance(): Instance;
    get(): Promise<Config>;
    save(update: Config): Promise<Config>;
}
