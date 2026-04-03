// ────── Casing Helpers ──────
export type CasingStyle = 'camelCase' | 'kebabCase' | 'snakeCase' | 'pascalCase';

// --- Type pour le mapping (sans any) ---
export interface MappingValue {
    $source: string;
    $transform?: string;
    $fallback?: string;
}

export type MappingEntry = string | MappingValue;

// --- Types pour la route API (CORRIGÉ) ---
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiResponseSchema {
    $type: "string" | "number" | "boolean" | "object" | "array";
    $required?: boolean;
    $description?: string;
}

export interface ApiResponseByStatus {
    $description?: string;
    schema: Record<string, ApiResponseSchema>;
}

export interface ApiRoute {
    $path: string;
    $method: HttpMethod;
    $auth: boolean;
    $params?: {
        $query?: Record<string, ApiResponseSchema>;
        $path?: Record<string, ApiResponseSchema>;
        $body?: Record<string, ApiResponseSchema>;
    };
    $isMultipart?: boolean;
    $response: {
        $default: {
            $description?: string;
            $schema: Record<string, ApiResponseSchema>;  // ← OBLIGATOIRE
        };
        $byStatus?: Record<string, ApiResponseByStatus>;
    };
}

// --- Types stricts pour le mapping ---
export interface MappingValue {
    $source: string;
    $transform?: string;
    $fallback?: string;
}

export interface ApiImplementation {
    $type: "api";
    $client: "fetch" | "axios";
    $endpoint: string;
    $mapping?: {
        $body?: Record<string, MappingEntry>;
        $query?: Record<string, MappingEntry>;
        $path?: Record<string, MappingEntry>;
    };
}