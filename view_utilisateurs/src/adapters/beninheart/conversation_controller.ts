
import { EntityConversation, EntityMessage } from "@/modules/beninheart/conversation/conversation/domain/entities/entity_conversation";
import { GetConversationsUseCase } from "@/modules/beninheart/conversation/conversation/domain/usecases/get_conversations_usecase";
import { GetMessagesUseCase } from "@/modules/beninheart/conversation/conversation/domain/usecases/get_messages_usecase";

/**
 * ConversationController is the adapter for conversation/message operations.
 */
export class ConversationController {

    constructor(
        private readonly getConversationsUseCase: GetConversationsUseCase,
        private readonly getMessagesUseCase: GetMessagesUseCase,
    ) {}

    getConversations = async (): Promise<EntityConversation[]> => {
        try {
            return await this.getConversationsUseCase.execute();
        } catch (e) {
            console.error("ConversationController.getConversations error:", e);
            return [];
        }
    };

    getMessages = async (convUuid: string): Promise<EntityMessage[]> => {
        try {
            return await this.getMessagesUseCase.execute(convUuid);
        } catch (e) {
            console.error("ConversationController.getMessages error:", e);
            return [];
        }
    };
}
