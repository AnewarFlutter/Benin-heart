"use server";

import { featuresDi } from "@/di/features_di";
import { EntityPlan, EntitySouscription, EntitySouscrireInput } from "@/modules/beninheart/abonnement/plan/domain/entities/entity_plan";
import { AppActionResult } from "@/shared/types/global";

export async function getPlansAction(): Promise<AppActionResult<EntityPlan[]>> {
    try {
        const data = await featuresDi.planController.getPlans();
        return { success: true, data };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Erreur plans' };
    }
}

export async function getMonAbonnementAction(): Promise<AppActionResult<EntitySouscription | null>> {
    try {
        const data = await featuresDi.planController.getMonAbonnement();
        return { success: true, data };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Erreur abonnement' };
    }
}

export async function souscrireAction(input: EntitySouscrireInput): Promise<AppActionResult<EntitySouscription | null>> {
    try {
        const data = await featuresDi.planController.souscrire(input);
        return { success: true, data };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Erreur souscription' };
    }
}
