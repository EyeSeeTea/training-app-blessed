import { UseCase } from "../../webapp/CompositionRoot";
import { TrainingModule } from "../entities/TrainingModule";
import { GetModuleOptions, TrainingModuleRepository } from "../repositories/TrainingModuleRepository";

export class GetModuleUseCase implements UseCase {
    constructor(private trainingModuleRepository: TrainingModuleRepository) {}

    public async execute(id: string, options: GetModuleOptions): Promise<TrainingModule | undefined> {
        return this.trainingModuleRepository.get(id, options);
    }
}
