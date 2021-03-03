import { PersistedTrainingModule } from "../../data/entities/PersistedTrainingModule";
import { TrainingModule } from "../entities/TrainingModule";

export interface TrainingModuleRepository {
    list(): Promise<TrainingModule[]>;
    get(moduleKey: string): Promise<TrainingModule | undefined>;
    update(module: Pick<TrainingModule, "id" | "name"> & Partial<TrainingModule>): Promise<void>;
    delete(ids: string[]): Promise<void>;
    swapOrder(id1: string, id2: string): Promise<void>;
    updateProgress(id: string, lastStep: number, completed: boolean): Promise<void>;
    updateTranslations(id: string): Promise<void>;
    initializeTranslation(id: string): Promise<void>;
    resetDefaultValue(ids: string[]): Promise<void>;
    export(ids: string[]): Promise<void>;
    import(files: File[]): Promise<PersistedTrainingModule[]>;
}
