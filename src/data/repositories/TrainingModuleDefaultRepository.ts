import _ from "lodash";
import { Either } from "../../domain/entities/Either";
import {
    isValidTrainingType,
    TrainingModule,
    TrainingModuleBuilder,
} from "../../domain/entities/TrainingModule";
import { ConfigRepository } from "../../domain/repositories/ConfigRepository";
import { TrainingModuleRepository } from "../../domain/repositories/TrainingModuleRepository";
import { Dictionary } from "../../types/utils";
import { promiseMap } from "../../utils/promises";
import { BuiltinModules } from "../assets/modules/BuiltinModules";
import { DataStoreStorageClient } from "../clients/storage/DataStoreStorageClient";
import { Namespaces } from "../clients/storage/Namespaces";
import { StorageClient } from "../clients/storage/StorageClient";
import { PoEditorApi } from "../clients/translation/PoEditorApi";
import { JSONTrainingModule } from "../entities/JSONTrainingModule";
import {
    PersistedTrainingModule,
    TranslationConnection,
} from "../entities/PersistedTrainingModule";
import { UserProgress } from "../entities/UserProgress";

export class TrainingModuleDefaultRepository implements TrainingModuleRepository {
    private builtinModules: Dictionary<JSONTrainingModule | undefined>;
    private storageClient: StorageClient;
    private progressStorageClient: StorageClient;

    constructor(private config: ConfigRepository) {
        this.builtinModules = BuiltinModules;
        this.storageClient = new DataStoreStorageClient("global", config.getInstance());
        this.progressStorageClient = new DataStoreStorageClient("user", config.getInstance());
    }

    public async list(): Promise<TrainingModule[]> {
        const dataStoreModules = await this.storageClient.listObjectsInCollection<
            PersistedTrainingModule
        >(Namespaces.TRAINING_MODULES);

        const missingModuleKeys = _(this.builtinModules)
            .keys()
            .difference(dataStoreModules.map(({ id }) => id))
            .value();

        const missingModules = await promiseMap(missingModuleKeys, key => this.getBuiltin(key));

        return promiseMap(_.compact([...dataStoreModules, ...missingModules]), module =>
            this.buildDomainModel(module)
        );
    }

    public async get(key: string): Promise<TrainingModule | undefined> {
        const dataStoreModel = await this.storageClient.getObjectInCollection<
            PersistedTrainingModule
        >(Namespaces.TRAINING_MODULES, key);

        const model = dataStoreModel ?? (await this.getBuiltin(key));
        if (!model) return undefined;

        // TODO: Check translation last sync
        //const lastTranslationSync = new Date(model.lastTranslationSync);
        this.updateTranslations(model.id);

        return this.buildDomainModel(model);
    }

    public async create({
        id,
        name,
        poEditorProject,
    }: TrainingModuleBuilder): Promise<Either<"CODE_EXISTS", void>> {
        const items = await this.storageClient.listObjectsInCollection<PersistedTrainingModule>(
            Namespaces.TRAINING_MODULES
        );
        const exists = !!items.find(item => item.id === id);
        if (exists) return Either.error("CODE_EXISTS");

        const newModel = await this.buildPersistedModel({
            id,
            name,
            type: "app",
            _version: 1,
            revision: 1,
            dhisVersionRange: "",
            dhisAppKey: "",
            dhisLaunchUrl: "",
            disabled: false,
            contents: {
                welcome: { key: "module-welcome", referenceValue: "", translations: {} },
                steps: [],
            },
        });

        const translation: TranslationConnection = poEditorProject
            ? { provider: "poeditor", project: poEditorProject }
            : { provider: "NONE" };

        await this.saveDataStore({ ...newModel, translation });
        return Either.success(undefined);
    }

    public async edit({ id, name, poEditorProject }: TrainingModuleBuilder): Promise<void> {
        const items = await this.storageClient.listObjectsInCollection<PersistedTrainingModule>(
            Namespaces.TRAINING_MODULES
        );

        const item = items.find(item => item.id === id);
        if (!item) return;

        const translation: TranslationConnection = poEditorProject
            ? { provider: "poeditor", project: poEditorProject }
            : { provider: "NONE" };

        const newItem = { ...item, name: name, translation };
        await this.storageClient.saveObjectInCollection(Namespaces.TRAINING_MODULES, newItem);
    }

    public async delete(ids: string[]): Promise<void> {
        for (const id of ids) {
            await this.storageClient.removeObjectInCollection(Namespaces.TRAINING_MODULES, id);
        }
    }

    public async swapOrder(id1: string, id2: string): Promise<void> {
        const items = await this.storageClient.listObjectsInCollection<PersistedTrainingModule>(
            Namespaces.TRAINING_MODULES
        );

        const index1 = _.findIndex(items, ({ id }) => id === id1);
        const index2 = _.findIndex(items, ({ id }) => id === id2);
        if (index1 === -1 || index2 === -1) return;

        [items[index1], items[index2]] = [items[index2], items[index1]];
        await this.storageClient.saveObject(Namespaces.TRAINING_MODULES, items);
    }

