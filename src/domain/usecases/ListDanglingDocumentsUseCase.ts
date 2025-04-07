import _ from "lodash";

import { UseCase } from "../../webapp/CompositionRoot";
import { DocumentRepository } from "../repositories/DocumentRepository";
import { getUrls } from "../../utils/urls";
import { extractUids } from "../../data/utils/uid";
import { TrainingModule } from "../entities/TrainingModule";
import { LandingNode } from "../entities/LandingPage";
import { Config } from "../entities/Config";
import { NamedRef } from "../entities/Ref";

export class ListDanglingDocumentsUseCase implements UseCase {
    constructor(private documentRepository: DocumentRepository) {}

    public async execute(data: (TrainingModule | LandingNode | Config)[]): Promise<NamedRef[]> {
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
