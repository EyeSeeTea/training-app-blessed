import { UseCase } from "../../webapp/CompositionRoot";
import { ConfigRepository } from "../repositories/ConfigRepository";
import { User } from "../../data/entities/User";

export class GetCurrentUserUseCase implements UseCase {
    constructor(private configRepository: ConfigRepository) {}

    public async execute(): Promise<User> {
        return this.configRepository.getUser();
    }
}
