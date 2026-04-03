
import { AuthRepository } from "../repositories/auth_repository";

/**
 * ResetPasswordUseCase completes the password reset.
 */
export class ResetPasswordUseCase {
    constructor(private readonly repository: AuthRepository) {}

    async execute(email: string, otpCode: string, newPassword: string, newPasswordConfirm: string): Promise<boolean> {
        return this.repository.resetPassword(email, otpCode, newPassword, newPasswordConfirm);
    }
}
