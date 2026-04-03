
import { EntityMonProfil } from "../entities/entity_profil";
import { ProfilRepository } from "../repositories/profil_repository";

/**
 * UpdateMonProfilUseCase updates the authenticated user's profile.
 */
export class UpdateMonProfilUseCase {
    constructor(private readonly repository: ProfilRepository) {}

    async execute(data: Partial<EntityMonProfil>): Promise<EntityMonProfil | null> {
        return this.repository.updateMonProfil(data);
    }
}
