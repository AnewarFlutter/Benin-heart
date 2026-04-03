
import { apiClient } from "@/lib/api/api_client";
import { API_ROUTES } from "@/shared/constants/api_routes";
import { useAuthStore } from "@/stores/auth_store";
import { EntityMonProfil } from "../../domain/entities/entity_profil";
import { ModelMonProfil, ModelProfilPublic } from "../models/model_profil";
import { ProfilDataSource } from "./profil_data_source";

const getToken = () => useAuthStore.getState().accessToken ?? undefined;

/**
 * REST API implementation of ProfilDataSource.
 */
export class RestApiProfilDataSourceImpl implements ProfilDataSource {

    async getProfils(): Promise<ModelProfilPublic[]> {
        try {
            const { data, error } = await apiClient<Record<string, unknown>[]>(
                API_ROUTES.PROFILS.LIST,
                { token: getToken() }
            );
            if (error || !data) return [];
            return ModelProfilPublic.fromJsonList(data);
        } catch (e) {
            console.error("getProfils error:", e);
            return [];
        }
    }

    async getMonProfil(): Promise<ModelMonProfil | null> {
        try {
            const { data, error } = await apiClient<Record<string, unknown>>(
                API_ROUTES.PROFILS.MON_PROFIL,
                { token: getToken() }
            );
            if (error || !data) return null;
            return ModelMonProfil.fromJson(data);
        } catch (e) {
            console.error("getMonProfil error:", e);
            return null;
        }
    }

    async updateMonProfil(partial: Partial<EntityMonProfil>): Promise<ModelMonProfil | null> {
        try {
            const model = new ModelMonProfil(partial);
            const { data, error } = await apiClient<Record<string, unknown>>(
                API_ROUTES.PROFILS.MON_PROFIL,
                { method: "PATCH", body: model.toJson(), token: getToken() }
            );
            if (error || !data) return null;
            return ModelMonProfil.fromJson(data);
        } catch (e) {
            console.error("updateMonProfil error:", e);
            return null;
        }
    }

    async uploadPhoto(formData: FormData): Promise<boolean> {
        try {
            const { error } = await apiClient(
                API_ROUTES.PROFILS.PHOTOS,
                { method: "POST", body: formData as unknown as Record<string, unknown>, token: getToken(), headers: {} }
            );
            return !error;
        } catch {
            return false;
        }
    }

    async deletePhoto(uuid: string): Promise<boolean> {
        try {
            const { error } = await apiClient(
                API_ROUTES.PROFILS.PHOTO_DELETE(uuid),
                { method: "DELETE", token: getToken() }
            );
            return !error;
        } catch {
            return false;
        }
    }
}
