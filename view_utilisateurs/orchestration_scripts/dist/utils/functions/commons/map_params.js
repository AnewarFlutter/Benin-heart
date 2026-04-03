"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapParamToModelType = mapParamToModelType;
exports.mapParamValue = mapParamValue;
const casing_1 = require("../../casing");
// NOUVELLE FONCTION : Mapper param type Entity local → Model local pour datasource call
/**
 * Mapper le type d'un paramètre Entity local vers Model local pour la méthode DataSourceImpl
 * @param paramType type du paramètre à mapper
 * @param featureName nom de la feature liée au paramètre
 * @returns type du paramètre mappé
 */
function mapParamToModelType(paramType, featureName) {
    const localEntity = `Entity${casing_1.toCasing.pascalCase(featureName)}`;
    const localModel = `Model${casing_1.toCasing.pascalCase(featureName)}`;
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
function mapParamValue(paramName, paramType, featureName) {
    const localEntity = `Entity${casing_1.toCasing.pascalCase(featureName)}`;
    if (paramType.includes(localEntity)) {
        return `Model${casing_1.toCasing.pascalCase(featureName)}.fromEntity(${paramName})`;
    }
    return paramName;
}
