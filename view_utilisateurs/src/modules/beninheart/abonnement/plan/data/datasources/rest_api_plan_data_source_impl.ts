
import { apiClient } from "@/lib/api/api_client";
import { API_ROUTES } from "@/shared/constants/api_routes";
import { useAuthStore } from "@/stores/auth_store";
import { EntitySouscrireInput } from "../../domain/entities/entity_plan";
import { ModelPlan, ModelSouscription } from "../models/model_plan";
import { PlanDataSource } from "./plan_data_source";

const getToken = () => useAuthStore.getState().accessToken ?? undefined;

/**
 * REST API implementation of PlanDataSource.
 */
export class RestApiPlanDataSourceImpl implements PlanDataSource {

    async getPlans(): Promise<ModelPlan[]> {
        try {
            const { data, error } = await apiClient<Record<string, unknown>[]>(API_ROUTES.ABONNEMENTS.PLANS);
            if (error || !data) return [];
            return ModelPlan.fromJsonList(data);
        } catch (e) {
            console.error("getPlans error:", e);
            return [];
        }
    }

    async souscrire(input: EntitySouscrireInput): Promise<ModelSouscription | null> {
        try {
            const { data, error } = await apiClient<Record<string, unknown>>(
                API_ROUTES.ABONNEMENTS.SOUSCRIRE,
                {
                    method: "POST",
                    token: getToken(),
                    body: {
                        plan_slug: input.planSlug,
                        nombre_mois: input.nombreMois,
                        prenom: input.prenom,
                        nom: input.nom,
                        telephone: input.telephone,
                        adresse: input.adresse,
                        ville: input.ville,
                        code_postal: input.codePostal,
                        code_promo: input.codePromo ?? undefined,
                    },
                }
            );
            if (error || !data) return null;
            return ModelSouscription.fromJson(data);
        } catch (e) {
            console.error("souscrire error:", e);
            return null;
        }
    }

    async getMonAbonnement(): Promise<ModelSouscription | null> {
        try {
            const { data, error } = await apiClient<Record<string, unknown>>(
                API_ROUTES.ABONNEMENTS.MON_ABONNEMENT,
                { token: getToken() }
            );
            if (error || !data) return null;
            return ModelSouscription.fromJson(data);
        } catch (e) {
            console.error("getMonAbonnement error:", e);
            return null;
        }
    }
}
