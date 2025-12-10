import { EntityUser } from "../entities/entity_user";
import { UserRepository } from "../repositories/user_repository";

/**
 * GetAllUsers use case for User feature.
 */
export class GetAllUsersUseCase {
    constructor(private readonly repository: UserRepository) {}

    /**
     * Executes the use case.
     */
    async execute(): Promise<EntityUser[]> {
        return this.repository.getAllUsers();
    }
}
