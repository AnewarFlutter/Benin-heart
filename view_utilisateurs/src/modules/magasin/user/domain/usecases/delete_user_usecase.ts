import { UserRepository } from "../repositories/user_repository";

/**
 * DeleteUser use case for User feature.
 */
export class DeleteUserUseCase {
    constructor(private readonly repository: UserRepository) {}

    /**
     * Executes the use case.
     */
    async execute(id: string): Promise<boolean> {
        return this.repository.deleteUser(id);
    }
}
