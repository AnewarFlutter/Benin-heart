"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findApiRoute = findApiRoute;
// --- Fonction utilitaire : trouver la route API (TYPÉE) ---
function findApiRoute(config, endpointKey) {
    const [group, route] = endpointKey.split(".");
    console.info(`[API] Recherche de la route ${route} dans le groupe ${group}...`);
    const raw = config.$endpoints?.[group]?.$routes?.[route];
    if (!raw)
        return undefined;
    // On force le cast car Zod a déjà validé la config
    return raw;
}
