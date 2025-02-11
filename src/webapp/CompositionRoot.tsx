import { Dhis2ConfigRepository } from "../data/repositories/Dhis2ConfigRepository";
import { InstanceDhisRepository } from "../data/repositories/InstanceDhisRepository";
import { LandingPageDefaultRepository } from "../data/repositories/LandingPageDefaultRepository";
import { TrainingModuleDefaultRepository } from "../data/repositories/TrainingModuleDefaultRepository";
import { CheckAdminAuthorityUseCase } from "../domain/usecases/CheckAdminAuthorityUseCase";
import { CheckSettingsPermissionsUseCase } from "../domain/usecases/CheckSettingsPermissionsUseCase";
import { CompleteUserProgressUseCase } from "../domain/usecases/CompleteUserProgressUseCase";
import { DeleteDocumentsUseCase } from "../domain/usecases/DeleteDocumentsUseCase";
import { DeleteLandingChildUseCase } from "../domain/usecases/DeleteLandingChildUseCase";
import { DeleteModulesUseCase } from "../domain/usecases/DeleteModulesUseCase";
import { ExportLandingPagesUseCase } from "../domain/usecases/ExportLandingPagesUseCase";
import { ExportModulesUseCase } from "../domain/usecases/ExportModulesUseCase";
import { GetModuleUseCase } from "../domain/usecases/GetModuleUseCase";
import { SwapLandingChildOrderUseCase } from "../domain/usecases/SwapLandingChildOrderUseCase";
import { ImportLandingPagesUseCase } from "../domain/usecases/ImportLandingPagesUseCase";
import { ImportModulesUseCase } from "../domain/usecases/ImportModulesUseCase";
import { InstallAppUseCase } from "../domain/usecases/InstallAppUseCase";
import { ListDanglingDocumentsUseCase } from "../domain/usecases/ListDanglingDocumentsUseCase";
import { ListInstalledAppsUseCase } from "../domain/usecases/ListInstalledAppsUseCase";
import { ListLandingChildrenUseCase } from "../domain/usecases/ListLandingChildrenUseCase";
import { ListModulesUseCase } from "../domain/usecases/ListModulesUseCase";
import { ResetModuleDefaultValueUseCase } from "../domain/usecases/ResetModuleDefaultValueUseCase";
import { SearchUsersUseCase } from "../domain/usecases/SearchUsersUseCase";
import { SwapModuleOrderUseCase } from "../domain/usecases/SwapModuleOrderUseCase";
import { UpdateLandingChildUseCase } from "../domain/usecases/UpdateLandingChildUseCase";
import { UpdateModuleUseCase } from "../domain/usecases/UpdateModuleUseCase";
import { UpdateUserProgressUseCase } from "../domain/usecases/UpdateUserProgressUseCase";
import { UploadFileUseCase } from "../domain/usecases/UploadFileUseCase";
import { GetConfigUseCase } from "../domain/usecases/GetConfigUseCase";
import { Dhis2DocumentRepository } from "../data/repositories/Dhis2DocumentRepository";
import { SaveConfigUseCase } from "../domain/usecases/SaveConfigUseCase";
import { ExtractTranslationsUseCase } from "../domain/usecases/ExtractTranslationsUseCase";
import { ImportTranslationsUseCase } from "../domain/usecases/ImportTranslationsUseCase";
import { D2Api } from "../types/d2-api";

export function getCompositionRoot(api: D2Api) {
    const configRepository = new Dhis2ConfigRepository(api);
    const instanceRepository = new InstanceDhisRepository(api);
    const trainingModuleRepository = new TrainingModuleDefaultRepository(api, configRepository, instanceRepository);
    const landingPageRepository = new LandingPageDefaultRepository(api, instanceRepository);
    const documentRepository = new Dhis2DocumentRepository(api);

    return {
        usecases: {
            modules: getExecute({
                get: new GetModuleUseCase(trainingModuleRepository),
                list: new ListModulesUseCase(trainingModuleRepository),
                update: new UpdateModuleUseCase(trainingModuleRepository),
                delete: new DeleteModulesUseCase(trainingModuleRepository),
                swapOrder: new SwapModuleOrderUseCase(trainingModuleRepository),
                resetDefaultValue: new ResetModuleDefaultValueUseCase(trainingModuleRepository),
                export: new ExportModulesUseCase(trainingModuleRepository),
                import: new ImportModulesUseCase(trainingModuleRepository),
                importTranslations: new ImportTranslationsUseCase(trainingModuleRepository),
                extractTranslations: new ExtractTranslationsUseCase(trainingModuleRepository),
            }),
            landings: getExecute({
                list: new ListLandingChildrenUseCase(landingPageRepository),
                update: new UpdateLandingChildUseCase(landingPageRepository),
                delete: new DeleteLandingChildUseCase(landingPageRepository),
                export: new ExportLandingPagesUseCase(landingPageRepository),
                import: new ImportLandingPagesUseCase(landingPageRepository),
                swapOrder: new SwapLandingChildOrderUseCase(landingPageRepository),
                importTranslations: new ImportTranslationsUseCase(landingPageRepository),
                extractTranslations: new ExtractTranslationsUseCase(landingPageRepository),
            }),
            progress: getExecute({
                update: new UpdateUserProgressUseCase(trainingModuleRepository),
                complete: new CompleteUserProgressUseCase(trainingModuleRepository),
            }),
            config: getExecute({
                get: new GetConfigUseCase(configRepository),
                save: new SaveConfigUseCase(configRepository),
                importTranslations: new ImportTranslationsUseCase(configRepository),
                extractTranslations: new ExtractTranslationsUseCase(configRepository),
            }),
            user: getExecute({
                checkSettingsPermissions: new CheckSettingsPermissionsUseCase(configRepository),
                checkAdminAuthority: new CheckAdminAuthorityUseCase(configRepository),
            }),
            instance: getExecute({
                uploadFile: new UploadFileUseCase(instanceRepository),
                installApp: new InstallAppUseCase(instanceRepository, trainingModuleRepository),
                searchUsers: new SearchUsersUseCase(instanceRepository),
                listInstalledApps: new ListInstalledAppsUseCase(instanceRepository),
            }),
            document: getExecute({
                listDangling: new ListDanglingDocumentsUseCase(documentRepository),
                delete: new DeleteDocumentsUseCase(documentRepository),
            }),
        },
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;

function getExecute<UseCases extends Record<Key, UseCase>, Key extends keyof UseCases>(
    useCases: UseCases
): { [K in Key]: UseCases[K]["execute"] } {
    const keys = Object.keys(useCases) as Key[];
    const initialOutput = {} as { [K in Key]: UseCases[K]["execute"] };

    return keys.reduce((output, key) => {
        const useCase = useCases[key];
        const execute = useCase.execute.bind(useCase) as UseCases[typeof key]["execute"];
        output[key] = execute;
        return output;
    }, initialOutput);
}

export interface UseCase {
    execute: Function;
}
