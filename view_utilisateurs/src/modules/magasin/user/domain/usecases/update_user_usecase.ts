import { EntityUser } from "../entities/entity_user";
import { UserRepository } from "../repositories/user_repository";

/**
 * UpdateUser use case for User feature.
 */
export class UpdateUserUseCase {
    constructor(private readonly repository: UserRepository) {}

    /**
     * Executes the use case.
     */
    async execute(user: EntityUser): Promise<EntityUser | null> {
        return this.repository.updateUser(user);
    }
}
