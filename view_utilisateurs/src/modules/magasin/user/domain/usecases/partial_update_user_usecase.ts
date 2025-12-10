import { EntityUser } from "../entities/entity_user";
import { UserRepository } from "../repositories/user_repository";

/**
 * PartialUpdateUser use case for User feature.
 */
export class PartialUpdateUserUseCase {
    constructor(private readonly repository: UserRepository) {}

    /**
     * Executes the use case.
     */
    async execute(id: string, partial: Partial<EntityUser>): Promise<EntityUser | null> {
        return this.repository.partialUpdateUser(id, partial);
    }
}
