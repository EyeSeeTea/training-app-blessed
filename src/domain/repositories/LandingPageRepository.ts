import { PersistedLandingPage } from "../../data/entities/PersistedLandingPage";
import { LandingNode } from "../entities/LandingPage";
import { ImportExportTranslationRepository } from "./ImportExportTranslationRepository";

export interface LandingPageRepository extends ImportExportTranslationRepository {
    list(): Promise<LandingNode[]>;
    export(ids: string[]): Promise<void>;
    import(files: File[]): Promise<PersistedLandingPage[]>;
    updateChild(node: LandingNode): Promise<void>;
    removeChilds(ids: string[]): Promise<void>;
    swapOrder(node1: LandingNode, node2: LandingNode): Promise<void>;
}
