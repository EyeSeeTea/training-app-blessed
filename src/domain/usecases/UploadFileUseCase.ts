import { UseCase } from "../../webapp/CompositionRoot";
import { DocumentRepository } from "../repositories/DocumentRepository";

export class UploadFileUseCase implements UseCase {
    constructor(private documentRepository: DocumentRepository) {}

    public async execute(data: ArrayBuffer, name: string): Promise<string> {
        return this.documentRepository.uploadFile(data, { name });
    }
}
