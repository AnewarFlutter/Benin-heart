
import { EntityMonProfil, EntityProfilPublic } from "../entities/entity_profil";

/**
 * ProfilRepository defines the contract for profile data access.
 */
export interface ProfilRepository {
    getProfils(): Promise<EntityProfilPublic[]>;
    getMonProfil(): Promise<EntityMonProfil | null>;
    updateMonProfil(data: Partial<EntityMonProfil>): Promise<EntityMonProfil | null>;
    uploadPhoto(formData: FormData): Promise<boolean>;
    deletePhoto(uuid: string): Promise<boolean>;
}
