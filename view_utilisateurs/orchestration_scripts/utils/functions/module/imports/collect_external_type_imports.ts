// ────── Collecte imports externes : UNIQUEMENT via usecase.imports[] ──────

import { UsecaseSchema, ModuleSchema, FeatureSchema, ModulesConfigSchema } from "../../../../config_validator";
import { resolveImportPath } from "./resolve_import_paths";

/**
 * Collects all unique external type imports from usecases.
 * @param {UsecaseSchema[]} usecases - List of usecases.
 * @param {ModuleSchema} currentModule - Current module.
 * @param {FeatureSchema} currentFeature - Current feature.
 * @param {ModulesConfigSchema} config - Modules config.
 * @returns {string[]} List of unique import statements.
 */
export function collectExternalTypeImports(
    usecases: UsecaseSchema[],
    currentModule: ModuleSchema,
    currentFeature: FeatureSchema,
    config: ModulesConfigSchema
): string[] {
    const imports = new Set<string>();

    usecases.forEach(uc => {
        uc.$imports?.forEach(imp => {
            const resolved = resolveImportPath(imp, currentModule, currentFeature, config, "repository");
            imports.add(`import { ${resolved.type} } from "${resolved.from}";`);
        });
    });

    return Array.from(imports);
}
