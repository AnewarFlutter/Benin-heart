
// ────── Générer corps execute() → appel direct repo.nom(...) ──────

import { UsecaseSchema } from "../../config_validator";

/**
 * Génère le corps d'une méthode execute() qui appelle directement la méthode correspondante du repository.
 * @param uc Le schéma de l'ucase.
 * @returns Le corps de la méthode execute().
 */
export function generateExecuteBody(uc: UsecaseSchema): string {
    const args = uc.$params?.map(p => p.$name).join(', ') || '';
    return `return this.repository.${uc.$name}(${args});`;
}