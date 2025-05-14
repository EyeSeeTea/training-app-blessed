import { TranslatableText } from "../entities/TranslatableText";

export interface TranslableTextRepository {
    extractTranslations(id?: string): Promise<TranslatableText[]>;
    importTranslations(language: string, terms: Record<string, string>, id?: string): Promise<TranslatableText[]>;
}
