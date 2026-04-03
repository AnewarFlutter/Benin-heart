"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveImportPathForCustomType = resolveImportPathForCustomType;
const parse_related_args_1 = require("../../../helpers/parse_related_args");
const file_name_1 = require("../../commons/file_name");
function safeArg(v) {
    return typeof v === "string" ? v : undefined;
}
/**
 * Resolve an import path from a usecase import string to a module path.
 * This function is only used for custom types.
 * @param imp - The import string to resolve.
 * @param currentModule - The current module.
 * @param config - The modules config.
 * @returns A resolved import path.
 */
function resolveImportPathForCustomType(imp, currentModule, config) {
    const argsParser = (0, parse_related_args_1.parseRelatedArgs)(imp.$from);
    const targetModuleName = safeArg(argsParser.module);
    if (!targetModuleName)
        throw new Error(`--module manquant dans ${imp.$from}`);
    const targetFeatureName = safeArg(argsParser.feature);
    const kind = safeArg(argsParser.kind) ?? "custom";
    // Trouver le module
    const targetModule = config.$modules.find(m => m.$name === targetModuleName);
    if (!targetModule) {
        throw new Error(`Module ${targetModuleName} not found for import ${imp.$from} in module ${currentModule.$name}`);
    }
    const casing = targetModule.$fileNameCasing ?? "snakeCase";
    const moduleFile = targetModuleName;
    let importPath = `@/modules/${moduleFile}`;
    if (targetFeatureName && typeof targetFeatureName === "string") {
        const targetFeature = targetModule.$features.find(f => f.$name === targetFeatureName);
        if (!targetFeature)
            throw new Error(`Feature ${targetFeatureName} not found in ${targetModuleName}`);
        const featureFile = (0, file_name_1.getFileName)(casing, targetFeatureName);
        importPath += `/${featureFile}`;
        if (kind === "entity") {
            return {
                type: imp.$name,
                from: `${importPath}/domain/entities/${(0, file_name_1.getFileName)(casing, `entity_${featureFile}`)}`
            };
        }
        if (kind === "custom") {
            return {
                type: imp.$name,
                from: `${importPath}/domain/types/${(0, file_name_1.getFileName)(casing, `${imp.$name}`)}`
            };
        }
        if (kind === "enum") {
            const enumName = imp.$name;
            const targetEnum = targetFeature.$enums?.find(e => e.$name === enumName);
            if (!targetEnum)
                throw new Error(`Enum ${enumName} introuvable dans ${targetFeatureName}`);
            if (targetEnum.$splitPerFile === true) {
                // Fichier séparé : sex_enum.ts
                return {
                    type: enumName,
                    from: `${importPath}/domain/enums/${(0, file_name_1.getFileName)(casing, enumName)}`
                };
            }
            else {
                // Fichier mergé : user_enums.ts
                return {
                    type: enumName,
                    from: `${importPath}/domain/enums/${featureFile}_enums`
                };
            }
        }
    }
    else {
        // Niveau module → custom type
        if (kind === "custom") {
            return {
                type: imp.$name,
                from: `${importPath}/types/${(0, file_name_1.getFileName)(casing, `${imp.$name}_types`)}`
            };
        }
        if (kind === "enum") {
            const enumName = imp.$name;
            const targetEnum = targetModule.$enums?.find(e => e.$name === enumName);
            if (!targetEnum)
                throw new Error(`Enum ${enumName} introuvable dans ${targetModuleName}`);
            if (targetEnum.$splitPerFile === true) {
                // Fichier séparé : sex_enum.ts
                return {
                    type: enumName,
                    from: `${importPath}/enums/${(0, file_name_1.getFileName)(casing, enumName)}`
                };
            }
            else {
                // Fichier mergé : user_enums.ts
                return {
                    type: enumName,
                    from: `${importPath}/enums/${moduleFile}_enums`
                };
            }
        }
    }
    throw new Error(`Invalid import: ${imp.$from} in module ${currentModule.$name}`);
}
