import { PersistedLandingPage } from "../../data/entities/PersistedLandingPage";
import { LandingNode } from "../entities/LandingPage";
import { TranslableTextRepository } from "./TranslableTextRepository";

export interface LandingPageRepository extends TranslableTextRepository {
    list(): Promise<LandingNode[]>;
    update(nodes: LandingNode[]): Promise<void>;
    delete(ids: string[]): Promise<void>;
    export(ids: string[]): Promise<void>;
    import(files: File[]): Promise<PersistedLandingPage[]>;
}
