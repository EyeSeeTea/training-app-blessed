import { merge } from "lodash";

import { UseCase } from "../../webapp/CompositionRoot";
import { ConfigRepository } from "../repositories/ConfigRepository";
import { Config, getDefaultConfig } from "../entities/Config";

export class GetConfigUseCase implements UseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(): Promise<Config> {
        const config = await this.configRepository.get();
        const defaultConfig = getDefaultConfig({ isDefault: config.customText ? null : true });
        return merge({}, defaultConfig, config);
    }
}
