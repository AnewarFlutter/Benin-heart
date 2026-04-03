
import { EntityLikeStats } from "../entities/entity_like";
import { LikeRepository } from "../repositories/like_repository";

/**
 * GetMesStatsUseCase retrieves the authenticated user's like/match statistics.
 */
export class GetMesStatsUseCase {
    constructor(private readonly repository: LikeRepository) {}

    async execute(): Promise<EntityLikeStats | null> {
        return this.repository.getMesStats();
    }
}
