
import { TypeSwipe } from "../../domain/entities/entity_like";
import { ModelLikeResult, ModelLikeStats, ModelMatch } from "../models/model_like";

/**
 * LikeDataSource defines the contract for like/match data access.
 */
export interface LikeDataSource {
    swipe(profilUuid: string, typeAction: TypeSwipe): Promise<ModelLikeResult | null>;
    getMesMatchs(): Promise<ModelMatch[]>;
    getMesLikes(): Promise<ModelMatch[]>;
    getMesStats(): Promise<ModelLikeStats | null>;
}
