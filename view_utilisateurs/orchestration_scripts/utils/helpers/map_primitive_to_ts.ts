// ──────────────────────────────────────────────────────────────
// Fonctions de génération – sans any
// Mappe les types Zod → TypeScript
// ──────────────────────────────────────────────────────────────
export function mapPrimitiveToTs(type: string, valueType?: string, keyType?: string): string {
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