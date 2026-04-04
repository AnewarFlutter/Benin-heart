"use server";

import { featuresDi } from "@/di/features_di";
import { EntityLikeResult, EntityMatch, EntityLikeStats, TypeSwipe } from "@/modules/beninheart/like/like/domain/entities/entity_like";
import { AppActionResult } from "@/shared/types/global";

export async function swipeAction(profilUuid: string, typeAction: TypeSwipe): Promise<AppActionResult<EntityLikeResult | null>> {
    const result = await featuresDi.likeController.swipe(profilUuid, typeAction);
    return {
        success: result !== null,
        data: result,
    };
}

export async function getMatchsAction(): Promise<AppActionResult<EntityMatch[]>> {
    try {
        const data = await featuresDi.likeController.getMatchs();
        return { success: true, data };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Erreur matchs' };
    }
}

export async function getMesLikesAction(): Promise<AppActionResult<EntityMatch[]>> {
    try {
        const data = await featuresDi.likeController.getMesLikes();
        return { success: true, data };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Erreur likes' };
    }
}

export async function getMesStatsAction(): Promise<AppActionResult<EntityLikeStats | null>> {
    try {
        const data = await featuresDi.likeController.getMesStats();
        return { success: true, data };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Erreur stats' };
    }
}
