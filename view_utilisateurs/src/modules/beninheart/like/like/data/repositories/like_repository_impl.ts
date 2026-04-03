
import { EntityLikeResult, EntityLikeStats, EntityMatch, TypeSwipe } from "../../domain/entities/entity_like";
import { LikeRepository } from "../../domain/repositories/like_repository";
import { LikeDataSource } from "../datasources/like_data_source";

/**
 * LikeRepositoryImpl implements LikeRepository by delegating to LikeDataSource.
 */
export class LikeRepositoryImpl implements LikeRepository {

    constructor(private readonly datasource: LikeDataSource) {}

    async swipe(profilUuid: string, typeAction: TypeSwipe): Promise<EntityLikeResult | null> {
        try {
            const data = await this.datasource.swipe(profilUuid, typeAction);
            return data ? data.toEntity() : null;
        } catch (e) {
            throw e;
        }
    }

    async getMesMatchs(): Promise<EntityMatch[]> {
        try {
            const data = await this.datasource.getMesMatchs();
            return data.map((m) => m.toEntity());
        } catch (e) {
            throw e;
        }
    }

    async getMesLikes(): Promise<EntityMatch[]> {
        try {
            const data = await this.datasource.getMesLikes();
            return data.map((m) => m.toEntity());
        } catch (e) {
            throw e;
        }
    }

    async getMesStats(): Promise<EntityLikeStats | null> {
        try {
            const data = await this.datasource.getMesStats();
            return data ? data.toEntity() : null;
        } catch (e) {
            throw e;
        }
    }
}
