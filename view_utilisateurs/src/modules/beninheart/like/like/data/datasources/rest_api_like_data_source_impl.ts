
import { apiClient } from "@/lib/api/api_client";
import { API_ROUTES } from "@/shared/constants/api_routes";
import { useAuthStore } from "@/stores/auth_store";
import { TypeSwipe } from "../../domain/entities/entity_like";
import { ModelLikeResult, ModelLikeStats, ModelMatch } from "../models/model_like";
import { LikeDataSource } from "./like_data_source";

const getToken = () => useAuthStore.getState().accessToken ?? undefined;

/**
 * REST API implementation of LikeDataSource.
 */
export class RestApiLikeDataSourceImpl implements LikeDataSource {

    async swipe(profilUuid: string, typeAction: TypeSwipe): Promise<ModelLikeResult | null> {
        try {
            const { data, error } = await apiClient<Record<string, unknown>>(
                API_ROUTES.LIKES.ACTION,
                { method: "POST", body: { profil_uuid: profilUuid, type_action: typeAction }, token: getToken() }
            );
            if (error || !data) return null;
            return ModelLikeResult.fromJson(data);
        } catch (e) {
            console.error("swipe error:", e);
            return null;
        }
    }

    async getMesMatchs(): Promise<ModelMatch[]> {
        try {
            const { data, error } = await apiClient<Record<string, unknown>[]>(
                API_ROUTES.LIKES.MES_MATCHS,
                { token: getToken() }
            );
            if (error || !data) return [];
            return ModelMatch.fromJsonList(data);
        } catch (e) {
            console.error("getMesMatchs error:", e);
            return [];
        }
    }

    async getMesLikes(): Promise<ModelMatch[]> {
        try {
            const { data, error } = await apiClient<Record<string, unknown>[]>(
                API_ROUTES.LIKES.MES_LIKES,
                { token: getToken() }
            );
            if (error || !data) return [];
            return ModelMatch.fromJsonList(data);
        } catch (e) {
            console.error("getMesLikes error:", e);
            return [];
        }
    }

    async getMesStats(): Promise<ModelLikeStats | null> {
        try {
            const { data, error } = await apiClient<Record<string, unknown>>(
                API_ROUTES.LIKES.MES_STATS,
                { token: getToken() }
            );
            if (error || !data) return null;
            return ModelLikeStats.fromJson(data);
        } catch (e) {
            console.error("getMesStats error:", e);
            return null;
        }
    }
}
