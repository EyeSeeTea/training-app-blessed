import { isEmpty, isEqual, merge } from "lodash";

import { UseCase } from "../../webapp/CompositionRoot";
import { ConfigRepository } from "../repositories/ConfigRepository";
import { getDefaultConfig } from "../entities/Config";
import { Maybe } from "../../types/utils";
import { CustomText, getDefaultCustomText } from "../entities/CustomText";
import { TranslatableText } from "../entities/TranslatableText";

export class SaveConfigUseCase implements UseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(config: Partial<any>): Promise<any> {
        const defaultConfig = getDefaultConfig();
        const savedConfig = await this.configRepository.get(); // Fetch the saved config
        const { customText, ...rest } = this.cleanUpdatedConfig(config, savedConfig, defaultConfig);
        const configUpdates = {
            ...rest,
            ...(customText && !isEmpty(customText) ? { customText: this.cleanCustomText(customText) } : {}),
        };

        const newConfig = await this.configRepository.save(configUpdates);
        return merge({}, defaultConfig, newConfig);
    }

    private cleanUpdatedConfig<T>(
        updatedConfig: Partial<T>,
        savedConfig: Maybe<Partial<T>>,
        defaultConfig: T
    ): Partial<T> {
        return Object.fromEntries(
            Object.entries(updatedConfig)
                .map(([key, value]) => {
                    const typedKey = key as keyof T;
                    const savedValue = savedConfig?.[typedKey];
                    const defaultValue = defaultConfig[typedKey];

                    if (
                        typeof value === "object" &&
                        value !== null &&
                        typeof defaultValue === "object" &&
                        defaultValue !== null
                    ) {
                        const cleaned = this.cleanUpdatedConfig(value, savedValue, defaultValue);
                        return isEmpty(cleaned) ? [] : [[typedKey, cleaned]];
                    }

                    if (savedValue === undefined) {
                        return isEqual(value, defaultValue) ? [] : [[typedKey, value]];
                    }

                    return [[typedKey, value]];
                })
                .flat()
        ) as Partial<T>;
    }

    private cleanCustomText(customText: Partial<CustomText>): Partial<CustomText> {
        const defaultCustomText = getDefaultCustomText(); // assuming this provides default values

        return {
            ...(customText.rootTitle && {
                rootTitle: this.cleanTranslatableText(customText.rootTitle, defaultCustomText.rootTitle),
            }),
            ...(customText.rootSubtitle && {
                rootSubtitle: this.cleanTranslatableText(customText.rootSubtitle, defaultCustomText.rootSubtitle),
            }),
        };
    }

    private cleanTranslatableText(
        customText: Partial<TranslatableText> | undefined,
        defaultText: TranslatableText
    ): TranslatableText {
        return {
            key: customText?.key || defaultText.key,
            referenceValue: customText?.referenceValue || defaultText.referenceValue,
            translations: customText?.translations || defaultText.translations,
        };
    }
}
