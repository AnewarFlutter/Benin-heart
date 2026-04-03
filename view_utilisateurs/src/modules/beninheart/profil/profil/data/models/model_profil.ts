
import { EntityMonProfil, EntityPhoto, EntityProfilPublic } from "../../domain/entities/entity_profil";

/**
 * ModelProfilPublic is the data model for a public profile (swipe card).
 */
export class ModelProfilPublic implements EntityProfilPublic {
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

    constructor(data: EntityProfilPublic) {
        Object.assign(this, data);
    }

    toEntity(): EntityProfilPublic {
        return { ...this };
    }

    static fromJson(json: Record<string, unknown>): ModelProfilPublic {
        const photosRaw = (json.photos as Record<string, unknown>[]) ?? [];
        return new ModelProfilPublic({
            uuid: json.uuid as string ?? null,
            prenom: json.prenom as string ?? null,
            age: json.age as number ?? null,
            genre: json.genre as string ?? null,
            ville: json.ville as string ?? null,
            pays: json.pays as string ?? null,
            bio: json.bio as string ?? null,
            photoPrincipale: json.photo_principale as string ?? null,
            photos: photosRaw.map((p) => ({
                uuid: p.uuid as string ?? null,
                image: p.image as string ?? null,
                ordre: p.ordre as number ?? null,
                estPrincipale: p.est_principale as boolean ?? false,
            })),
            estVerifie: json.est_verifie as boolean ?? false,
            estEnLigne: json.est_en_ligne as boolean ?? false,
        });
    }

    static fromJsonList(jsonList: Record<string, unknown>[]): ModelProfilPublic[] {
        return jsonList.map(ModelProfilPublic.fromJson);
    }
}

/**
 * ModelMonProfil is the data model for the authenticated user's profile.
 */
export class ModelMonProfil implements EntityMonProfil {
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

    constructor(data: EntityMonProfil) {
        Object.assign(this, data);
    }

    toEntity(): EntityMonProfil {
        return { ...this };
    }

    static fromJson(json: Record<string, unknown>): ModelMonProfil {
        const photosRaw = (json.photos as Record<string, unknown>[]) ?? [];
        return new ModelMonProfil({
            uuid: json.uuid as string ?? null,
            prenom: json.prenom as string ?? null,
            dateNaissance: json.date_naissance as string ?? null,
            genre: json.genre as string ?? null,
            recherche: json.recherche as string ?? null,
            bio: json.bio as string ?? null,
            ville: json.ville as string ?? null,
            pays: json.pays as string ?? null,
            photoPrincipale: json.photo_principale as string ?? null,
            photos: photosRaw.map((p) => ({
                uuid: p.uuid as string ?? null,
                image: p.image as string ?? null,
                ordre: p.ordre as number ?? null,
                estPrincipale: p.est_principale as boolean ?? false,
            })),
            estVerifie: json.est_verifie as boolean ?? false,
            estEnLigne: json.est_en_ligne as boolean ?? false,
            statut: json.statut as string ?? null,
        });
    }

    toJson(): Record<string, unknown> {
        return {
            prenom: this.prenom,
            date_naissance: this.dateNaissance,
            genre: this.genre,
            recherche: this.recherche,
            bio: this.bio,
            ville: this.ville,
            pays: this.pays,
        };
    }
}
