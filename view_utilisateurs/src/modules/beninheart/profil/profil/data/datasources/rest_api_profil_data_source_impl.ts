
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
        console.log('[ProfilDS] getProfils() → GET', API_ROUTES.PROFILS.LIST);
        try {
            const { data, error, status } = await apiClient<Record<string, unknown>[]>(
                API_ROUTES.PROFILS.LIST,
                { token: getToken() }
            );
            console.log('[ProfilDS] getProfils() ← status:', status, '| error:', error, '| count:', data?.length ?? 0);
            if (error || !data) return [];
            return ModelProfilPublic.fromJsonList(data);
        } catch (e) {
            console.error('[ProfilDS] getProfils() — exception:', e);
            return [];
        }
    }

    async getMonProfil(): Promise<ModelMonProfil | null> {
        console.log('[ProfilDS] getMonProfil() → GET', API_ROUTES.PROFILS.MON_PROFIL);
        try {
            const { data, error, status } = await apiClient<Record<string, unknown>>(
                API_ROUTES.PROFILS.MON_PROFIL,
                { token: getToken() }
            );
            console.log('[ProfilDS] getMonProfil() ← status:', status, '| error:', error, '| data:', data);
            if (error || !data) return null;
            return ModelMonProfil.fromJson(data);
        } catch (e) {
            console.error('[ProfilDS] getMonProfil() — exception:', e);
            return null;
        }
    }

    async updateMonProfil(partial: Partial<EntityMonProfil>): Promise<ModelMonProfil | null> {
        console.log('[ProfilDS] updateMonProfil() → PUT', API_ROUTES.PROFILS.MON_PROFIL, '| payload:', partial);
        try {
            const model = new ModelMonProfil(partial);
            const body = model.toJson();
            console.log('[ProfilDS] updateMonProfil() — body sérialisé:', body);
            const { data, error, status } = await apiClient<Record<string, unknown>>(
                API_ROUTES.PROFILS.MON_PROFIL,
                { method: "PUT", body, token: getToken() }
            );
            console.log('[ProfilDS] updateMonProfil() ← status:', status, '| error:', error, '| data:', data);
            if (error || !data) return null;
            return ModelMonProfil.fromJson(data);
        } catch (e) {
            console.error('[ProfilDS] updateMonProfil() — exception:', e);
            return null;
        }
    }

    async uploadPhoto(formData: FormData): Promise<boolean> {
        console.log('[ProfilDS] uploadPhoto() → POST', API_ROUTES.PROFILS.PHOTOS, '| token présent:', !!getToken());
        try {
            const { error, status } = await apiClient(
                API_ROUTES.PROFILS.PHOTOS,
                { method: "POST", body: formData as unknown as Record<string, unknown>, token: getToken(), headers: {} }
            );
            console.log('[ProfilDS] uploadPhoto() ← status:', status, '| error:', error);
            return !error;
        } catch (e) {
            console.error('[ProfilDS] uploadPhoto() — exception:', e);
            return false;
        }
    }

    async uploadVideo(formData: FormData): Promise<boolean> {
        console.log('[ProfilDS] uploadVideo() → PUT', API_ROUTES.PROFILS.VIDEO, '| token présent:', !!getToken());
        try {
            const { error, status } = await apiClient(
                API_ROUTES.PROFILS.VIDEO,
                { method: "PUT", body: formData as unknown as Record<string, unknown>, token: getToken(), headers: {} }
            );
            console.log('[ProfilDS] uploadVideo() ← status:', status, '| error:', error);
            return !error;
        } catch (e) {
            console.error('[ProfilDS] uploadVideo() — exception:', e);
            return false;
        }
    }

    async deletePhoto(uuid: string): Promise<boolean> {
        console.log('[ProfilDS] deletePhoto() → DELETE', API_ROUTES.PROFILS.PHOTO_DELETE(uuid));
        try {
            const { error, status } = await apiClient(
                API_ROUTES.PROFILS.PHOTO_DELETE(uuid),
                { method: "DELETE", token: getToken() }
            );
            console.log('[ProfilDS] deletePhoto() ← status:', status, '| error:', error);
            return !error;
        } catch (e) {
            console.error('[ProfilDS] deletePhoto() — exception:', e);
            return false;
        }
    }
}
