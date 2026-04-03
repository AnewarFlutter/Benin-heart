
/**
 * EntityPlan represents a subscription plan.
 */
export interface EntityPlan {
    uuid?: string | null;
    slug?: string | null;
    titre?: string | null;
    description?: string | null;
    prix?: string | null;
    prixAffiche?: string | null;
    duree?: string | null;
    fonctionnalites?: string[] | null;
    fonctionnalitesExclues?: string[] | null;
    estPopulaire?: boolean | null;
    icone?: string | null;
    ordre?: number | null;
}

/**
 * EntitySouscription represents a user's subscription.
 */
export interface EntitySouscription {
    uuid?: string | null;
    plan?: EntityPlan | null;
    statut?: string | null;
    dateDebut?: string | null;
    dateFin?: string | null;
    prixPaye?: string | null;
}

/**
 * EntitySouscrireInput represents the payload to subscribe.
 */
export interface EntitySouscrireInput {
    planSlug: string;
    nombreMois: number;
    prenom: string;
    nom: string;
    telephone: string;
    adresse: string;
    ville: string;
    codePostal: string;
    codePromo?: string | null;
}
