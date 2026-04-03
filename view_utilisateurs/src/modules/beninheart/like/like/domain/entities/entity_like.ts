
/**
 * EntityLikeResult represents the result of a swipe action.
 */
export interface EntityLikeResult {
    action?: string | null;
    estMatch?: boolean | null;
    created?: boolean | null;
}

/**
 * EntityMatchProfil represents a matched profile summary.
 */
export interface EntityMatchProfil {
    uuid?: string | null;
    prenom?: string | null;
    photoPrincipale?: string | null;
    estEnLigne?: boolean | null;
}

/**
 * EntityMatch represents a mutual match between two users.
 */
export interface EntityMatch {
    uuid?: string | null;
    autreUtilisateur?: EntityMatchProfil | null;
    createdAt?: string | null;
}

/**
 * EntityLikeStats represents the user's like/match statistics.
 */
export interface EntityLikeStats {
    totalLikesRecus?: number | null;
    totalSuperlikesRecus?: number | null;
    totalMatchs?: number | null;
    totalLikesEnvoyes?: number | null;
}

/**
 * TypeSwipe represents the possible swipe actions.
 */
export type TypeSwipe = 'LIKE' | 'SUPERLIKE' | 'DISLIKE';
