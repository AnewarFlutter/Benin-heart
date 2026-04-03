
import { EntitySouscription, EntitySouscrireInput } from "../entities/entity_plan";
import { PlanRepository } from "../repositories/plan_repository";

/**
 * SouscrireUseCase creates a new subscription for the authenticated user.
 */
export class SouscrireUseCase {
    constructor(private readonly repository: PlanRepository) {}

    async execute(input: EntitySouscrireInput): Promise<EntitySouscription | null> {
        return this.repository.souscrire(input);
    }
}
