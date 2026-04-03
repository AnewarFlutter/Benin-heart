"use strict";
// --- Génère le code pour path, query, body (CORRIGÉ POUR LES CHAMPS IMBRIQUÉS) ---
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApiRequestCode = buildApiRequestCode;
const parse_expression_1 = require("../../utils/functions/commons/parse_expression");
/**
 * Génère le code pour les paramètres de requête API (path, query, body).
 * @param route La route API.
 * @param paramsMap Les paramètres du modèle.
 * @param mapping Les mappages pour les paramètres de requête.
 * @returns Un objet avec les codes pour les paramètres de requête.
 */
function buildApiRequestCode(route, paramsMap, mapping) {
    // --- 1. Path params ---
    const pathParams = {};
    if (mapping?.$path) {
        for (const [targetKey, value] of Object.entries(mapping.$path)) {
            let expr;
            if (typeof value === "string") {
                expr = (0, parse_expression_1.parseExpression)(value, paramsMap);
            }
            else {
                const src = (0, parse_expression_1.parseExpression)(value.$source, paramsMap);
                expr = src;
                if (value.$transform) {
                    expr = `${src} !== undefined ? (${value.$transform}) : undefined`;
                }
                if (value.$fallback) {
                    expr = `${expr} ?? ${(0, parse_expression_1.parseExpression)(value.$fallback, paramsMap)}`;
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
    const queryParams = {};
    if (mapping?.$query) {
        for (const [targetKey, value] of Object.entries(mapping.$query)) {
            let expr;
            if (typeof value === "string") {
                expr = (0, parse_expression_1.parseExpression)(value, paramsMap);
            }
            else {
                const src = (0, parse_expression_1.parseExpression)(value.$source, paramsMap);
                expr = src;
                if (value.$transform) {
                    expr = `${src} !== undefined ? (${value.$transform}) : undefined`;
                }
                if (value.$fallback) {
                    expr = `${expr} ?? ${(0, parse_expression_1.parseExpression)(value.$fallback, paramsMap)}`;
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
    const bodyLines = [];
    if (mapping?.$body) {
        for (const [targetKey, value] of Object.entries(mapping.$body)) {
            let expr;
            if (typeof value === "string") {
                expr = (0, parse_expression_1.parseExpression)(value, paramsMap);
            }
            else {
                const src = (0, parse_expression_1.parseExpression)(value.$source, paramsMap);
                expr = src;
                if (value.$transform) {
                    expr = `${src} !== undefined ? (${value.$transform}) : undefined`;
                }
                if (value.$fallback) {
                    expr = `${expr} ?? ${(0, parse_expression_1.parseExpression)(value.$fallback, paramsMap)}`;
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
