import { APP_CONFIG } from "@/shared/constants/app_config";
import { ApiHttpClient, ApiOptions, ApiResponse } from "./api_http_client";
import axios, { AxiosRequestConfig } from "axios";

/**
 * Sends an HTTP request using axios and normalizes the result into ApiResponse.
 *
 * - Resolves relative endpoints against APP_CONFIG.API.baseUrl; accepts absolute URLs as-is.
 * - Applies defaults: method "GET", responseType "json", timeout from APP_CONFIG.API.timeout.
 * - Merges headers, enforces "Content-Type: application/json", and sets Bearer token when provided.
 * - Passes body as axios "data".
 * - On error, returns { data: null, error, status } with status from the response or 500.
 *
 * @template TResponse Expected response payload type.
 * @template TBody Request body type.
 * @param endpoint Absolute URL or relative path to the API.
 * @param options Request options (method, body, headers, token, timeout, responseType).
 * @returns Promise resolving to an ApiResponse with data, error, and status.
 */
export class AxiosHttpClient implements ApiHttpClient {

    /**
     * Make a request to the specified endpoint.
     *
     * @param endpoint The endpoint to call. If the endpoint does not start with 'http', the base URL will be prepended.
     * @param options The options for the request.
     *
     * @returns A promise that resolves to an object containing the response data, error (if any), and status code.
     */
    async request<TResponse, TBody = unknown>(
        endpoint: string,
        options: ApiOptions<TBody>
    ): Promise<ApiResponse<TResponse>> {

        const {
            method = "GET",
            body,
            headers = {},
            token,
            timeout = APP_CONFIG.API.timeout,
            responseType = "json",
        } = options;

        try {
            const isAbsoluteUrl = /^https?:\/\//i.test(endpoint);
            const url = isAbsoluteUrl ? endpoint : `${APP_CONFIG.API.baseUrl}${endpoint}`;

            const config: AxiosRequestConfig = {
                url,
                method,
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    ...headers,
                },
                timeout,
                data: body,
                responseType,
            };

            const res = await axios.request<TResponse>(config);

            return {
                data: res.data,
                error: null,
                status: res.status,
            };
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                return {
                    data: null,
                    error: err.message,
                    status: err.response?.status || 500,
                };
            } else {
                return {
                    data: null,
                    error: (err as Error).message,
                    status: 500,
                };
            }
        }
    }
}
