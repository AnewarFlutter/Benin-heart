
import { EntityPlan, EntitySouscription, EntitySouscrireInput } from "../../domain/entities/entity_plan";
import { PlanRepository } from "../../domain/repositories/plan_repository";
import { PlanDataSource } from "../datasources/plan_data_source";

/**
 * PlanRepositoryImpl implements PlanRepository by delegating to PlanDataSource.
 */
export class PlanRepositoryImpl implements PlanRepository {

    constructor(private readonly datasource: PlanDataSource) {}

    async getPlans(): Promise<EntityPlan[]> {
        try {
            const data = await this.datasource.getPlans();
            return data.map((m) => m.toEntity());
        } catch (e) {
            throw e;
        }
    }

    async souscrire(input: EntitySouscrireInput): Promise<EntitySouscription | null> {
        try {
            const data = await this.datasource.souscrire(input);
            return data ? data.toEntity() : null;
        } catch (e) {
            throw e;
        }
    }

    async getMonAbonnement(): Promise<EntitySouscription | null> {
        try {
            const data = await this.datasource.getMonAbonnement();
            return data ? data.toEntity() : null;
        } catch (e) {
            throw e;
        }
    }
}
