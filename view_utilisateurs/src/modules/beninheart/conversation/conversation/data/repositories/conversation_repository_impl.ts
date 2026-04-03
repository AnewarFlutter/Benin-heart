
import { EntityConversation, EntityMessage } from "../../domain/entities/entity_conversation";
import { ConversationRepository } from "../../domain/repositories/conversation_repository";
import { ConversationDataSource } from "../datasources/conversation_data_source";

/**
 * ConversationRepositoryImpl implements ConversationRepository by delegating to ConversationDataSource.
 */
export class ConversationRepositoryImpl implements ConversationRepository {

    constructor(private readonly datasource: ConversationDataSource) {}

    async getConversations(): Promise<EntityConversation[]> {
        try {
            const data = await this.datasource.getConversations();
            return data.map((m) => m.toEntity());
        } catch (e) {
            throw e;
        }
    }

    async getMessages(convUuid: string): Promise<EntityMessage[]> {
        try {
            const data = await this.datasource.getMessages(convUuid);
            return data.map((m) => m.toEntity());
        } catch (e) {
            throw e;
        }
    }

    async ouvrirConversation(matchUuid: string): Promise<EntityConversation | null> {
        try {
            const data = await this.datasource.ouvrirConversation(matchUuid);
            return data ? data.toEntity() : null;
        } catch (e) {
            throw e;
        }
    }
}
