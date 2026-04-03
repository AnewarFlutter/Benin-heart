
import { EntityMonProfil } from "../entities/entity_profil";
import { ProfilRepository } from "../repositories/profil_repository";

/**
 * GetMonProfilUseCase retrieves the authenticated user's profile.
 */
export class GetMonProfilUseCase {
    constructor(private readonly repository: ProfilRepository) {}

    async execute(): Promise<EntityMonProfil | null> {
        return this.repository.getMonProfil();
    }
}
