
import { EntityMatch } from "../entities/entity_like";
import { LikeRepository } from "../repositories/like_repository";

/**
 * GetMatchsUseCase retrieves the authenticated user's matches.
 */
export class GetMatchsUseCase {
    constructor(private readonly repository: LikeRepository) {}

    async execute(): Promise<EntityMatch[]> {
        return this.repository.getMesMatchs();
    }
}
