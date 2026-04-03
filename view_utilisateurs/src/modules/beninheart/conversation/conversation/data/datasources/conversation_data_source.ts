
import { ModelConversation, ModelMessage } from "../models/model_conversation";

/**
 * ConversationDataSource defines the contract for conversation/message data access.
 */
export interface ConversationDataSource {
    getConversations(): Promise<ModelConversation[]>;
    getMessages(convUuid: string): Promise<ModelMessage[]>;
    ouvrirConversation(matchUuid: string): Promise<ModelConversation | null>;
}
