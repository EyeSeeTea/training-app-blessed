import i18n from "../locales";

export function getModuleForNamespace(namespace: string) {
    return {
        t: function <Str extends string>(...args: I18nTArgs<Str>): string {
            const [s, options] = args;
            return i18n.t(s, { ...options, ns: namespace });
        },
        changeLanguage: i18n.changeLanguage.bind(i18n),
    };
}

type I18nTArgs<Str extends string> = Interpolations<Str> extends Record<string, never>
    ? [Str] | [Str, Partial<Options>]
    : [Str, Interpolations<Str> & Partial<Options>];

interface Options {
    ns: string; // namespace
    nsSeparator: string | boolean; // By default, ":", which breaks strings containing that char
    lng: string; // language
}

type Interpolations<Str extends string> = Record<ExtractVars<Str>, string | number>;

type ExtractVars<Str extends string> = Str extends `${string}{{${infer Var}}}${infer StrRest}`
    ? Var | ExtractVars<StrRest>
    : never;

/* Tests */

type IsEqual<T1, T2> = [T1] extends [T2] ? ([T2] extends [T1] ? true : false) : false;
const assertEqualTypes = <T1, T2>(_eq: IsEqual<T1, T2>): void => {};

assertEqualTypes<ExtractVars<"">, never>(true);
assertEqualTypes<ExtractVars<"name={{name}}">, "name">(true);
assertEqualTypes<ExtractVars<"name={{name}} age={{age}}">, "name" | "age">(true);
