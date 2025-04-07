import { isEmpty, merge, omitBy } from "lodash";

import { UseCase } from "../../webapp/CompositionRoot";
import { ConfigRepository } from "../repositories/ConfigRepository";
import { Config, getDefaultConfig } from "../entities/Config";
import { Maybe } from "../../types/utils";

export class GetConfigUseCase implements UseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(): Promise<Config> {
        const config = await this.configRepository.get();
        return getMergedConfig(config);
    }
}

export function getMergedConfig(config: Maybe<Partial<Config>>): Config {
    const cleanCustomText = omitBy(config?.customText, value => value === null);
    const defaultConfig = getDefaultConfig({ isDefault: isEmpty(cleanCustomText) ? true : null });
    return merge({}, defaultConfig, {
        ...config,
        customText: cleanCustomText,
    });
}
