import { UseCase } from "../../webapp/CompositionRoot";
import { ConfigRepository } from "../repositories/ConfigRepository";
import { Config } from "../entities/Config";

export class SaveConfigUseCase implements UseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(config: Config): Promise<Config> {
        return this.configRepository.save(config);
    }
}
