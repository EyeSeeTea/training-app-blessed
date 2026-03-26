import _ from "lodash";

import { TrainingModulePage } from "../../domain/entities/TrainingModule";
import {
    EventType,
    getEventBindingIdentifiers,
    isEventBinding,
    isSectionBinding,
    matchesUrlPattern,
} from "../../domain/entities/PageBinding";
import { D2Api } from "../../types/d2-api";

export type EventPageIdsByTrainingId = Record<string, Record<string, string[]>>;

export function getEventPageIdsByTrainingIdMap(
    pages: TrainingModulePage[],
    validEventSet: Set<EventType>
): EventPageIdsByTrainingId {
    return _(pages)
        .flatMap(({ bindings, id }) => bindings.filter(isEventBinding).map(binding => ({ binding, pageId: id })))
        .filter(({ binding }) => binding.eventType === "all" || validEventSet.has(binding.eventType))
        .flatMap(({ binding, pageId }) =>
            getEventBindingIdentifiers(binding).map(pageIdentifier => ({
                pageIdentifier,
                pageId,
                eventType: binding.eventType,
            }))
        )
        .groupBy(({ eventType }) => eventType)
        .mapValues(items =>
            _(items)
                .groupBy(({ pageIdentifier }) => pageIdentifier)
                .mapValues(peArr => peArr.map(pe => pe.pageId))
                .value()
        )
        .value();
}

export function getSectionPageIds(currentUrl: string, pages: TrainingModulePage[]): string[] {
    return _(pages)
        .flatMap(({ bindings, id }) => bindings.filter(isSectionBinding).map(binding => ({ ...binding, pageId: id })))
        .filter(({ urlPattern }) => matchesUrlPattern(currentUrl, urlPattern))
        .map(({ pageId }) => pageId)
        .value();
}

export function generateSettingsUrl(baseUrl: string, appKey: string) {
    return `${generateTrainingAppBaseUrl(baseUrl, appKey)}/index.html#/settings?showInteractiveTrainingConfig`;
}

export function generateTrainingAppBaseUrl(baseUrl: string, appKey: string) {
    return `${baseUrl}/api/apps/${appKey}`;
}

export function transformD2Urls(content: string, d2Api: D2Api, appKey: string): string {
    return content
        .replace(/\.\.\/..\/(documents\/[^)\s"']+)/g, `${d2Api.apiPath}/$1`)
        .replace(/(img\/[^)\s"']+)/g, `${generateTrainingAppBaseUrl(d2Api.baseUrl, appKey)}/$1`);
}

export function updateIconDocumentUrls<T extends { icon: string; children?: T[] }>(
    entities: T[],
    d2Api: D2Api,
    appKey: string
): T[] {
    return entities.map(entity => ({
        ...entity,
        icon: transformD2Urls(entity.icon, d2Api, appKey),
        children: entity.children ? updateIconDocumentUrls(entity.children, d2Api, appKey) : undefined,
    }));
}
