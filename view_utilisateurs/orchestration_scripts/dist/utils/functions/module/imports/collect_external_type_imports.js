"use strict";
// ────── Collecte imports externes : UNIQUEMENT via usecase.imports[] ──────
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectExternalTypeImports = collectExternalTypeImports;
const resolve_import_paths_1 = require("./resolve_import_paths");
/**
 * Collects all unique external type imports from usecases.
 * @param {UsecaseSchema[]} usecases - List of usecases.
 * @param {ModuleSchema} currentModule - Current module.
 * @param {FeatureSchema} currentFeature - Current feature.
 * @param {ModulesConfigSchema} config - Modules config.
 * @returns {string[]} List of unique import statements.
 */
function collectExternalTypeImports(usecases, currentModule, currentFeature, config) {
    const imports = new Set();
    usecases.forEach(uc => {
        uc.$imports?.forEach(imp => {
            const resolved = (0, resolve_import_paths_1.resolveImportPath)(imp, currentModule, currentFeature, config, "repository");
            imports.add(`import { ${resolved.type} } from "${resolved.from}";`);
        });
    });
    return Array.from(imports);
}
