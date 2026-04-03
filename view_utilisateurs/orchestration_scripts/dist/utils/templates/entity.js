"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityTemplate = void 0;
const generate_imports_from_attributes_1 = require("../../tasks/modules/generate_imports_from_attributes");
const casing_1 = require("../casing");
const EntityTemplate = (module, feature, attrs, config) => {
    const featureName = casing_1.toCasing.pascalCase(feature.$name);
    const relatedImports = (0, generate_imports_from_attributes_1.generateImportsFromAttributes)(attrs, module, feature, config, "entity");
    return `\
${relatedImports ? relatedImports + "\n\n" : ""}/**
/**
 * Entity${casing_1.toCasing.pascalCase(featureName)} – Entité métier du module **${module.$name}**
 * 
 * **Rôle** : Représente la **donnée pure** du domaine, **sans aucune logique**.
 * 
 * **Où l'utiliser ?**
 * - UseCases (logique métier)
 * - Repository (contrat de persistance)
 * - Controller / Actions (sortie API)
 * - UI (affichage, formulaires)
 * 
 * **Où NE PAS l'utiliser ?**
 * - DataSource (Firebase, REST, etc.) → utiliser **Model${casing_1.toCasing.pascalCase(featureName)}**
 * 
 * **Caractéristiques** :
 * - Champs **optionnels** si \`optional: true\`
 * - Valeurs par défaut si \`default\` défini
 * - **Immutable** en pratique (via copyWith dans le Model)
 * 
 * @example
 * Exemple d'usage dans un UseCase
 * const user: Entity${casing_1.toCasing.pascalCase(featureName)} = await userRepository.getUserById("123");
 * 
 * @example
 * Valeur par défaut
 * const newUser: Entity${casing_1.toCasing.pascalCase(featureName)} = { isActive: true }; // si default: true
 */
export interface Entity${casing_1.toCasing.pascalCase(featureName)} {
${attrs
        .map((a) => {
        const optional = a.$optional ? "?" : "";
        // const defaultValue = a.default !== undefined ? ` = ${JSON.stringify(a.default)}` : "";
        const comment = a.$description ? `  /** ${a.$description} */\n` : "";
        return `${comment}  ${a.$name}${optional}: ${a.$type}${a.$nullable ? " | null" : ""};`; // ${defaultValue}
    })
        .join("\n")}
}
`;
};
exports.EntityTemplate = EntityTemplate;
