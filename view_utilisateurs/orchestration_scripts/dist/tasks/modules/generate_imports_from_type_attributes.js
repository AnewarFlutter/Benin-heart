"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateImportsFromTypeAttributes = generateImportsFromTypeAttributes;
const parse_import_flags_1 = require("../../utils/functions/module/imports/parse_import_flags");
const resolve_import_path_for_custom_type_1 = require("../../utils/functions/module/imports/resolve_import_path_for_custom_type");
const resolve_import_paths_1 = require("../../utils/functions/module/imports/resolve_import_paths");
/**
 * Génère les imports pour les attributs d'une entité ou d'un modèle.
 * @param {AttributeSchema[]} attrs - Attributs de l'entité ou du modèle.
 * @param {ModulesConfigSchema} config - Configuration de l'application.
 * @param {ModuleSchema} currentModule - Module en cours.
 * @param {FeatureSchema} currentFeature - Feature en cours.
 * @returns {string} Les imports générés.
 */
function generateImportsFromTypeAttributes(attrs, config, currentModule, currentFeature) {
    const imports = new Map();
    attrs.forEach(attr => {
        const rawRelated = attr.$related;
        if (!rawRelated)
            return;
        // Normaliser en tableau de related items
        const relatedItems = [];
        if (typeof rawRelated === "string") {
            // Cas ancien : related: "User"
            const flags = (0, parse_import_flags_1.parseImportFlags)(rawRelated);
            if (!flags?.name || !flags.module)
                return;
            relatedItems.push({
                $name: flags.name,
                $module: flags.module, // on suppose même module si pas précisé
                $feature: flags.feature ?? currentFeature?.$name,
                $kind: flags.kind ?? "entity", // ou "custom" selon ton usage historique
            });
        }
        else if (Array.isArray(rawRelated)) {
            // Cas nouveau : related: [ { name: "WeekDaysEnum", ... }, { name: "TimeSlot", ... } ]
            relatedItems.push(...rawRelated);
        }
        else {
            // Cas ancien objet unique : related: { name: "User", module: "...", ... }
            relatedItems.push(rawRelated);
        }
        // Pour chaque related → on génère l'import
        relatedItems.forEach(related => {
            const importName = related.$kind === "custom" || related.$kind === "enum" ? related.$name : attr.$type;
            const imp = {
                $name: importName.replaceAll("[]", ""),
                $from: `--module ${related.$module} ${related.$feature ? `--feature ${related.$feature}` : ""} --kind ${related.$kind ?? "custom"}`,
            };
            try {
                const resolved = currentFeature && related.$kind !== "custom"
                    ? (0, resolve_import_paths_1.resolveImportPath)(imp, currentModule, currentFeature, config, "repository")
                    : (0, resolve_import_path_for_custom_type_1.resolveImportPathForCustomType)(imp, currentModule, config);
                const importLine = `import { ${resolved.type} } from "${resolved.from}";`;
                if (!imports.has(importLine)) {
                    imports.set(importLine, importLine);
                }
            }
            catch (e) {
                const context = currentFeature
                    ? `${currentFeature.$name} (${currentModule.$name})`
                    : currentModule.$name;
                console.warn(`[Import] Échec résolution pour ${attr.$name} → ${importName} dans ${context}`, e);
            }
        });
    });
    return Array.from(imports.values()).join("\n");
}
