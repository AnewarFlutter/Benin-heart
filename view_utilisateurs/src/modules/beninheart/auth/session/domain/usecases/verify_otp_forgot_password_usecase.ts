
import { AuthRepository } from "../repositories/auth_repository";

/**
 * VerifyOTPForgotPasswordUseCase verifies the OTP for password reset.
 */
export class VerifyOTPForgotPasswordUseCase {
    constructor(private readonly repository: AuthRepository) {}

    async execute(email: string, otpCode: string): Promise<boolean> {
        return this.repository.verifyOTPForgotPassword(email, otpCode);
    }
}
