import { AttributeSchema, ModulesConfigSchema, ModuleSchema, FeatureSchema, UsecaseImportSchema, AttributeSchemaRelatedItem } from "../../config_validator";
import { parseImportFlags } from "../../utils/functions/module/imports/parse_import_flags";
import { resolveImportPathForCustomType } from "../../utils/functions/module/imports/resolve_import_path_for_custom_type";
import { resolveImportPath } from "../../utils/functions/module/imports/resolve_import_paths";

/**
 * Génère les imports pour les attributs d'une entité ou d'un modèle.
 * @param {AttributeSchema[]} attrs - Attributs de l'entité ou du modèle.
 * @param {ModulesConfigSchema} config - Configuration de l'application.
 * @param {ModuleSchema} currentModule - Module en cours.
 * @param {FeatureSchema} currentFeature - Feature en cours.
 * @returns {string} Les imports générés.
 */
export function generateImportsFromTypeAttributes(
    attrs: AttributeSchema[],
    config: ModulesConfigSchema,
    currentModule: ModuleSchema,
    currentFeature?: FeatureSchema,
): string {
    const imports = new Map<string, string>();

    attrs.forEach(attr => {
        const rawRelated = attr.$related;
        if (!rawRelated) return;

        // Normaliser en tableau de related items
        const relatedItems: AttributeSchemaRelatedItem[] = [];

        if (typeof rawRelated === "string") {
            // Cas ancien : related: "User"
            const flags = parseImportFlags(rawRelated);
            if (!flags?.name || !flags.module) return;
            relatedItems.push({
                $name: flags.name,
                $module: flags.module, // on suppose même module si pas précisé
                $feature: flags.feature ?? currentFeature?.$name,
                $kind: flags.kind ?? "entity", // ou "custom" selon ton usage historique
            });
        } else if (Array.isArray(rawRelated)) {
            // Cas nouveau : related: [ { name: "WeekDaysEnum", ... }, { name: "TimeSlot", ... } ]
            relatedItems.push(...rawRelated);
        } else {
            // Cas ancien objet unique : related: { name: "User", module: "...", ... }
            relatedItems.push(rawRelated);
        }

        // Pour chaque related → on génère l'import
        relatedItems.forEach(related => {
            const importName = related.$kind === "custom" || related.$kind === "enum" ? related.$name : attr.$type;

            const imp: UsecaseImportSchema = {
                $name: importName.replaceAll("[]", ""),
                $from: `--module ${related.$module} ${related.$feature ? `--feature ${related.$feature}` : ""} --kind ${related.$kind ?? "custom"}`,
            };

            try {
                const resolved = currentFeature && related.$kind !== "custom"
                    ? resolveImportPath(imp, currentModule, currentFeature, config, "repository")
                    : resolveImportPathForCustomType(imp, currentModule, config);

                const importLine = `import { ${resolved.type} } from "${resolved.from}";`;
                if (!imports.has(importLine)) {
                    imports.set(importLine, importLine);
                }
            } catch (e) {
                const context = currentFeature
                    ? `${currentFeature.$name} (${currentModule.$name})`
                    : currentModule.$name;
                console.warn(`[Import] Échec résolution pour ${attr.$name} → ${importName} dans ${context}`, e);
            }
        });
    });

    return Array.from(imports.values()).join("\n");
}