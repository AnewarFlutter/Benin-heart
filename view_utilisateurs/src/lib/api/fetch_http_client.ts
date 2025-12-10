import { APP_CONFIG } from "@/shared/constants/app_config";
import { ApiHttpClient, ApiOptions, ApiResponse, INTERCEPTORS } from "./api_http_client";

/**
 * Performs an HTTP request via fetch with app-wide defaults and interceptors.
 *
 * - Prepends APP_CONFIG.API.baseUrl when the endpoint is relative.
 * - Applies INTERCEPTORS.onRequest/onResponse/onError.
 * - Supports bearer token, custom headers, timeout (AbortController), and retries.
 * - Auto-parses response as json | text | blob via options.responseType.
 * - Never throws; returns ApiResponse<TResponse> and maps timeouts to "Request timed out".
 *
 * @template TResponse Response payload type.
 * @template TBody Request body type.
 * @param endpoint Target path or absolute URL.
 * @param options ApiOptions controlling method, body, headers, token, timeout, retries, and responseType.
 * @returns Promise resolving to ApiResponse with data, error, and status.
 */
export class FetchHttpClient implements ApiHttpClient {

    /**
     * Makes an HTTP request to the specified endpoint.
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

        const { method = "GET", body, headers = {}, token, timeout = APP_CONFIG.API.timeout, retries = 0, responseType = "json" } = options;

        // Intercepteur request
        const finalOptions = await INTERCEPTORS.onRequest({
            method,
            body,
            headers,
            token,
            timeout,
            retries,
            responseType,
        });

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        let attempt = 0;
        while (attempt <= retries) {
            try {

                // check if the endpoint is an absolute url
                const isAbsoluteUrl = /^https?:\/\//i.test(endpoint);

                const res = await fetch(isAbsoluteUrl ? endpoint : `${APP_CONFIG.API.baseUrl}${endpoint}`, {
                    method: finalOptions.method,
                    headers: {
                        "Content-Type": "application/json",
                        ...(finalOptions.token
                            ? { Authorization: `Bearer ${finalOptions.token}` }
                            : {}),
                        ...finalOptions.headers,
                    },
                    body: body ? JSON.stringify(body) : undefined,
                    signal: controller.signal,
                });

                clearTimeout(timer);

                let parsedData: unknown = null;
                if (responseType === "json") parsedData = await res.json().catch(() => null);
                if (responseType === "text") parsedData = await res.text();
                if (responseType === "blob") parsedData = await res.blob();

                const response: ApiResponse<TResponse> = {
                    data: res.ok ? (parsedData as TResponse) : null,
                    error: res.ok ? null : (parsedData as { message: string } | null)?.message || res.statusText,
                    status: res.status,
                };

                return await INTERCEPTORS.onResponse(response);
            } catch (err: unknown) {

                if (attempt < retries) {
                    attempt++;
                    continue; // retry
                }

                if (err instanceof Error) {
                    const errorResponse: ApiResponse<TResponse> = {
                        data: null,
                        error: err.name === "AbortError" ? "Request timed out" : err.message,
                        status: 500,
                    };

                    await INTERCEPTORS.onError(errorResponse);
                    return errorResponse;
                } else {
                    const errorResponse: ApiResponse<TResponse> = {
                        data: null,
                        error: "An unknown error occurred",
                        status: 500,
                    };

                    await INTERCEPTORS.onError(errorResponse);
                    return errorResponse;
                }
            }
        }

        return { data: null, error: "Unexpected failure", status: 500 };
    }
}
