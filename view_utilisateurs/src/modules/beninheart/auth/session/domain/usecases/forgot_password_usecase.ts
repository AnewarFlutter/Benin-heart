
import { AuthRepository } from "../repositories/auth_repository";

/**
 * ForgotPasswordUseCase initiates the password reset flow.
 */
export class ForgotPasswordUseCase {
    constructor(private readonly repository: AuthRepository) {}

    async execute(email: string): Promise<boolean> {
        return this.repository.forgotPassword(email);
    }
}
