import { isEmpty, isEqual } from "lodash";

import { UseCase } from "../../webapp/CompositionRoot";
import { ConfigRepository } from "../repositories/ConfigRepository";
import { Maybe } from "../../types/utils";
import { CustomText, getDefaultCustomText } from "../entities/CustomText";
import { TranslatableText } from "../entities/TranslatableText";
import { getMergedConfig } from "./GetConfigUseCase";

export type CustomTextForm = {
    rootTitle?: Maybe<TranslatableText>;
    rootSubtitle?: Maybe<TranslatableText>;
};

export class SaveConfigUseCase implements UseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(config: Partial<any>): Promise<any> {
        const { customText, ...rest } = config;

        const configUpdates = {
            ...rest,
            ...(config.customText && { customText: this.cleanCustomText(customText) }),
        };

        const newConfig = await this.configRepository.save(configUpdates);
        return getMergedConfig(newConfig);
    }

    private cleanCustomText(customText: Partial<CustomText>): CustomTextForm {
        const defaultCustomText = getDefaultCustomText();

        return Object.entries(customText).reduce((acc, [key, value]) => {
            if (isEmpty(value)) return acc;
            else if (isEqual(value, defaultCustomText[key as keyof CustomText]) || !value.referenceValue)
                return { ...acc, [key]: undefined };
            else return { ...acc, [key]: value };
        }, {});
    }
}
