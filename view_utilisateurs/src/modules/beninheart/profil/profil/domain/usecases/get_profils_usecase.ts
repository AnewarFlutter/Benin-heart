
import { EntityProfilPublic } from "../entities/entity_profil";
import { ProfilRepository } from "../repositories/profil_repository";

/**
 * GetProfilsUseCase retrieves the list of public profiles for swipe.
 */
export class GetProfilsUseCase {
    constructor(private readonly repository: ProfilRepository) {}

    async execute(): Promise<EntityProfilPublic[]> {
        return this.repository.getProfils();
    }
}
