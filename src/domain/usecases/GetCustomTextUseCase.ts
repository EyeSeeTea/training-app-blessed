import { UseCase } from "../../webapp/CompositionRoot";
import { ConfigRepository } from "../repositories/ConfigRepository";
import { CustomText } from "../entities/CustomText";

export class GetCustomTextUseCase implements UseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(): Promise<Partial<CustomText>> {
        return await this.configRepository.getCustomText();
    }
}
