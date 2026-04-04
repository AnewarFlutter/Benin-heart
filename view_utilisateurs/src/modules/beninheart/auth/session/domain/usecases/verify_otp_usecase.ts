
import { AuthRepository } from "../repositories/auth_repository";

/**
 * VerifyOTPUseCase verifies the OTP code for account activation.
 */
export class VerifyOTPUseCase {
    constructor(private readonly repository: AuthRepository) {}

    async execute(email: string, otpCode: string): Promise<boolean> {
        return this.repository.verifyOTP(email, otpCode);
    }
}
