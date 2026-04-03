
import { EntityPlan } from "../entities/entity_plan";
import { PlanRepository } from "../repositories/plan_repository";

/**
 * GetPlansUseCase retrieves the list of subscription plans.
 */
export class GetPlansUseCase {
    constructor(private readonly repository: PlanRepository) {}

    async execute(): Promise<EntityPlan[]> {
        return this.repository.getPlans();
    }
}
