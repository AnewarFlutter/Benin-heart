"use server";

import { featuresDi } from "@/di/features_di";
import { EntityProfilPublic, EntityMonProfil } from "@/modules/beninheart/profil/profil/domain/entities/entity_profil";
import { AppActionResult } from "@/shared/types/global";

export async function getProfilsAction(): Promise<AppActionResult<EntityProfilPublic[]>> {
    try {
        const data = await featuresDi.profilController.getProfils();
        return { success: true, data };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Erreur profils' };
    }
}

export async function getMonProfilAction(): Promise<AppActionResult<EntityMonProfil | null>> {
    try {
        const data = await featuresDi.profilController.getMonProfil();
        return { success: true, data };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Erreur mon profil' };
    }
}

export async function updateMonProfilAction(fields: Partial<EntityMonProfil>): Promise<AppActionResult<EntityMonProfil | null>> {
    try {
        const data = await featuresDi.profilController.updateMonProfil(fields);
        return { success: true, data };
    } catch (e) {
        return { success: false, error: e instanceof Error ? e.message : 'Erreur mise à jour profil' };
    }
}
