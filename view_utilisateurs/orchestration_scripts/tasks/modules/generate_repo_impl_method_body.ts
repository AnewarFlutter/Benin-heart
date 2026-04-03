// NOUVELLE FONCTION : Générer body de méthode repoImpl

import { UsecaseSchema } from "../../config_validator";
import { mapParamValue } from "../../utils/functions/commons/map_params";

/**
 * Génère le corps d'une méthode du repository implémentant une méthode d'un datasource.
 * @param uc Le schéma de l'ucase.
 * @param featureName Le nom de la feature.
 * @returns Le corps de la méthode.
 */
export function generateRepoImplMethodBody(uc: UsecaseSchema, featureName: string): string {
    const paramNames = uc.$params?.map(p => mapParamValue(p.$name, p.$type, featureName)).join(', ') || '';
    const isAsync = uc.$async ?? true;
    return `
        try {
            const data = ${isAsync ? 'await' : ''} this.ds.${uc.$name}(${paramNames});
            // TODO: Mapper les données si nécessaire, ex: data.toEntity() ou data.map(d => d.toEntity())
            return data;
        } catch (e) {
            throw e;
        }
    `;
}