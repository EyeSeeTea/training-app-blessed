import { UseCase } from "../../webapp/CompositionRoot";
import { ConfigRepository } from "../repositories/ConfigRepository";

export class SetLogoUseCase implements UseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(logo: string): Promise<void> {
        return this.configRepository.setLogo(logo);
    }
}
