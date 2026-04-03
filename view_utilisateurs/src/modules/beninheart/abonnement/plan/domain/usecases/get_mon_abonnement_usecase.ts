
import { EntitySouscription } from "../entities/entity_plan";
import { PlanRepository } from "../repositories/plan_repository";

/**
 * GetMonAbonnementUseCase retrieves the authenticated user's active subscription.
 */
export class GetMonAbonnementUseCase {
    constructor(private readonly repository: PlanRepository) {}

    async execute(): Promise<EntitySouscription | null> {
        return this.repository.getMonAbonnement();
    }
}
