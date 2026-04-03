import { AttributeSchema, ModuleSchema, FeatureSchema, ModulesConfigSchema, UsecaseImportSchema } from "../../config_validator";
import { resolveImportPath } from "../../utils/functions/module/imports/resolve_import_paths";

/**
 * Génère les imports pour les attributs d'une entité ou d'un modèle.
 * Supporte :
 * - related: "TypeName" (ancien format)
 * - related: { name: "TypeName", module: "...", feature: "...", kind: "..." }
 * - related: [ { ... }, { ... } ] → plusieurs dépendances (nouveau cas)
 */
export function generateImportsFromAttributes(
    attrs: AttributeSchema[],
    currentModule: ModuleSchema,
    currentFeature: FeatureSchema,
    config: ModulesConfigSchema,
    context: "entity" | "model"
): string {
    const imports = new Map<string, string>();

    attrs.forEach(attr => {
        const rawRelated = attr.$related;
        if (!rawRelated) return;

        // Normaliser en tableau de related items (toujours un tableau après ça)
        const relatedItems: Array<{ $name: string; $module: string; $feature?: string; $kind?: string }> = [];

        if (typeof rawRelated === "string") {
            // Cas 1 : related: "WeekDaysEnum"
            relatedItems.push({
                $name: rawRelated,
                $module: currentModule.$name,
                $feature: currentFeature.$name,
                $kind: context === "model" ? "datasource" : "repository", // ou "enum" selon ta convention — ici on prend "custom" par défaut
            });
        } else if (Array.isArray(rawRelated)) {
            // Cas 2 : related: [ { name: "...", ... }, ... ]
            relatedItems.push(...rawRelated);
        } else {
            // Cas 3 : related: { name: "...", module: "...", ... }
            relatedItems.push(rawRelated);
        }

        // Pour chaque dépendance → on génère l'import
        relatedItems.forEach(related => {
            const importName = related.$kind === "custom" || related.$kind === "enum"
                ? related.$name
                : attr.$type; // si c'est une entity, on importe le type de l'attribut (ex: User)

            const imp: UsecaseImportSchema = {
                $name: importName.replaceAll("[]", ""),
                $from: `--module ${related.$module} ${related.$feature ? `--feature ${related.$feature}` : ""
                    } --kind ${related.$kind ?? "custom"}`.trim(),
            };

            try {
                const resolved = resolveImportPath(
                    imp,
                    currentModule,
                    currentFeature,
                    config,
                    context === "model" ? "datasource" : "repository"
                );

                const importLine = `import { ${resolved.type} } from "${resolved.from}";`;
                if (!imports.has(importLine)) {
                    imports.set(importLine, importLine);
                }
            } catch (e) {
                console.warn(
                    `Import échoué pour attribut "${attr.$name}" → ${importName} ` +
                    `(related: ${related.$name}) dans ${currentFeature.$name} (${currentModule.$name})`,
                    e
                );
            }
        });
    });

    return Array.from(imports.values()).join("\n");
}