"use server";

import { featuresDi } from "@/di/features_di";
import { EntityPlan } from "@/modules/beninheart/abonnement/plan/domain/entities/entity_plan";
import { AppActionResult } from "@/shared/types/global";

/**
 * Retrieves the list of subscription plans (public endpoint).
 */
export async function getPlansAction(): Promise<AppActionResult<EntityPlan[]>> {
    const plans = await featuresDi.planController.getPlans();
    return {
        success: plans.length >= 0,
        message: "Plans retrieved.",
        data: plans,
    };
}
