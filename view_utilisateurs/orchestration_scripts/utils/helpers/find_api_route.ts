import { ApiConfigSchema } from "../../config_validator";
import { ApiRoute } from "../types";

// --- Fonction utilitaire : trouver la route API (TYPÉE) ---
export function findApiRoute(config: ApiConfigSchema, endpointKey: string): ApiRoute | undefined {
    const [group, route] = endpointKey.split(".");
    console.info(`[API] Recherche de la route ${route} dans le groupe ${group}...`);
    const raw = config.$endpoints?.[group]?.$routes?.[route];
    if (!raw) return undefined;

    // On force le cast car Zod a déjà validé la config
    return raw as unknown as ApiRoute;
}
