
import { EntityMonProfil, EntityProfilPublic } from "@/modules/beninheart/profil/profil/domain/entities/entity_profil";
import { GetMonProfilUseCase } from "@/modules/beninheart/profil/profil/domain/usecases/get_mon_profil_usecase";
import { GetProfilsUseCase } from "@/modules/beninheart/profil/profil/domain/usecases/get_profils_usecase";
import { UpdateMonProfilUseCase } from "@/modules/beninheart/profil/profil/domain/usecases/update_mon_profil_usecase";
import { UploadPhotoUseCase } from "@/modules/beninheart/profil/profil/domain/usecases/upload_photo_usecase";
import { UploadVideoUseCase } from "@/modules/beninheart/profil/profil/domain/usecases/upload_video_usecase";

/**
 * ProfilController is the adapter for profile operations.
 */
export class ProfilController {

    constructor(
        private readonly getProfilsUseCase: GetProfilsUseCase,
        private readonly getMonProfilUseCase: GetMonProfilUseCase,
        private readonly updateMonProfilUseCase: UpdateMonProfilUseCase,
        private readonly uploadPhotoUseCase: UploadPhotoUseCase,
        private readonly uploadVideoUseCase: UploadVideoUseCase,
    ) {}

    getProfils = async (): Promise<EntityProfilPublic[]> => {
        try {
            return await this.getProfilsUseCase.execute();
        } catch (e) {
            console.error("ProfilController.getProfils error:", e);
            return [];
        }
    };

    getMonProfil = async (): Promise<EntityMonProfil | null> => {
        try {
            return await this.getMonProfilUseCase.execute();
        } catch (e) {
            console.error("ProfilController.getMonProfil error:", e);
            return null;
        }
    };

    updateMonProfil = async (data: Partial<EntityMonProfil>): Promise<EntityMonProfil | null> => {
        try {
            return await this.updateMonProfilUseCase.execute(data);
        } catch (e) {
            console.error("ProfilController.updateMonProfil error:", e);
            return null;
        }
    };

    uploadPhoto = async (formData: FormData): Promise<boolean> => {
        try {
            return await this.uploadPhotoUseCase.execute(formData);
        } catch (e) {
            console.error("ProfilController.uploadPhoto error:", e);
            return false;
        }
    };

    uploadVideo = async (formData: FormData): Promise<boolean> => {
        try {
            return await this.uploadVideoUseCase.execute(formData);
        } catch (e) {
            console.error("ProfilController.uploadVideo error:", e);
            return false;
        }
    };
}
