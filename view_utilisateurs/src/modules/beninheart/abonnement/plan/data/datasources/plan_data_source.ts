
import { ModelPlan, ModelSouscription } from "../models/model_plan";
import { EntitySouscrireInput } from "../../domain/entities/entity_plan";

/**
 * PlanDataSource defines the contract for plan/subscription data access.
 */
export interface PlanDataSource {
    getPlans(): Promise<ModelPlan[]>;
    souscrire(input: EntitySouscrireInput): Promise<ModelSouscription | null>;
    getMonAbonnement(): Promise<ModelSouscription | null>;
}
