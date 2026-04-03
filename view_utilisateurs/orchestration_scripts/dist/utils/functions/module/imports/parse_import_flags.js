"use strict";
// utils/functions/module/imports/parse_import_flags.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseImportFlags = parseImportFlags;
/**
 * Parse une chaîne de flags SCAF de façon strictement typée.
 * Exemple :
 * "--module auth --feature user --kind entity"
 * → { module: "auth", feature: "user", kind: "entity" }
 */
function parseImportFlags(from) {
    const result = {};
    // Regex qui capture --key value (value peut contenir des espaces si entre quotes)
    const regex = /--(\w+)\s+((?:".*?"|'.*?'|[^\s"']+)(?:\s+(?!--)".*?"|'.*?'|[^\s"']+)*)/g;
    let match;
    while ((match = regex.exec(from)) !== null) {
        const key = match[1];
        let value = match[2].trim();
        // Nettoyage des quotes si présentes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        // Assignation typée
        if (key === "module")
            result.module = value;
        else if (key === "feature")
            result.feature = value;
        else if (key === "kind") {
            if (value === "entity" || value === "model" || value === "custom" || value === "enum") {
                result.kind = value;
            }
        }
        else if (key === "step") {
            if (value === "module" || value === "feature") {
                result.step = value;
            }
        }
        else {
            // Pour les flags futurs (ex: --as, --from, etc.)
            result[key] = value;
        }
    }
    return result;
}
