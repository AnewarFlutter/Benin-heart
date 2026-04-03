
import { EntityLikeResult, EntityLikeStats, EntityMatch } from "../../domain/entities/entity_like";

/**
 * ModelLikeResult is the data model for a swipe action result.
 */
export class ModelLikeResult implements EntityLikeResult {
    action?: string | null;
    estMatch?: boolean | null;
    created?: boolean | null;

    constructor(data: EntityLikeResult) {
        Object.assign(this, data);
    }

    toEntity(): EntityLikeResult {
        return { ...this };
    }

    static fromJson(json: Record<string, unknown>): ModelLikeResult {
        return new ModelLikeResult({
            action: json.action as string ?? null,
            estMatch: json.est_match as boolean ?? false,
            created: json.created as boolean ?? false,
        });
    }
}

/**
 * ModelMatch is the data model for a mutual match.
 */
export class ModelMatch implements EntityMatch {
    uuid?: string | null;
    autreUtilisateur?: { uuid?: string | null; prenom?: string | null; photoPrincipale?: string | null; estEnLigne?: boolean | null } | null;
    createdAt?: string | null;

    constructor(data: EntityMatch) {
        Object.assign(this, data);
    }

    toEntity(): EntityMatch {
        return { ...this };
    }

    static fromJson(json: Record<string, unknown>): ModelMatch {
        const autre = json.autre_utilisateur as Record<string, unknown> | null;
        return new ModelMatch({
            uuid: json.uuid as string ?? null,
            autreUtilisateur: autre ? {
                uuid: autre.uuid as string ?? null,
                prenom: autre.prenom as string ?? null,
                photoPrincipale: autre.photo_principale as string ?? null,
                estEnLigne: autre.est_en_ligne as boolean ?? false,
            } : null,
            createdAt: json.created_at as string ?? null,
        });
    }

    static fromJsonList(jsonList: Record<string, unknown>[]): ModelMatch[] {
        return jsonList.map(ModelMatch.fromJson);
    }
}

/**
 * ModelLikeStats is the data model for like/match statistics.
 */
export class ModelLikeStats implements EntityLikeStats {
    totalLikesRecus?: number | null;
    totalSuperlikesRecus?: number | null;
    totalMatchs?: number | null;
    totalLikesEnvoyes?: number | null;

    constructor(data: EntityLikeStats) {
        Object.assign(this, data);
    }

    toEntity(): EntityLikeStats {
        return { ...this };
    }

    static fromJson(json: Record<string, unknown>): ModelLikeStats {
        return new ModelLikeStats({
            totalLikesRecus: json['total_likes_reçus'] as number ?? 0,
            totalSuperlikesRecus: json['total_superlikes_reçus'] as number ?? 0,
            totalMatchs: json.total_matchs as number ?? 0,
            totalLikesEnvoyes: json['total_likes_envoyés'] as number ?? 0,
        });
    }
}
