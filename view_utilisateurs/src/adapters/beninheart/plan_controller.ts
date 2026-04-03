
import { EntityPlan, EntitySouscription, EntitySouscrireInput } from "@/modules/beninheart/abonnement/plan/domain/entities/entity_plan";
import { GetMonAbonnementUseCase } from "@/modules/beninheart/abonnement/plan/domain/usecases/get_mon_abonnement_usecase";
import { GetPlansUseCase } from "@/modules/beninheart/abonnement/plan/domain/usecases/get_plans_usecase";
import { SouscrireUseCase } from "@/modules/beninheart/abonnement/plan/domain/usecases/souscrire_usecase";

/**
 * PlanController is the adapter for subscription plan operations.
 */
export class PlanController {

    constructor(
        private readonly getPlansUseCase: GetPlansUseCase,
        private readonly souscrireUseCase: SouscrireUseCase,
        private readonly getMonAbonnementUseCase: GetMonAbonnementUseCase,
    ) {}

    getPlans = async (): Promise<EntityPlan[]> => {
        try {
            return await this.getPlansUseCase.execute();
        } catch (e) {
            console.error("PlanController.getPlans error:", e);
            return [];
        }
    };

    souscrire = async (input: EntitySouscrireInput): Promise<EntitySouscription | null> => {
        try {
            return await this.souscrireUseCase.execute(input);
        } catch (e) {
            console.error("PlanController.souscrire error:", e);
            return null;
        }
    };

    getMonAbonnement = async (): Promise<EntitySouscription | null> => {
        try {
            return await this.getMonAbonnementUseCase.execute();
        } catch (e) {
            console.error("PlanController.getMonAbonnement error:", e);
            return null;
        }
    };
}
