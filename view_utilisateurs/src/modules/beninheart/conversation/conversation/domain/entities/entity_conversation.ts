
/**
 * EntityConversation represents a conversation between two users.
 */
export interface EntityConversation {
    uuid?: string | null;
    autreUuid?: string | null;
    autrePrenom?: string | null;
    autrePhoto?: string | null;
    autreEstEnLigne?: boolean | null;
    dernierMessageTexte?: string | null;
    dernierMessageAt?: string | null;
    messagesNonLus?: number | null;
}

/**
 * EntityMessage represents a chat message.
 */
export interface EntityMessage {
    uuid?: string | null;
    auteurId?: number | null;
    estMien?: boolean | null;
    texte?: string | null;
    lu?: boolean | null;
    createdAt?: string | null;
}
