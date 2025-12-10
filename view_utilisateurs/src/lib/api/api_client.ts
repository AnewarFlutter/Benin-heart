import { ApiHttpClient, ApiOptions } from "./api_http_client";
import { AxiosHttpClient } from "./axios_http_client";

/**
 *  API Client générique
 *  Generic API client
 */
let defaultHttpClient: ApiHttpClient = new AxiosHttpClient();

export function setDefaultHttpClient(client: ApiHttpClient) {
    defaultHttpClient = client;
}

interface ApiClientOptions<TBody> extends ApiOptions<TBody> {
    client?: ApiHttpClient; // permet de forcer un moteur localement
}

export async function apiClient<TResponse, TBody = unknown>(
    endpoint: string,
    options: ApiClientOptions<TBody> = {}
) {
    const { client, ...rest } = options;
    const httpClient = client || defaultHttpClient;
    return httpClient.request<TResponse, TBody>(endpoint, rest);
}