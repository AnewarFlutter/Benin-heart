
import { EntityMonProfil } from "../../domain/entities/entity_profil";
import { ModelMonProfil, ModelProfilPublic } from "../models/model_profil";

/**
 * ProfilDataSource defines the contract for profile data access.
 */
export interface ProfilDataSource {
    getProfils(): Promise<ModelProfilPublic[]>;
    getMonProfil(): Promise<ModelMonProfil | null>;
    updateMonProfil(data: Partial<EntityMonProfil>): Promise<ModelMonProfil | null>;
    uploadPhoto(formData: FormData): Promise<boolean>;
    uploadVideo(formData: FormData): Promise<boolean>;
    deletePhoto(uuid: string): Promise<boolean>;
}
