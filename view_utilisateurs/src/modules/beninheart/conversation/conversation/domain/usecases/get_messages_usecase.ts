
import { EntityMessage } from "../entities/entity_conversation";
import { ConversationRepository } from "../repositories/conversation_repository";

/**
 * GetMessagesUseCase retrieves messages for a given conversation.
 */
export class GetMessagesUseCase {
    constructor(private readonly repository: ConversationRepository) {}

    async execute(convUuid: string): Promise<EntityMessage[]> {
        return this.repository.getMessages(convUuid);
    }
}
