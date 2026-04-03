
import { EntityLikeResult, EntityLikeStats, EntityMatch, TypeSwipe } from "@/modules/beninheart/like/like/domain/entities/entity_like";
import { GetMatchsUseCase } from "@/modules/beninheart/like/like/domain/usecases/get_matchs_usecase";
import { GetMesStatsUseCase } from "@/modules/beninheart/like/like/domain/usecases/get_mes_stats_usecase";
import { SwipeUseCase } from "@/modules/beninheart/like/like/domain/usecases/swipe_usecase";

/**
 * LikeController is the adapter for like/match operations.
 */
export class LikeController {

    constructor(
        private readonly swipeUseCase: SwipeUseCase,
        private readonly getMatchsUseCase: GetMatchsUseCase,
        private readonly getMesStatsUseCase: GetMesStatsUseCase,
    ) {}

    swipe = async (profilUuid: string, typeAction: TypeSwipe): Promise<EntityLikeResult | null> => {
        try {
            return await this.swipeUseCase.execute(profilUuid, typeAction);
        } catch (e) {
            console.error("LikeController.swipe error:", e);
            return null;
        }
    };

    getMatchs = async (): Promise<EntityMatch[]> => {
        try {
            return await this.getMatchsUseCase.execute();
        } catch (e) {
            console.error("LikeController.getMatchs error:", e);
            return [];
        }
    };

    getMesStats = async (): Promise<EntityLikeStats | null> => {
        try {
            return await this.getMesStatsUseCase.execute();
        } catch (e) {
            console.error("LikeController.getMesStats error:", e);
            return null;
        }
    };
}
