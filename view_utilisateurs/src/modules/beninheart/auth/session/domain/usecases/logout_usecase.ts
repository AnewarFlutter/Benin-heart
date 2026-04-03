
import { AuthRepository } from "../repositories/auth_repository";

/**
 * LogoutUseCase invalidates the current user session.
 */
export class LogoutUseCase {
    constructor(private readonly repository: AuthRepository) {}

    async execute(refreshToken: string): Promise<boolean> {
        return this.repository.logout(refreshToken);
    }
}
