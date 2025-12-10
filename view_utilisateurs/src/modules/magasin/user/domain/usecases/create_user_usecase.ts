import { EntityUser } from "../entities/entity_user";
import { UserRepository } from "../repositories/user_repository";

/**
 * CreateUser use case for User feature.
 */
export class CreateUserUseCase {
    constructor(private readonly repository: UserRepository) {}

    /**
     * Executes the use case.
     */
    async execute(user: EntityUser): Promise<EntityUser | null> {
        return this.repository.createUser(user);
    }
}
