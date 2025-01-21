import _ from "lodash";
import { LandingNode, LandingNodeModel } from "../../domain/entities/LandingPage";
import { importTranslate, TranslatableText } from "../../domain/entities/TranslatableText";
import { ConfigRepository } from "../../domain/repositories/ConfigRepository";
import { InstanceRepository } from "../../domain/repositories/InstanceRepository";
import { LandingPageRepository } from "../../domain/repositories/LandingPageRepository";
import { ImportExportClient } from "../clients/importExport/ImportExportClient";
import { DataStoreStorageClient } from "../clients/storage/DataStoreStorageClient";
import { Namespaces } from "../clients/storage/Namespaces";
import { StorageClient } from "../clients/storage/StorageClient";
import { PersistedLandingPage } from "../entities/PersistedLandingPage";
import { generateUid } from "../utils/uid";

export class LandingPageDefaultRepository implements LandingPageRepository {
    private storageClient: StorageClient;
    private importExportClient: ImportExportClient;

    constructor(config: ConfigRepository, instanceRepository: InstanceRepository) {
        this.storageClient = new DataStoreStorageClient("global", config.getInstance());
        this.importExportClient = new ImportExportClient(instanceRepository, "landing-pages");
    }

    public async list(): Promise<LandingNode[]> {
        try {
            const persisted = await this.storageClient.listObjectsInCollection<PersistedLandingPage>(
                Namespaces.LANDING_PAGES
            );

            const root = persisted?.find(({ parent }) => parent === "none");

            if (persisted.length === 0 || !root) {
                const root = {
                    id: generateUid(),
                    parent: "none",
                    type: "root" as const,
                    icon: "",
                    order: undefined,
                    name: {
                        key: "root-name",
                        referenceValue: "Main landing page",
                        translations: {},
                    },
                    title: undefined,
                    content: undefined,
                    modules: [],
                };

                await this.storageClient.saveObjectInCollection<PersistedLandingPage>(Namespaces.LANDING_PAGES, root);
                return [{ ...root, children: [] }];
            }

            const validation = LandingNodeModel.decode(buildDomainLandingNode(root, persisted));

            if (validation.isLeft()) {
                throw new Error(validation.extract());
            }

            return _.compact([validation.toMaybe().extract()]);
        } catch (error: any) {
            console.error(error);
            return [];
        }
    }

    public async export(ids: string[]): Promise<void> {
        const nodes = await this.storageClient.listObjectsInCollection<PersistedLandingPage>(Namespaces.LANDING_PAGES);
        const toExport = _(nodes)
            .filter(({ id }) => ids.includes(id))
            .flatMap(node => extractChildrenNodes(buildDomainLandingNode(node, nodes), node.parent))
            .flatten()
            .value();

        return this.importExportClient.export(toExport);
    }

    public async import(files: File[]): Promise<PersistedLandingPage[]> {
        const items = await this.importExportClient.import<PersistedLandingPage>(files);
        // TODO: Do not overwrite existing landing page
        await this.storageClient.saveObject(Namespaces.LANDING_PAGES, items);

        return items;
    }

    public async updateChild(node: LandingNode): Promise<void> {
        const updatedNodes = extractChildrenNodes(node, node.parent);
        await this.storageClient.saveObjectsInCollection<PersistedLandingPage>(Namespaces.LANDING_PAGES, updatedNodes);
    }

    public async removeChilds(ids: string[]): Promise<void> {
        const nodes = await this.storageClient.listObjectsInCollection<PersistedLandingPage>(Namespaces.LANDING_PAGES);
        const toDelete = _(nodes)
            .filter(({ id }) => ids.includes(id))
            .map(node => LandingNodeModel.decode(buildDomainLandingNode(node, nodes)).toMaybe().extract())
            .compact()
            .flatMap(node => [node.id, extractChildrenNodes(node, node.parent).map(({ id }) => id)])
            .flatten()
            .value();

        await this.storageClient.removeObjectsInCollection(Namespaces.LANDING_PAGES, toDelete);
    }

    public async extractTranslations(): Promise<TranslatableText[]> {
        const models = await this.storageClient.getObject<PersistedLandingPage[]>(Namespaces.LANDING_PAGES);
        if (!models) throw new Error(`Unable to load landing pages`);

        return this.extractTranslatableText(models);
    }

    private extractTranslatableText(models: PersistedLandingPage[]): TranslatableText[] {
        return _.flatMap(models, model => _.compact([model.name, model.title, model.content]));
    }

    public async importTranslations(language: string, terms: Record<string, string>): Promise<TranslatableText[]> {
        const models = await this.storageClient.getObject<PersistedLandingPage[]>(Namespaces.LANDING_PAGES);
        if (!models) throw new Error(`Unable to load landing pages`);

        const translatedModels: PersistedLandingPage[] = models.map(model => ({
            ...model,
            name: importTranslate(model.name, language, terms[model.name.key]),
            title: model.title ? importTranslate(model.title, language, terms[model.title.key]) : undefined,
            content: model.content ? importTranslate(model.content, language, terms[model.content.key]) : undefined,
        }));

        await this.storageClient.saveObject<PersistedLandingPage[]>(Namespaces.LANDING_PAGES, translatedModels);

        return this.extractTranslatableText(models);
    }

    public async swapOrder(node1: LandingNode, node2: LandingNode) {
        await this.storageClient.saveObjectsInCollection(Namespaces.LANDING_PAGES, [
            { ...node1, order: node2.order },
            { ...node2, order: node1.order },
        ]);
    }
}

const buildDomainLandingNode = (root: PersistedLandingPage, items: PersistedLandingPage[]): LandingNode => {
    return {
        ...root,
        children: _(items)
            .filter(({ parent }) => parent === root.id)
            .sortBy(item => item.order ?? 1000)
            .map((node, order) => ({ ...buildDomainLandingNode(node, items), order }))
            .value(),
    };
};

const extractChildrenNodes = (node: BaseNode, parent: string): PersistedLandingPage[] => {
    const { children, ...props } = node;
    const childrenNodes = _.flatMap(children, child => (child ? extractChildrenNodes(child, node.id) : []));

    return [{ ...props, parent } as PersistedLandingPage, ...childrenNodes];
};

interface BaseNode {
    id: string;
    children: (BaseNode | undefined)[];
}
