import { UseCase } from "../../webapp/CompositionRoot";
import { TranslableTextRepository } from "../repositories/TranslableTextRepository";
import { buildTranslationMap } from "../entities/TranslatableText";
import _ from "lodash";

export class ImportTranslationsUseCase implements UseCase {
    constructor(private translationRepository: TranslableTextRepository) {}

    public async execute(language: string, terms: Record<string, string>, id?: string): Promise<number> {
        const texts = await this.translationRepository.importTranslations(language, terms, id);
        const translations = buildTranslationMap(texts);
        return _.intersection(_.keys(translations["en"]), _.keys(terms)).length;
    }
}
