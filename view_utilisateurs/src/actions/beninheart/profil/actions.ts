"use server";

import { featuresDi } from "@/di/features_di";
import { EntityProfilPublic } from "@/modules/beninheart/profil/profil/domain/entities/entity_profil";
import { AppActionResult } from "@/shared/types/global";

/**
 * Retrieves the list of public profiles for swipe (authenticated endpoint).
 * Note: token is read from auth store — must be called from a client context.
 */
export async function getProfilsAction(): Promise<AppActionResult<EntityProfilPublic[]>> {
    const profils = await featuresDi.profilController.getProfils();
    return {
        success: true,
        message: "Profils retrieved.",
        data: profils,
    };
}
