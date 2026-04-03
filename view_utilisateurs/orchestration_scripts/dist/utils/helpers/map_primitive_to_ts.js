"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapPrimitiveToTs = mapPrimitiveToTs;
// ──────────────────────────────────────────────────────────────
// Fonctions de génération – sans any
// Mappe les types Zod → TypeScript
// ──────────────────────────────────────────────────────────────
function mapPrimitiveToTs(type, valueType, keyType) {
    switch (type) {
        case "string": return "string";
        case "number": return "number";
        case "boolean": return "boolean";
        case "File": return "File";
        case "object": return `{ [key: ${keyType ?? "string"}]: ${valueType ?? "unknown"} }`;
        case "array": return `${valueType ?? "unknown"}[]`;
        default: return `${valueType ?? "unknown"}`;
    }
}
