"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateImportsFromAttributes = generateImportsFromAttributes;
const resolve_import_paths_1 = require("../../utils/functions/module/imports/resolve_import_paths");
/**
 * Génère les imports pour les attributs d'une entité ou d'un modèle.
 * Supporte :
 * - related: "TypeName" (ancien format)
 * - related: { name: "TypeName", module: "...", feature: "...", kind: "..." }
 * - related: [ { ... }, { ... } ] → plusieurs dépendances (nouveau cas)
 */
function generateImportsFromAttributes(attrs, currentModule, currentFeature, config, context) {
    const imports = new Map();
    attrs.forEach(attr => {
        const rawRelated = attr.$related;
        if (!rawRelated)
            return;
        // Normaliser en tableau de related items (toujours un tableau après ça)
        const relatedItems = [];
        if (typeof rawRelated === "string") {
            // Cas 1 : related: "WeekDaysEnum"
            relatedItems.push({
                $name: rawRelated,
                $module: currentModule.$name,
                $feature: currentFeature.$name,
                $kind: context === "model" ? "datasource" : "repository", // ou "enum" selon ta convention — ici on prend "custom" par défaut
            });
        }
        else if (Array.isArray(rawRelated)) {
            // Cas 2 : related: [ { name: "...", ... }, ... ]
            relatedItems.push(...rawRelated);
        }
        else {
            // Cas 3 : related: { name: "...", module: "...", ... }
            relatedItems.push(rawRelated);
        }
        // Pour chaque dépendance → on génère l'import
        relatedItems.forEach(related => {
            const importName = related.$kind === "custom" || related.$kind === "enum"
                ? related.$name
                : attr.$type; // si c'est une entity, on importe le type de l'attribut (ex: User)
            const imp = {
                $name: importName.replaceAll("[]", ""),
                $from: `--module ${related.$module} ${related.$feature ? `--feature ${related.$feature}` : ""} --kind ${related.$kind ?? "custom"}`.trim(),
            };
            try {
                const resolved = (0, resolve_import_paths_1.resolveImportPath)(imp, currentModule, currentFeature, config, context === "model" ? "datasource" : "repository");
                const importLine = `import { ${resolved.type} } from "${resolved.from}";`;
                if (!imports.has(importLine)) {
                    imports.set(importLine, importLine);
                }
            }
            catch (e) {
                console.warn(`Import échoué pour attribut "${attr.$name}" → ${importName} ` +
                    `(related: ${related.$name}) dans ${currentFeature.$name} (${currentModule.$name})`, e);
            }
        });
    });
    return Array.from(imports.values()).join("\n");
}
