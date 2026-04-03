
import { EntityPlan, EntitySouscription, EntitySouscrireInput } from "../entities/entity_plan";

/**
 * PlanRepository defines the contract for accessing plan/subscription data.
 */
export interface PlanRepository {
    getPlans(): Promise<EntityPlan[]>;
    souscrire(input: EntitySouscrireInput): Promise<EntitySouscription | null>;
    getMonAbonnement(): Promise<EntitySouscription | null>;
}
