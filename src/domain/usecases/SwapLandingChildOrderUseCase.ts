import { UseCase } from "../../webapp/CompositionRoot";
import { LandingNode } from "../entities/LandingPage";
import { LandingPageRepository } from "../repositories/LandingPageRepository";

export class SwapLandingChildOrderUseCase implements UseCase {
    constructor(private landingPagesRepository: LandingPageRepository) {}

    public async execute(node1: LandingNode, node2: LandingNode): Promise<void> {
        const updatedNodes = [
            { ...node1, order: node2.order },
            { ...node2, order: node1.order },
        ];

        return this.landingPagesRepository.update(updatedNodes);
    }
}
