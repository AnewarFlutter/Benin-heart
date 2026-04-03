
import { EntityConversation, EntityMessage } from "../entities/entity_conversation";

/**
 * ConversationRepository defines the contract for conversation/message data access.
 */
export interface ConversationRepository {
    getConversations(): Promise<EntityConversation[]>;
    getMessages(convUuid: string): Promise<EntityMessage[]>;
    ouvrirConversation(matchUuid: string): Promise<EntityConversation | null>;
}
