import { AttributeSchema, ModuleSchema, FeatureSchema, ModulesConfigSchema, UsecaseImportSchema } from "../../config_validator";
import { resolveImportPath } from "../../utils/functions/module/imports/resolve_import_paths";

export function generateImportsFromAttributesRecursive(
    attrs: AttributeSchema[],
    currentModule: ModuleSchema,
    currentFeature: FeatureSchema,
    config: ModulesConfigSchema,
    context: "entity" | "model",
    imports = new Map<string, string>(),
    visited = new Set<string>() // pour éviter les boucles infinies
): string {

    attrs.forEach(attr => {
        const rawRelated = attr.$related;
        if (!rawRelated) return;

        const relatedItems: Array<{ $name: string; $module: string; $feature?: string; $kind?: string }> = [];

        if (typeof rawRelated === "string") {
            relatedItems.push({
                $name: rawRelated,
                $module: currentModule.$name,
                $feature: currentFeature.$name,
                $kind: context === "model" ? "datasource" : "repository",
            });
        } else if (Array.isArray(rawRelated)) {
            relatedItems.push(...rawRelated);
        } else {
            relatedItems.push(rawRelated);
        }

        relatedItems.forEach(related => {
            // clé unique pour éviter les doublons / boucles
            const key = `${related.$module}/${related.$feature ?? ""}/${related.$name}`;
            if (visited.has(key)) return;
            visited.add(key);

            const importName = related.$kind === "custom" || related.$kind === "enum"
                ? related.$name
                : attr.$type;

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

                // Si le related est un objet / entity custom, on récupère ses attributs pour descendre récursivement
                if (related.$kind === "custom" || related.$kind === "entity" || related.$kind === "enum") {
                    let relatedAttrs: AttributeSchema[] | undefined;

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
                        
                        const relatedModule = config.$modules.find(m => m.$name === related.$module);
                        const relatedFeature = config.$modules
                            .flatMap(m => m.$features ?? [])
                            .find(f => f.$name === related.$feature); // peut être undefined pour custom

                        generateImportsFromAttributesRecursive(
                            relatedAttrs,
                            relatedModule!,
                            relatedFeature ?? { $name: "" } as FeatureSchema,
                            config,
                            context,
                            imports,
                            visited
                        );
                    }
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
