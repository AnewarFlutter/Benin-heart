import { ApiRoute } from "../../utils/types";

// --- Génère le code de gestion des erreurs HTTP ---


/**
 * Génère le code de gestion des erreurs HTTP pour une route API.
 * @param route La route API.
 * @param returnTypeNullable Si le type de retour est nullable.
 * @param endpointKey La clé de l'endpoint.
 * @returns Un objet avec le code de gestion des erreurs et les noms des classes d'erreurs.
 */
export function buildErrorHandlingCode(
    route: ApiRoute,
    returnTypeNullable: boolean,
    endpointKey: string
): { code: string; errorTypes: string[] } {
    const byStatus = route.$response?.$byStatus ?? {};
    const lines: string[] = ["    if (error) {", "      switch (status) {"];
    const errorTypes: string[] = [];

    const [group, routeName] = endpointKey.split(".");
    const groupUpper = group.toUpperCase();
    const routeUpper = routeName.toUpperCase();

    for (const [code, resp] of Object.entries(byStatus)) {
        const className = {
            "202": "ValidResponse",
            "400": "BadRequestError",
            "401": "UnauthorizedError",
            "403": "ForbiddenError",
            "404": "NotFoundError",
            "409": "ConflictResourceError",
            "422": "ValidationError",
            "500": "InternalServerError",
            "503": "ServiceUnavailableError",
        }[code] || "ApiError";

        const errorType = `${groupUpper}_${routeUpper}_RESPONSE_${code}`;
        errorTypes.push(errorType);

        if (code === "404" && returnTypeNullable) {
            lines.push(`        case ${code}: return null;`);
        } else {
            const messageArg = resp.$description ? `, "${resp.$description}"` : "";
            lines.push(`        case ${code}: throw new ${className}(error as ${errorType}${messageArg});`);
        }
    }

    lines.push(`        default: throw new ApiError(status, error);`);
    lines.push(`      }`);
    lines.push(`    }`);

    return { code: lines.join("\n"), errorTypes };
}
