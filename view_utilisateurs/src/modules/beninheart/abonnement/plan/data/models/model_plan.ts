
import { EntityPlan, EntitySouscription } from "../../domain/entities/entity_plan";

/**
 * ModelPlan is the data model for a subscription plan.
 */
export class ModelPlan implements EntityPlan {
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

    constructor(data: EntityPlan) {
        Object.assign(this, data);
    }

    static fromEntity(entity: EntityPlan): ModelPlan {
        return new ModelPlan({ ...entity });
    }

    toEntity(): EntityPlan {
        return { ...this };
    }

    static fromJson(json: Record<string, unknown>): ModelPlan {
        return new ModelPlan({
            uuid: json.uuid as string ?? null,
            slug: json.slug as string ?? null,
            titre: json.titre as string ?? null,
            description: json.description as string ?? null,
            prix: json.prix as string ?? null,
            prixAffiche: json.prix_affiche as string ?? null,
            duree: json.duree as string ?? null,
            fonctionnalites: json.fonctionnalites as string[] ?? [],
            fonctionnalitesExclues: json.fonctionnalites_exclues as string[] ?? [],
            estPopulaire: json.est_populaire as boolean ?? false,
            icone: json.icone as string ?? null,
            ordre: json.ordre as number ?? 0,
        });
    }

    static fromJsonList(jsonList: Record<string, unknown>[]): ModelPlan[] {
        return jsonList.map(ModelPlan.fromJson);
    }
}

/**
 * ModelSouscription is the data model for a user subscription.
 */
export class ModelSouscription implements EntitySouscription {
    uuid?: string | null;
    plan?: EntityPlan | null;
    statut?: string | null;
    dateDebut?: string | null;
    dateFin?: string | null;
    prixPaye?: string | null;

    constructor(data: EntitySouscription) {
        Object.assign(this, data);
    }

    toEntity(): EntitySouscription {
        return { ...this };
    }

    static fromJson(json: Record<string, unknown>): ModelSouscription {
        return new ModelSouscription({
            uuid: json.uuid as string ?? null,
            plan: json.plan ? ModelPlan.fromJson(json.plan as Record<string, unknown>).toEntity() : null,
            statut: json.statut as string ?? null,
            dateDebut: json.date_debut as string ?? null,
            dateFin: json.date_fin as string ?? null,
            prixPaye: json.prix_paye as string ?? null,
        });
    }
}
