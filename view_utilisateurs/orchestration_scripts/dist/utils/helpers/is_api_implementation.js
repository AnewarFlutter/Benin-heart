"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isApiImplementation = isApiImplementation;
// --- Type guard pour l'implémentation API ---
function isApiImplementation(impl) {
    return typeof impl === "object" && impl !== null && "$type" in impl && impl.$type === "api";
}
