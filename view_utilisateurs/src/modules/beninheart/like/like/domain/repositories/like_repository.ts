
import { EntityLikeResult, EntityLikeStats, EntityMatch, TypeSwipe } from "../entities/entity_like";

/**
 * LikeRepository defines the contract for like/match data access.
 */
export interface LikeRepository {
    swipe(profilUuid: string, typeAction: TypeSwipe): Promise<EntityLikeResult | null>;
    getMesMatchs(): Promise<EntityMatch[]>;
    getMesLikes(): Promise<EntityMatch[]>;
    getMesStats(): Promise<EntityLikeStats | null>;
}
