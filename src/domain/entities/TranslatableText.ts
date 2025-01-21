import { GetSchemaType, Schema } from "../../utils/codec";
import _ from "lodash";

export const TranslatableTextModel = Schema.object({
    key: Schema.string,
    referenceValue: Schema.string,
    translations: Schema.dictionary(Schema.string, Schema.string),
});

export type TranslatableText = GetSchemaType<typeof TranslatableTextModel>;

export const buildTranslate = (locale: string): TranslateMethod => {
    return (text: TranslatableText): string => {
        const translations = text.translations ?? {};
        return translations[locale] || text.referenceValue;
    };
};

export type TranslateMethod = (string: TranslatableText) => string;

export const setTranslationValue = <T extends TranslatableText>(item: T, language: string, term: string | undefined): T => {
    if (term === undefined) {
        return item;
    } else if (language === "en") {
        return { ...item, referenceValue: term };
    } else {
        return { ...item, translations: { ...item.translations, [language]: term } };
    }
};

export const buildTranslationMap = (texts: TranslatableText[]) => {
    const referenceStrings = _.fromPairs(texts.map(({ key, referenceValue }) => [key, referenceValue]));
    const translatedStrings = _(texts)
        .flatMap(({ key, translations }) => _.toPairs(translations).map(([lang, value]) => ({ lang, key, value })))
        .groupBy("lang")
        .mapValues(array => _.fromPairs(array.map(({ key, value }) => [key, value])))
        .value();

    return { ...translatedStrings, en: referenceStrings };
};
