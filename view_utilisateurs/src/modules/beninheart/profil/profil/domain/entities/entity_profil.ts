
/**
 * EntityPhoto represents a profile photo.
 */
export interface EntityPhoto {
    uuid?: string | null;
    image?: string | null;
    ordre?: number | null;
    estPrincipale?: boolean | null;
}

/**
 * EntityProfilPublic represents a public profile shown in swipe mode.
 */
export interface EntityProfilPublic {
    uuid?: string | null;
    prenom?: string | null;
    age?: number | null;
    genre?: string | null;
    ville?: string | null;
    pays?: string | null;
    bio?: string | null;
    photoPrincipale?: string | null;
    photos?: EntityPhoto[] | null;
    estVerifie?: boolean | null;
    estEnLigne?: boolean | null;
}

/**
 * EntityMonProfil represents the full editable profile of the authenticated user.
 */
export interface EntityMonProfil {
    uuid?: string | null;
    prenom?: string | null;
    dateNaissance?: string | null;
    genre?: string | null;
    recherche?: string | null;
    bio?: string | null;
    ville?: string | null;
    pays?: string | null;
    photoPrincipale?: string | null;
    photos?: EntityPhoto[] | null;
    estVerifie?: boolean | null;
    estEnLigne?: boolean | null;
    statut?: string | null;
}
