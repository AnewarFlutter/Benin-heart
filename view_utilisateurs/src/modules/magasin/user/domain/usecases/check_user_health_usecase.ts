import { UserRepository } from "../repositories/user_repository";

/**
 * CheckUserHealth use case for User feature.
 */
export class CheckUserHealthUseCase {
    constructor(private readonly repository: UserRepository) {}

    /**
     * Executes the use case.
     */
    async execute(): Promise<{status: string}> {
        return this.repository.checkUserHealth();
    }
}
