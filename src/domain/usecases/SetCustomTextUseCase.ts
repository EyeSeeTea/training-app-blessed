import { UseCase } from "../../webapp/CompositionRoot";
import { ConfigRepository } from "../repositories/ConfigRepository";
import { CustomText } from "../entities/CustomText";

export class SetCustomTextUseCase implements UseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(update: Partial<CustomText>): Promise<void> {
        return this.configRepository.setCustomText(update);
    }
}
