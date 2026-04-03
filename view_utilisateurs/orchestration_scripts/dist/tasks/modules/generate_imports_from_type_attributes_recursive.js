"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateImportsFromTypeAttributesRecursive = generateImportsFromTypeAttributesRecursive;
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
function generateImportsFromTypeAttributesRecursive(attrs, config, currentModule, currentFeature, imports = new Map(), visited = new Set()) {
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
                if (related.$kind === "custom" || related.$kind === "entity" || related.$kind === "enum") {
                    let relatedAttrs;
                    // 1️⃣ Cherche dans les features si c'est une entity
                    if (related.$kind === "entity") {
                        const relatedModule = config.$modules.find(m => m.$name === related.$module);
                        const relatedFeature = relatedModule?.$features?.find(f => f.$name === related.$feature);
                        relatedAttrs = relatedFeature?.$entity?.$attributes;
                    }
                    // 2️⃣ Cherche dans les types custom du module si le module n'a pas de feature
                    if (!relatedAttrs && related.$kind === "custom" && related.$feature === undefined) {
                        const relatedModule = config.$modules.find(m => m.$name === related.$module);
                        const relatedCustom = relatedModule?.$types?.find(ct => ct.$name === related.$name);
                        relatedAttrs = relatedCustom?.$attributes;
                    }
                    // 3️⃣ Cherche dans les types custom de la feature si le module a une feature
                    if (!relatedAttrs && related.$kind === "custom" && related.$feature) {
                        const relatedModule = config.$modules.find(m => m.$name === related.$module);
                        const relatedFeature = relatedModule?.$features?.find(f => f.$name === related.$feature);
                        const relatedCustom = relatedFeature?.$types?.find(ct => ct.$name === related.$name);
                        relatedAttrs = relatedCustom?.$attributes;
                    }
                    // 3️⃣ Si attributs trouvés → récursion
                    if (relatedAttrs && relatedAttrs.length > 0) {
                        console.warn(`(related: ${relatedAttrs})`);
                        const relatedModule = config.$modules.find(m => m.$name === related.$module);
                        const relatedFeature = config.$modules
                            .flatMap(m => m.$features ?? [])
                            .find(f => f.$name === related.$feature); // peut être undefined pour custom
                        generateImportsFromTypeAttributesRecursive(relatedAttrs, config, relatedModule, relatedFeature ?? { $name: "" }, imports, visited);
                    }
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
