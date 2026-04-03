
import { EntityConversation, EntityMessage } from "../../domain/entities/entity_conversation";

/**
 * ModelConversation is the data model for a conversation.
 */
export class ModelConversation implements EntityConversation {
    uuid?: string | null;
    autreUuid?: string | null;
    autrePrenom?: string | null;
    autrePhoto?: string | null;
    autreEstEnLigne?: boolean | null;
    dernierMessageTexte?: string | null;
    dernierMessageAt?: string | null;
    messagesNonLus?: number | null;

    constructor(data: EntityConversation) {
        Object.assign(this, data);
    }

    toEntity(): EntityConversation {
        return { ...this };
    }

    static fromJson(json: Record<string, unknown>): ModelConversation {
        return new ModelConversation({
            uuid: json.uuid as string ?? null,
            autreUuid: json.autre_uuid as string ?? null,
            autrePrenom: json.autre_prenom as string ?? null,
            autrePhoto: json.autre_photo as string ?? null,
            autreEstEnLigne: json.autre_est_en_ligne as boolean ?? false,
            dernierMessageTexte: json.dernier_message_texte as string ?? null,
            dernierMessageAt: json.dernier_message_at as string ?? null,
            messagesNonLus: json.messages_non_lus as number ?? 0,
        });
    }

    static fromJsonList(jsonList: Record<string, unknown>[]): ModelConversation[] {
        return jsonList.map(ModelConversation.fromJson);
    }
}

/**
 * ModelMessage is the data model for a chat message.
 */
export class ModelMessage implements EntityMessage {
    uuid?: string | null;
    auteurId?: number | null;
    estMien?: boolean | null;
    texte?: string | null;
    lu?: boolean | null;
    createdAt?: string | null;

    constructor(data: EntityMessage) {
        Object.assign(this, data);
    }

    toEntity(): EntityMessage {
        return { ...this };
    }

    static fromJson(json: Record<string, unknown>): ModelMessage {
        return new ModelMessage({
            uuid: json.uuid as string ?? null,
            auteurId: json.auteur_id as number ?? null,
            estMien: json.est_mien as boolean ?? false,
            texte: json.texte as string ?? null,
            lu: json.lu as boolean ?? false,
            createdAt: json.created_at as string ?? null,
        });
    }

    static fromJsonList(jsonList: Record<string, unknown>[]): ModelMessage[] {
        return jsonList.map(ModelMessage.fromJson);
    }
}
