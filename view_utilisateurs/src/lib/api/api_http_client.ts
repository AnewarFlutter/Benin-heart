
export type AppHttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiOptions<TBody = unknown> {
    method?: AppHttpMethod;
    body?: TBody;
    headers?: Record<string, string>;
    /// facultatif si on veut forcer un token custom
    /// optional if you want to force a custom token
    token?: string;
    timeout?: number;
    retries?: number; // nombre de tentatives en cas d’échec
    responseType?: "json" | "text" | "blob"; // auto parse
}

export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    status: number;
}

/**
 * Intercepteurs globaux
 */
export const INTERCEPTORS = {
    onRequest: async (config: ApiOptions) => config,
    onResponse: async <T>(response: ApiResponse<T>) => response,
    onError: async (error: unknown) => error,
};

export interface ApiHttpClient {
    request<TResponse, TBody = unknown>(
        endpoint: string,
        options: ApiOptions<TBody>
    ): Promise<ApiResponse<TResponse>>;
}