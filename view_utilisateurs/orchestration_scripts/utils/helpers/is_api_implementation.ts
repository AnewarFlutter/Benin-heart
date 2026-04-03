import { ApiImplementation } from "../types";

// --- Type guard pour l'implémentation API ---
export function isApiImplementation(
    impl: "undefined" | "supabase" | "appwrite" | ApiImplementation | undefined
): impl is ApiImplementation {
    return typeof impl === "object" && impl !== null && "$type" in impl && impl.$type === "api";
}
