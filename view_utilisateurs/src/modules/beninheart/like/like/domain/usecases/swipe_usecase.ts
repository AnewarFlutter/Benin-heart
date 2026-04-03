
import { EntityLikeResult, TypeSwipe } from "../entities/entity_like";
import { LikeRepository } from "../repositories/like_repository";

/**
 * SwipeUseCase sends a like, superlike or dislike action on a profile.
 */
export class SwipeUseCase {
    constructor(private readonly repository: LikeRepository) {}

    async execute(profilUuid: string, typeAction: TypeSwipe): Promise<EntityLikeResult | null> {
        return this.repository.swipe(profilUuid, typeAction);
    }
}
