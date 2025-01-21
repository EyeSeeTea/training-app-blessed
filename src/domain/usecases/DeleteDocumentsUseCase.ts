import { UseCase } from "../../webapp/CompositionRoot";
import { InstanceRepository } from "../repositories/InstanceRepository";
import { DocumentRepository } from "../repositories/DocumentRepository";

export class DeleteDocumentsUseCase implements UseCase {
    constructor(private documentRepository: DocumentRepository) {}

    public async execute(ids: string[]): Promise<void> {
        return this.documentRepository.delete(ids);
    }
}
