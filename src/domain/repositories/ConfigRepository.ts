import { User } from "../../data/entities/User";
import { Config } from "../entities/Config";
import { TranslableTextRepository } from "./TranslableTextRepository";

export interface ConfigRepository extends TranslableTextRepository {
    getUser(): Promise<User>;
    get(): Promise<Config>;
    save(update: Config): Promise<Config>;
}
