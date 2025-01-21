import { UseCase } from "../../webapp/CompositionRoot";
import { NamedRef } from "../entities/Ref";
import { DocumentRepository } from "../repositories/DocumentRepository";
import _ from "lodash";
import { getUrls } from "../../utils/urls";
import { extractUids } from "../../data/utils/uid";

export class ListDanglingDocumentsUseCase implements UseCase {
    constructor(private documentRepository: DocumentRepository) {}

    public async execute(data: unknown): Promise<NamedRef[]> {
        if (!data) return [];

        const allFiles = await this.documentRepository.get();

        const allUids = allFiles.map(({ id }) => id);
        const validUids = _.flatten([...getUrls([data])].map(url => extractUids(url)));

        return _(allUids)
            .difference(validUids)
            .map(id => allFiles.find(file => file.id === id))
            .compact()
            .value();
    }
}
