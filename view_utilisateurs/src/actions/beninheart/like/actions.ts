"use server";

import { featuresDi } from "@/di/features_di";
import { EntityLikeResult, TypeSwipe } from "@/modules/beninheart/like/like/domain/entities/entity_like";
import { AppActionResult } from "@/shared/types/global";

/**
 * Sends a swipe action (like/superlike/dislike) on a profile.
 */
export async function swipeAction(profilUuid: string, typeAction: TypeSwipe): Promise<AppActionResult<EntityLikeResult | null>> {
    const result = await featuresDi.likeController.swipe(profilUuid, typeAction);
    return {
        success: result !== null,
        message: result ? "Swipe recorded." : "Swipe failed.",
        data: result,
    };
}
