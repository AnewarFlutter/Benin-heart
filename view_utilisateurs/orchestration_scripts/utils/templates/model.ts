import { ModuleSchema, FeatureSchema, AttributeSchema, ModulesConfigSchema } from "../../config_validator";
import { generateImportsFromAttributes } from "../../tasks/modules/generate_imports_from_attributes";
import { toCasing } from "../casing";
import { getDefaultValueForType } from "../functions/commons/default_values";
import { getFileName } from "../functions/commons/file_name";

export const ModelTemplate = (module: ModuleSchema, feature: FeatureSchema, attrs: AttributeSchema[], config: ModulesConfigSchema) => {
    const featureName = toCasing.pascalCase(feature.$name);
    const featureFile = getFileName(module.$fileNameCasing ?? "snakeCase", `entity_${feature.$name}`);
        const entityImport = `import { Entity${toCasing.pascalCase(featureName)} } from "../../domain/entities/${featureFile}";`;

        const relatedImports = generateImportsFromAttributes(attrs, module, feature, config, "model");

        const allImports = [entityImport];
        if (relatedImports) allImports.unshift(relatedImports);

        return `\
${allImports.join("\n")}

/**
 *  Model${toCasing.pascalCase(feature.$name)} – Implémentation technique de l'entité ${toCasing.pascalCase(feature.$name)}
 * 
 * **Rôle** : Pont entre la couche **data** (JSON/API) et la couche **domaine** (Entity${toCasing.pascalCase(feature.$name)}).
 * 
 * **Fonctionnalités** :
 * - Conversions bidirectionnelles : Entity ↔ Model ↔ JSON
 * - Support des payloads partiels (tous les champs optionnels + nullables)
 * - Méthodes utilitaires : copyWith, fromPartialEntity, gestion des listes
 * 
 * **Cas d'usage** :
 * - RepositoryImpl : Model ↔ Entity
 * - DataSourceImpl : JSON ↔ Model
 * - API/Client : sérialisation/désérialisation
 * 
 * **Configuration** : Respecte \`parseFromJsonCaseType\` du module ${module.$name}
 * 
 * @implements {Entity${toCasing.pascalCase(feature.$name)}}
 * @example
 * Créer depuis JSON
 * const model = Model${toCasing.pascalCase(feature.$name)}.fromJson(apiResponse);
 * 
 * Convertir vers entité métier
 * const entity = model.toEntity();
 * 
 * Mise à jour partielle
 * const updated = model.copyWith({ email: "new@example.com" });
 */
export class Model${toCasing.pascalCase(feature.$name)} implements Entity${toCasing.pascalCase(feature.$name)} {
${attrs
                .map((a) => `  ${a.$name}${a.$optional ? "?" : ""}: ${a.$type}${a.$nullable ? " | null" : ""};`)
                .join("\n")}

    /**
     * **Constructeur** – Copie directe d'une entité partielle
     * 
     * @param data Données partielles de l'entité (tous les champs optionnels)
     * @example
     * const model = new Model${toCasing.pascalCase(feature.$name)}({ id: "123", email: "user@example.com" });
     */
    constructor(data: Partial<Entity${toCasing.pascalCase(feature.$name)}>) {
        Object.assign(this, data);
        ${attrs.filter((a) => !a.$optional)
                .map((a) => {
                    return `this.${a.$name} = data.${a.$name}${a.$nullable ? (a.$default ? ` ?? ${a.$default}` : " ?? null") : a.$default ? ` ?? ${a.$default}` : (` ?? ${getDefaultValueForType(a.$type)}`)};`;
                })
                .join("\n")}
    }

    /** ═══════════════════════════════════════════════════════════════════════
     *  🔄 CONVERSIONS ENTITY ↔ MODEL
     *  ═══════════════════════════════════════════════════════════════════════ */

    /**
     * **fromEntity** – Crée un Model depuis une Entity${toCasing.pascalCase(feature.$name)}
     * 
     * @param entity Entité métier complète
     * @returns Model${toCasing.pascalCase(feature.$name)} avec tous les champs mappés
     * @example
     * const entity = { id: "123", email: "user@example.com" };
     * const model = Model${toCasing.pascalCase(feature.$name)}.fromEntity(entity);
     */
    static fromEntity(entity: Partial<Entity${toCasing.pascalCase(feature.$name)}>): Model${toCasing.pascalCase(feature.$name)} {
        return new Model${toCasing.pascalCase(feature.$name)}({
    ${attrs
                .map((a) => `      ${a.$name}: entity.${a.$name}${a.$optional ? (a.$nullable ? " ?? null" : " ?? undefined") : ""},`)
                .join("\n")}
        });
    }

    /**
     * **toEntity** – Convertit le Model vers une Entity${toCasing.pascalCase(feature.$name)}
     * 
     * @returns Entity${toCasing.pascalCase(feature.$name)} avec tous les champs non-null
     * @example
     * const entity = model.toEntity(); // { id: "123", email: "user@example.com" }
     */
    toEntity(): Entity${toCasing.pascalCase(feature.$name)} {
        return {
    ${attrs
            .map((a) => `      ${a.$name}: this.${a.$name}${a.$optional ? " ?? undefined" : ""},`)
                .join("\n")}
        };
    }

    /** ═══════════════════════════════════════════════════════════════════════
     *  📦 JSON ↔ MODEL (respecte parseFromJsonCaseType)
     *  ═══════════════════════════════════════════════════════════════════════ */

    /**
     * **fromJson** – Désérialise JSON → Model${toCasing.pascalCase(feature.$name)}
     * 
     * **Format** : Respecte \`parseFromJsonCaseType\` du module (camelCase/snakeCase)
     * 
     * @param json Objet JSON brut (API response)
     * @returns Model${toCasing.pascalCase(feature.$name)} avec mapping automatique
     * @example
     * Si parseFromJsonCaseType = 'snake_case'
     * const json = { first_name: "John", email: "john@example.com" };
     * const model = Model${toCasing.pascalCase(feature.$name)}.fromJson(json);
     */
    static fromJson(json: Record<string, unknown>): Model${toCasing.pascalCase(feature.$name)} {
        return new Model${toCasing.pascalCase(feature.$name)}({
    ${attrs
                .map((a) => {
                    const jsonKey = feature.$entity?.$parseFromJsonCaseType === 'snakeCase'
                        ? toCasing.snakeCase(a.$name)
                        : toCasing.camelCase(a.$name);
                    return `      ${a.$name}: json.${jsonKey} as ${a.$type} ${a.$nullable ? " | null" : (a.$optional ? " | undefined" : "")},`;
                })
                .join("\n")}
        });
    }

    /**
     * **fromJsonList** – Désérialise une liste JSON → liste de Models
     * 
     * @param jsonList Tableau d'objets JSON
     * @returns Model${toCasing.pascalCase(feature.$name)}[] avec mapping automatique
     * @example
     * const jsonList = [{ first_name: "John" }, { first_name: "Jane" }];
     * const models = Model${toCasing.pascalCase(feature.$name)}.fromJsonList(jsonList);
     */
    static fromJsonList(jsonList: Record<string, unknown>[]): Model${toCasing.pascalCase(feature.$name)}[] {
        return jsonList.map(Model${toCasing.pascalCase(feature.$name)}.fromJson);
    }

    /**
     * **toJson** – Sérialise Model → JSON (format API)
     * 
     * **Format** : Respecte \`parseFromJsonCaseType\` du module
     * 
     * @returns Objet JSON avec tous les champs non-null
     * @example
     * Si parseFromJsonCaseType = 'snake_case'
     * { first_name: "John", email: "john@example.com" }
     */
    toJson(): Record<string, unknown> {
        return {
    ${attrs
                .map((a) => {
                    const jsonKey = feature.$entity?.$parseFromJsonCaseType === 'snakeCase'
                        ? toCasing.snakeCase(a.$name)
                        : toCasing.camelCase(a.$name);
                    return `      ${jsonKey}: this.${a.$name} ?? null,`;
                })
                .join("\n")}
        };
    }

    /**
     * **toJsonWithoutId** – JSON sans l'ID (création)
     * 
     * @returns JSON sans champ \`id\`
     * @example
     * const json = model.toJsonWithoutId(); // { first_name: "John" }
     */
    toJsonWithoutId(): Record<string, unknown> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = this.toJson();
        return rest;
    }

    /** ═══════════════════════════════════════════════════════════════════════
     *  📋 GESTION DES LISTES
     *  ═══════════════════════════════════════════════════════════════════════ */

    /**
     * **fromEntities** – Liste Entity → Liste Model
     * 
     * @param entities Tableau d'entités métier
     * @returns Model${toCasing.pascalCase(feature.$name)}[]
     */
    static fromEntities(entities: Entity${toCasing.pascalCase(feature.$name)}[]): Model${toCasing.pascalCase(feature.$name)}[] {
        return entities.map(Model${toCasing.pascalCase(feature.$name)}.fromEntity);
    }

    /**
     * **toEntities** – Liste Model → Liste Entity
     * 
     * @param models Tableau de modèles
     * @returns Entity${toCasing.pascalCase(feature.$name)}[]
     */
    static toEntities(models: Model${toCasing.pascalCase(feature.$name)}[]): Entity${toCasing.pascalCase(feature.$name)}[] {
        return models.map(m => m.toEntity());
    }

    /** ═══════════════════════════════════════════════════════════════════════
     *  ✏️ MISE À JOUR PARTIELLE
     *  ═══════════════════════════════════════════════════════════════════════ */

    /**
     * **copyWith** – Mise à jour partielle (immutable)
     * 
     * @param data Champs à modifier
     * @returns Nouveau Model avec modifications
     * @example
     * const updated = model.copyWith({ email: "new@example.com" });
     */
    copyWith(data: Partial<Entity${toCasing.pascalCase(feature.$name)}>): Model${toCasing.pascalCase(feature.$name)} {
        return new Model${toCasing.pascalCase(feature.$name)}({
            ...this.toEntity(),
            ...data,
        });
    }

    /**
     * **fromPartialEntity** – Création depuis données partielles
     * 
     * @param data Données partielles
     * @returns Nouveau Model
     * @example
     * const model = Model${toCasing.pascalCase(feature.$name)}.fromPartialEntity({ email: "user@example.com" });
     */
    static fromPartialEntity(data: Partial<Entity${toCasing.pascalCase(feature.$name)}>): Model${toCasing.pascalCase(feature.$name)} {
        return new Model${toCasing.pascalCase(feature.$name)}(data);
    }
}
`;
    }