    public async updateProgress(id: string, lastStep: number): Promise<void> {
        await this.progressStorageClient.saveObjectInCollection<UserProgress>(Namespaces.PROGRESS, {
            id,
            lastStep,
        });
    }

    // TODO: Review in the near future
    public async updateTranslations(key: string): Promise<void> {
        try {
            const token = await this.config.getPoEditorToken();
            console.log(2, token);
            const model = await this.storageClient.getObjectInCollection<PersistedTrainingModule>(
                Namespaces.TRAINING_MODULES,
                key
            );

            if (!model || model.translation.provider === "NONE" || !token) return;
            const api = new PoEditorApi(token);

            const project = parseInt(model.translation.project);

            // Fetch translations and update local model
            const languagesResponse = await api.languages.list({ id: project });
            const poeditorLanguages =
                languagesResponse.value.data?.languages.map(({ code }) => code) ?? [];

            const dictionary = _(
                await promiseMap(poeditorLanguages, async language => {
                    const translationResponse = await api.terms.list({ id: project, language });
                    return (
                        translationResponse.value.data?.terms.map(({ term, translation }) => ({
                            term,
                            language,
                            value: translation.content,
                        })) ?? []
                    );
                })
            )
                .flatten()
                .groupBy(item => item.term)
                .mapValues(items =>
                    _.fromPairs(items.map(({ language, value }) => [language, value]))
                )
                .value();

            const translatedModel: PersistedTrainingModule = {
                ...model,
                contents: {
                    ...model.contents,
                    welcome: {
                        ...model.contents.welcome,
                        translations: dictionary[model.contents.welcome.key] ?? {},
                    },
                    steps: model.contents.steps.map(step => ({
                        ...step,
                        title: {
                            ...step.title,
                            translations: dictionary[step.title.key] ?? {},
                        },
                        subtitle: step.subtitle
                            ? {
                                  ...step.subtitle,
                                  translations: dictionary[step.subtitle.key] ?? {},
                              }
                            : undefined,
                        pages: step.pages.map(page => ({
                            ...page,
                            translations: dictionary[page.key] ?? {},
                        })),
                    })),
                },
            };

            await this.saveDataStore(translatedModel);
        } catch (error) {
            console.error(error);
        }
    }

    /** TODO: Build term list on create project
    private extractTranslations(model: PersistedTrainingModule): TranslatableText[] {
        const steps = _.flatMap(model.contents.steps, step => [
            step.title,
            step.subtitle,
            ...step.pages,
        ]);

        return _.compact([model.contents.welcome, ...steps]);
    }**/

    private async getBuiltin(key: string): Promise<PersistedTrainingModule | undefined> {
        const builtinModule = this.builtinModules[key];
        if (!builtinModule) return undefined;

        const persistedModel = await this.buildPersistedModel(builtinModule);
        await this.saveDataStore(persistedModel);

        return persistedModel;
    }

    private async saveDataStore(model: PersistedTrainingModule) {
        const currentUser = await this.config.getUser();
        const lastUpdatedBy = { id: currentUser.id, name: currentUser.name };

        await this.storageClient.saveObjectInCollection(Namespaces.TRAINING_MODULES, {
            ...model,
            lastUpdated: new Date(),
            lastUpdatedBy,
        });
    }

    /** TODO: Implement multiple providers (other than poeditor)
    private async getTranslationClient(): Promise<TranslationClient | undefined> {
        const token = await this.config.getPoEditorToken();
        return token ? new PoEditorTranslationClient(token) : undefined;
    }
    */

    private async buildDomainModel(model: PersistedTrainingModule): Promise<TrainingModule> {
        if (model._version !== 1) {
            throw new Error(`Unsupported revision of module: ${model._version}`);
        }

        const { created, lastUpdated, type, ...rest } = model;
        const validType = isValidTrainingType(type) ? type : "app";

        const progress = await this.progressStorageClient.getObjectInCollection<UserProgress>(
            Namespaces.PROGRESS,
            model.id
        );

        return {
            ...rest,
            created: new Date(created),
            lastUpdated: new Date(lastUpdated),
            type: validType,
            progress: progress?.lastStep ?? 0,
        };
    }

    private async buildPersistedModel(model: JSONTrainingModule): Promise<PersistedTrainingModule> {
        const currentUser = await this.config.getUser();
        const defaultUser = { id: currentUser.id, name: currentUser.name };

        // TODO: This is hard-coded for now
        const translation: TranslationConnection =
            model.translation?.provider === "poeditor" && model.translation?.project
                ? (model.translation as TranslationConnection)
                : { provider: "NONE" };

        return {
            ...model,
            translation,
            created: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            publicAccess: "--------",
            userAccesses: [],
            userGroupAccesses: [],
            user: defaultUser,
            lastUpdatedBy: defaultUser,
            lastTranslationSync: new Date().toISOString(),
        };
    }
}