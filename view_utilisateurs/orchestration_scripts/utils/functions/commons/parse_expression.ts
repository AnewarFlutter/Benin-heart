// --- Fonction pour parser une expression complexe (ex: "filters?.page") ---

/**
 * Parse une expression complexe en utilisant les paramètres du modèle.
 * Retourne la valeur correspondante à l'expression si elle existe, sinon "undefined".
 * Exemples :
 * - "id" -> valeur de "id" dans le modèle
 * - "updates.email" -> valeur de "email" dans le paramètre "updates" du modèle
 * - "filters?.page" -> valeur de "page" dans le paramètre "filters" du modèle, si "filters" existe
 */
export function parseExpression(expr: string, paramsMap: Record<string, string>): string {
    // Cas 1 : paramètre direct (ex: "id")
    if (paramsMap[expr]) {
        return paramsMap[expr];
    }

    // Cas 2 : accès imbriqué (ex: "updates.email")
    const dotParts = expr.split(".");
    if (dotParts.length === 2 && paramsMap[dotParts[0]]) {
        return `${dotParts[0]}.${dotParts[1]}`;
    }

    // Cas 3 : optional chaining (ex: "filters?.page")
    const optionalMatch = expr.match(/^([a-zA-Z0-9_]+)\?\.([a-zA-Z0-9_]+)$/);
    if (optionalMatch && paramsMap[optionalMatch[1]]) {
        const root = paramsMap[optionalMatch[1]];
        return `${root}?.${optionalMatch[2]}`;
    }

    // Cas 4 : fallback ou transform non géré ici → on retourne "undefined"
    return "undefined";
}
