import { toCasing } from "../../casing";

// NOUVELLE FONCTION : Mapper param type Entity local → Model local pour datasource call

/**
 * Mapper le type d'un paramètre Entity local vers Model local pour la méthode DataSourceImpl
 * @param paramType type du paramètre à mapper
 * @param featureName nom de la feature liée au paramètre
 * @returns type du paramètre mappé
 */
export function mapParamToModelType(paramType: string, featureName: string): string {
    const localEntity = `Entity${toCasing.pascalCase(featureName)}`;
    const localModel = `Model${toCasing.pascalCase(featureName)}`;
    return paramType.replace(new RegExp(`\\b${localEntity}\\b`, 'g'), localModel);
}

// NOUVELLE FONCTION : Mapper param value pour conversion si Entity local

/**
 * Mapper param value pour conversion si Entity local
 * @param paramName nom du paramètre à mapper
 * @param paramType type du paramètre à mapper
 * @param featureName nom de la feature liée au paramètre
 * @returns valeur mappée du paramètre
 */
export function mapParamValue(paramName: string, paramType: string, featureName: string): string {
    const localEntity = `Entity${toCasing.pascalCase(featureName)}`;
    if (paramType.includes(localEntity)) {
        return `Model${toCasing.pascalCase(featureName)}.fromEntity(${paramName})`;
    }
    return paramName;
}
