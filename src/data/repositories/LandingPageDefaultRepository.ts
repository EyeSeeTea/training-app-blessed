import _ from "lodash";

import { LandingNode, LandingNodeModel } from "../../domain/entities/LandingPage";
import { setTranslationValue, TranslatableText } from "../../domain/entities/TranslatableText";
import { LandingPageRepository } from "../../domain/repositories/LandingPageRepository";
import { ImportExportClient } from "../clients/importExport/ImportExportClient";
import { DataStoreStorageClient } from "../clients/storage/DataStoreStorageClient";
import { Namespaces } from "../clients/storage/Namespaces";
import { StorageClient } from "../clients/storage/StorageClient";
import { PersistedLandingPage } from "../entities/PersistedLandingPage";
import { generateUid } from "../utils/uid";
import { D2Api } from "../../types/d2-api";
import { DocumentRepository } from "../../domain/repositories/DocumentRepository";
import { Either } from "../../domain/entities/Either";
import { fromPurify } from "../utils/either";
import { SharedProperties } from "../../domain/entities/Ref";

export class LandingPageDefaultRepository implements LandingPageRepository {
    private storageClient: StorageClient;
    private importExportClient: ImportExportClient;

    constructor(api: D2Api, documentRepository: DocumentRepository) {
        this.storageClient = new DataStoreStorageClient("global", api);
        this.importExportClient = new ImportExportClient(api, documentRepository, "landing-pages");
    }

    public async list(): Promise<LandingNode[]> {
        try {
            const persisted = await this._list();

            const roots = persisted.filter(({ parent }) => parent === "none");

            if (!persisted.length || !roots.length) {
                const defaultRoot = await this.saveDefaultLandingPage();
                return [buildDomainLandingNode(defaultRoot, [])];
            }

            const validations = roots.map(root => {
                const node = buildDomainLandingNode(root, _.flatten(persisted));
                const purifyEither = LandingNodeModel.decode(node);
                return fromPurify(purifyEither);
            });

            return Either.sequence(validations).match({
                success: nodes => nodes,
                error: error => {
                    console.error(error);
                    throw new Error(error);
                },
            });
        } catch (error: any) {
            console.error(error);
            return [];
        }
    }

    private async _list(ids?: string[]): Promise<PersistedLandingPage[]> {
        const pages = await this.storageClient.listObjectsInCollection<PersistedLandingPage>(Namespaces.LANDING_PAGES);

        const pageParentMap = _(pages)
            .groupBy(page => page.parent)
            .value();

        if (!ids) {
            return pages;
        } else {
            return _(pages)
                .filter(({ id }) => ids.includes(id))
                .flatMap(page => [page, ...this.getAllDescendants(page.id, pageParentMap)])
                .uniqBy(page => page.id)
                .value();
        }
    }

    private getAllDescendants(
        parentId: string,
        parentMap: Record<string, PersistedLandingPage[]>
    ): PersistedLandingPage[] {
        const children = parentMap[parentId] || [];
        return children.flatMap(child => [child, ...this.getAllDescendants(child.id, parentMap)]);
    }

    public async export(ids: string[]): Promise<void> {
        const toExport = await this._list(ids);
        return this.importExportClient.export(toExport);
    }

    public async import(files: File[]): Promise<PersistedLandingPage[]> {
        const items = await this.importExportClient.import<PersistedLandingPage>(files);
        await this.storageClient.saveObjectsInCollection(Namespaces.LANDING_PAGES, items);

        return items;
    }

    public async update(nodes: LandingNode[]): Promise<void> {
        const updatedNodes = nodes.map(node => extractChildrenNodes(node, node.parent)).flat();
        await this.storageClient.saveObjectsInCollection<PersistedLandingPage>(Namespaces.LANDING_PAGES, updatedNodes);
    }

    public async delete(ids: string[]): Promise<void> {
        const nodes = await this._list(ids);
        const toDelete = nodes.map(node => node.id);

        await this.storageClient.removeObjectsInCollection(Namespaces.LANDING_PAGES, toDelete);
    }

    public async extractTranslations(id: string): Promise<TranslatableText[]> {
        const nodes = await this._list([id]);
        if (!nodes.length) throw new Error(`Unable to load landing pages`);
        return this.extractTranslatableText(nodes);
    }

    private extractTranslatableText(models: PersistedLandingPage[]): TranslatableText[] {
        return _.flatMap(models, model => _.compact([model.name, model.title, model.content]));
    }

    public async importTranslations(language: string, terms: Record<string, string>): Promise<TranslatableText[]> {
        const models = await this.storageClient.getObject<PersistedLandingPage[]>(Namespaces.LANDING_PAGES);
        if (!models) throw new Error(`Unable to load landing pages`);

        const translatedModels: PersistedLandingPage[] = models.map(model => ({
            ...model,
            name: setTranslationValue(model.name, language, terms[model.name.key]),
            title: model.title ? setTranslationValue(model.title, language, terms[model.title.key]) : undefined,
            content: model.content ? setTranslationValue(model.content, language, terms[model.content.key]) : undefined,
        }));

        await this.storageClient.saveObjectsInCollection<PersistedLandingPage>(
            Namespaces.LANDING_PAGES,
            translatedModels
        );

        return this.extractTranslatableText(translatedModels);
    }

    private async saveDefaultLandingPage(): Promise<PersistedLandingPage> {
        await this.storageClient.saveObjectInCollection<PersistedLandingPage>(Namespaces.LANDING_PAGES, defaultRoot);
        return defaultRoot;
    }
}

const defaultPermissions: SharedProperties = {
    publicAccess: "r-------",
    userAccesses: [],
    userGroupAccesses: [],
};

export const defaultRoot: PersistedLandingPage = {
    id: generateUid(),
    parent: "none",
    type: "root",
    icon: "",
    order: undefined,
    name: {
        key: "root-name",
        referenceValue: "Landing page",
        translations: {},
    },
    title: undefined,
    content: undefined,
    modules: [],
    permissions: defaultPermissions,
};

const buildDomainLandingNode = (root: PersistedLandingPage, items: PersistedLandingPage[]): LandingNode => {
    return {
        ...root,
        permissions: root.permissions ?? defaultPermissions,
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
