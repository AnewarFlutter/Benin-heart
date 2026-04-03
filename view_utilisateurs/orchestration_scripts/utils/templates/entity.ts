import { ModuleSchema, FeatureSchema, AttributeSchema, ModulesConfigSchema } from "../../config_validator";
import { generateImportsFromAttributes } from "../../tasks/modules/generate_imports_from_attributes";
import { toCasing } from "../casing";

export const EntityTemplate = (module: ModuleSchema, feature: FeatureSchema, attrs: AttributeSchema[], config: ModulesConfigSchema) => {
    const featureName = toCasing.pascalCase(feature.$name);

        const relatedImports = generateImportsFromAttributes(attrs, module, feature, config, "entity");
        return `\
${relatedImports ? relatedImports + "\n\n" : ""}/**
/**
 * Entity${toCasing.pascalCase(featureName)} – Entité métier du module **${module.$name}**
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
 * - DataSource (Firebase, REST, etc.) → utiliser **Model${toCasing.pascalCase(featureName)}**
 * 
 * **Caractéristiques** :
 * - Champs **optionnels** si \`optional: true\`
 * - Valeurs par défaut si \`default\` défini
 * - **Immutable** en pratique (via copyWith dans le Model)
 * 
 * @example
 * Exemple d'usage dans un UseCase
 * const user: Entity${toCasing.pascalCase(featureName)} = await userRepository.getUserById("123");
 * 
 * @example
 * Valeur par défaut
 * const newUser: Entity${toCasing.pascalCase(featureName)} = { isActive: true }; // si default: true
 */
export interface Entity${toCasing.pascalCase(featureName)} {
${attrs
                .map((a) => {
                    const optional = a.$optional ? "?" : "";
                    // const defaultValue = a.default !== undefined ? ` = ${JSON.stringify(a.default)}` : "";
                    const comment = a.$description ? `  /** ${a.$description} */\n` : "";
                    return `${comment}  ${a.$name}${optional}: ${a.$type}${a.$nullable ? " | null" : ""};`; // ${defaultValue}
                })
                .join("\n")}
}
`
    };