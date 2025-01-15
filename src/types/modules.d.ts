declare module "@dhis2/d2-i18n" {
    export const language: string;
    export function t(value: string, namespace?: object): string;
    export function changeLanguage(locale: string);
    export function setDefaultNamespace(namespace: string);
}

declare module "d2" {
    import { D2 } from "./d2";

    export function init(config: { baseUrl: string; headers?: any; schemas?: string[] }): D2;
    export function generateUid(): string;
}
