
import { EntitySession } from "../entities/entity_session";
import { AuthRepository } from "../repositories/auth_repository";

/**
 * LoginUseCase authenticates a user with email and password.
 */
export class LoginUseCase {
    constructor(private readonly repository: AuthRepository) {}

    async execute(email: string, password: string): Promise<EntitySession | null> {
        return this.repository.login(email, password);
    }
}
