"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRelatedArgs = parseRelatedArgs;
/**
 * Parse une ligne de texte en arguments SCAF pour les attributs related (ex: --module auth --feature user --kind entity).
 * Retourne un objet avec les clés/valeurs correspondantes.
 * Les clés commençant par "--" sont interprétées comme des clés booléennes (valeur par défaut: true).
 * Les valeurs sont les suivantes de la clé (ex: --module auth -> valeur: "auth").
 */
function parseRelatedArgs(line, allowed) {
    const tokens = line.trim().split(/\s+/);
    const result = {};
    let currentKey = null;
    const isArgKey = (key) => ["module", "feature", "kind", "entity", "step"].includes(key);
    for (const token of tokens) {
        if (token.startsWith("--")) {
            const key = token.slice(2);
            if (!isArgKey(key)) {
                // On ignore les flags inconnus
                currentKey = null;
                continue;
            }
            // Si allowed existe → on vérifie que la clé est dans allowed
            if (allowed && !allowed.includes(key)) {
                currentKey = null;
                continue;
            }
            currentKey = key;
            result[currentKey] = true;
        }
        else if (currentKey) {
            result[currentKey] = token;
            currentKey = null;
        }
    }
    return result;
}
