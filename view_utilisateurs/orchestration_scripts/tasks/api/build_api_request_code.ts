// --- Génère le code pour path, query, body (CORRIGÉ POUR LES CHAMPS IMBRIQUÉS) ---

import { parseExpression } from "../../utils/functions/commons/parse_expression";
import { ApiRoute, MappingEntry } from "../../utils/types";

/**
 * Génère le code pour les paramètres de requête API (path, query, body).
 * @param route La route API.
 * @param paramsMap Les paramètres du modèle.
 * @param mapping Les mappages pour les paramètres de requête.
 * @returns Un objet avec les codes pour les paramètres de requête.
 */
export function buildApiRequestCode(
    route: ApiRoute,
    paramsMap: Record<string, string>,
    mapping?: {
        $body?: Record<string, MappingEntry>;
        $query?: Record<string, MappingEntry>;
        $path?: Record<string, MappingEntry>;
    }
): {
    pathParamsCode: string;
    queryParamsCode: string;
    bodyCode: string;
} {
    // --- 1. Path params ---
    const pathParams: Record<string, string> = {};
    if (mapping?.$path) {
        for (const [targetKey, value] of Object.entries(mapping.$path)) {
            let expr: string;
            if (typeof value === "string") {
                expr = parseExpression(value, paramsMap);
            } else {
                const src = parseExpression(value.$source, paramsMap);
                expr = src;
                if (value.$transform) {
                    expr = `${src} !== undefined ? (${value.$transform}) : undefined`;
                }
                if (value.$fallback) {
                    expr = `${expr} ?? ${parseExpression(value.$fallback, paramsMap)}`;
                }
            }
            if (expr !== "undefined") {
                pathParams[targetKey] = expr;
            }
        }
    }
    const pathParamsCode = Object.keys(pathParams).length
        ? `{ ${Object.entries(pathParams).map(([k, v]) => `${k}: ${v}`).join(", ")} }`
        : "undefined";

    // --- 2. Query params ---
    const queryParams: Record<string, string> = {};
    if (mapping?.$query) {
        for (const [targetKey, value] of Object.entries(mapping.$query)) {
            let expr: string;
            if (typeof value === "string") {
                expr = parseExpression(value, paramsMap);
            } else {
                const src = parseExpression(value.$source, paramsMap);
                expr = src;
                if (value.$transform) {
                    expr = `${src} !== undefined ? (${value.$transform}) : undefined`;
                }
                if (value.$fallback) {
                    expr = `${expr} ?? ${parseExpression(value.$fallback, paramsMap)}`;
                }
            }
            if (expr !== "undefined") {
                queryParams[targetKey] = expr;
            }
        }
    }
    const queryParamsCode = Object.keys(queryParams).length
        ? `{ ${Object.entries(queryParams).map(([k, v]) => `${k}: ${v}`).join(", ")} }`
        : "undefined";

    // --- 3. Body ---
    const bodyLines: string[] = [];
    if (mapping?.$body) {
        for (const [targetKey, value] of Object.entries(mapping.$body)) {
            let expr: string;
            if (typeof value === "string") {
                expr = parseExpression(value, paramsMap);
            } else {
                const src = parseExpression(value.$source, paramsMap);
                expr = src;
                if (value.$transform) {
                    expr = `${src} !== undefined ? (${value.$transform}) : undefined`;
                }
                if (value.$fallback) {
                    expr = `${expr} ?? ${parseExpression(value.$fallback, paramsMap)}`;
                }
            }
            if (expr !== "undefined") {
                bodyLines.push(`  ${targetKey}: ${expr},`);
            }
        }
    }
    const bodyCode = bodyLines.length
        ? `{\n${bodyLines.join("\n")}\n}`
        : "undefined";

    return { pathParamsCode, queryParamsCode, bodyCode };
}
