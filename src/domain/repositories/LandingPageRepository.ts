import { PersistedLandingPage } from "../../data/entities/PersistedLandingPage";
import { LandingNode } from "../entities/LandingPage";
import { TranslableTextRepository } from "./TranslableTextRepository";

export interface LandingPageRepository extends TranslableTextRepository {
    list(): Promise<LandingNode[]>;
    export(ids: string[]): Promise<void>;
    import(files: File[]): Promise<PersistedLandingPage[]>;
    updateChild(node: LandingNode): Promise<void>;
    removeChilds(ids: string[]): Promise<void>;
    swapOrder(node1: LandingNode, node2: LandingNode): Promise<void>;
}
