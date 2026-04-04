
import { ProfilRepository } from "../repositories/profil_repository";

export class UploadPhotoUseCase {
    constructor(private readonly repository: ProfilRepository) {}

    async execute(formData: FormData): Promise<boolean> {
        return this.repository.uploadPhoto(formData);
    }
}
