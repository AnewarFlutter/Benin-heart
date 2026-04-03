
import { EntityConversation } from "../entities/entity_conversation";
import { ConversationRepository } from "../repositories/conversation_repository";

/**
 * GetConversationsUseCase retrieves the authenticated user's conversations.
 */
export class GetConversationsUseCase {
    constructor(private readonly repository: ConversationRepository) {}

    async execute(): Promise<EntityConversation[]> {
        return this.repository.getConversations();
    }
}
