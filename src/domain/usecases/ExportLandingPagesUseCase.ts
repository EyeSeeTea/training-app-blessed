import { UseCase } from "../../webapp/CompositionRoot";
import { LandingPageRepository } from "../repositories/LandingPageRepository";

export class ExportLandingPagesUseCase implements UseCase {
    constructor(private landingPageRepository: LandingPageRepository) {}

    public async execute(ids: string[]): Promise<void> {
        return this.landingPageRepository.export(ids);
    }
}
