"use server";

import { featuresDi } from "@/di/features_di";
import { EntityConversation, EntityMessage } from "@/modules/beninheart/conversation/conversation/domain/entities/entity_conversation";
import { AppActionResult } from "@/shared/types/global";

/**
 * Retrieves the authenticated user's conversations.
 */
export async function getConversationsAction(): Promise<AppActionResult<EntityConversation[]>> {
    const conversations = await featuresDi.conversationController.getConversations();
    return {
        success: true,
        message: "Conversations retrieved.",
        data: conversations,
    };
}

/**
 * Retrieves messages for a given conversation.
 */
export async function getMessagesAction(convUuid: string): Promise<AppActionResult<EntityMessage[]>> {
    const messages = await featuresDi.conversationController.getMessages(convUuid);
    return {
        success: true,
        message: "Messages retrieved.",
        data: messages,
    };
}
