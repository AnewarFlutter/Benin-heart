
import { apiClient } from "@/lib/api/api_client";
import { API_ROUTES } from "@/shared/constants/api_routes";
import { useAuthStore } from "@/stores/auth_store";
import { ModelConversation, ModelMessage } from "../models/model_conversation";
import { ConversationDataSource } from "./conversation_data_source";

const getToken = () => useAuthStore.getState().accessToken ?? undefined;

/**
 * REST API implementation of ConversationDataSource.
 */
export class RestApiConversationDataSourceImpl implements ConversationDataSource {

    async getConversations(): Promise<ModelConversation[]> {
        try {
            const { data, error } = await apiClient<Record<string, unknown>[]>(
                API_ROUTES.CONVERSATIONS.LIST,
                { token: getToken() }
            );
            if (error || !data) return [];
            return ModelConversation.fromJsonList(data);
        } catch (e) {
            console.error("getConversations error:", e);
            return [];
        }
    }

    async getMessages(convUuid: string): Promise<ModelMessage[]> {
        try {
            const { data, error } = await apiClient<Record<string, unknown>[]>(
                API_ROUTES.CONVERSATIONS.MESSAGES(convUuid),
                { token: getToken() }
            );
            if (error || !data) return [];
            return ModelMessage.fromJsonList(data);
        } catch (e) {
            console.error("getMessages error:", e);
            return [];
        }
    }

    async ouvrirConversation(matchUuid: string): Promise<ModelConversation | null> {
        try {
            const { data, error } = await apiClient<Record<string, unknown>>(
                API_ROUTES.CONVERSATIONS.OUVRIR,
                { method: "POST", body: { match_uuid: matchUuid }, token: getToken() }
            );
            if (error || !data) return null;
            return ModelConversation.fromJson(data);
        } catch (e) {
            console.error("ouvrirConversation error:", e);
            return null;
        }
    }
}
