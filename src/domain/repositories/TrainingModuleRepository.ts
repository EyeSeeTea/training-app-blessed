import { PersistedTrainingModule } from "../../data/entities/PersistedTrainingModule";
import { TrainingModule } from "../entities/TrainingModule";
import { ImportExportTranslationRepository } from "./ImportExportTranslationRepository";
import { TranslatableText } from "../entities/TranslatableText";

export interface TrainingModuleRepository extends ImportExportTranslationRepository {
    list(): Promise<TrainingModule[]>;
    get(moduleKey: string, options: GetModuleOptions): Promise<TrainingModule | undefined>;
    update(module: Pick<TrainingModule, "id" | "name"> & Partial<TrainingModule>): Promise<void>;
    delete(ids: string[]): Promise<void>;
    swapOrder(id1: string, id2: string): Promise<void>;
    updateProgress(id: string, lastStep: number, completed: boolean): Promise<void>;
    resetDefaultValue(ids: string[]): Promise<void>;
    export(ids: string[]): Promise<void>;
    import(files: File[]): Promise<PersistedTrainingModule[]>;
}

export type GetModuleOptions = { autoInstallDefaultModules: boolean };
