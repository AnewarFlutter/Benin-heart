type RelatedArgKeys =
    | "module"
    | "feature"
    | "kind"
    | "entity"
    | "step";

export type RelatedParsedArgs = Partial<Record<RelatedArgKeys, string | true>>;

/**
 * Parse une ligne de texte en arguments SCAF pour les attributs related (ex: --module auth --feature user --kind entity).
 * Retourne un objet avec les clés/valeurs correspondantes.
 * Les clés commençant par "--" sont interprétées comme des clés booléennes (valeur par défaut: true).
 * Les valeurs sont les suivantes de la clé (ex: --module auth -> valeur: "auth").
 */
export function parseRelatedArgs(
    line: string,
    allowed?: RelatedArgKeys[]
): RelatedParsedArgs {
    const tokens = line.trim().split(/\s+/);
    const result: RelatedParsedArgs = {};

    let currentKey: RelatedArgKeys | null = null;

    const isArgKey = (key: string): key is RelatedArgKeys =>
        ["module", "feature", "kind", "entity", "step"].includes(key);

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
        } else if (currentKey) {
            result[currentKey] = token;
            currentKey = null;
        }
    }

    return result;
}
