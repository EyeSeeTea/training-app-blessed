import { UseCase } from "../../webapp/CompositionRoot";
import { ImportExportTranslationRepository } from "../repositories/ImportExportTranslationRepository";
import { buildTranslationMap } from "../entities/TranslatableText";

export class ExtractTranslationsUseCase implements UseCase {
    constructor(private translationRepository: ImportExportTranslationRepository) {}

    public async execute(id?: string): Promise<Record<string, Record<string, string>>> {
        const texts = await this.translationRepository.extractTranslatations(id);
        return buildTranslationMap(texts);
    }
}
