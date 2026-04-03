"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEnumValue = isEnumValue;
exports.isEnumExpression = isEnumExpression;
/**
 * Vérifie si une valeur donnée est un membre valide d'un enum TypeScript.
 *
 * @param enumType L'objet Enum (par exemple, PlayerLevelEnum).
 * @param value La valeur à vérifier (par exemple, "CONFIRME" ou 1).
 * @returns Vrai si la valeur est un membre de l'enum, faux sinon.
 */
function isEnumValue(enumType, value) {
    // Pour les enums numériques et chaînes, utiliser Object.values() est souvent le plus simple.
    // Cela renvoie un tableau contenant uniquement les valeurs de l'enum.
    const enumValues = Object.values(enumType);
    return enumValues.includes(value);
}
function isEnumExpression(expr) {
    if (typeof expr !== "string")
        return false;
    // Vérifie le format EnumName.VALUE
    const enumPattern = /^[A-Z][A-Za-z0-9]*\.[A-Z][A-Z0-9_]*$/;
    return enumPattern.test(expr);
}
