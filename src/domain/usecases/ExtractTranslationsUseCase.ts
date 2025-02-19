import { UseCase } from "../../webapp/CompositionRoot";
import { TranslableTextRepository } from "../repositories/TranslableTextRepository";
import { buildTranslationMap, Translations } from "../entities/TranslatableText";

export class ExtractTranslationsUseCase implements UseCase {
    constructor(private translationRepository: TranslableTextRepository) {}

    public async execute(id?: string): Promise<Translations> {
        const texts = await this.translationRepository.extractTranslations(id);
        return buildTranslationMap(texts);
    }
}
