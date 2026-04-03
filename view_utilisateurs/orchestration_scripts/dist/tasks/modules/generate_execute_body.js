"use strict";
// ────── Générer corps execute() → appel direct repo.nom(...) ──────
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateExecuteBody = generateExecuteBody;
/**
 * Génère le corps d'une méthode execute() qui appelle directement la méthode correspondante du repository.
 * @param uc Le schéma de l'ucase.
 * @returns Le corps de la méthode execute().
 */
function generateExecuteBody(uc) {
    const args = uc.$params?.map(p => p.$name).join(', ') || '';
    return `return this.repository.${uc.$name}(${args});`;
}
