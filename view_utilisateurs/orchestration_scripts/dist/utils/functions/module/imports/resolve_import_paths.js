"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveImportPath = resolveImportPath;
const casing_1 = require("../../../casing");
const parse_related_args_1 = require("../../../helpers/parse_related_args");
const file_name_1 = require("../../commons/file_name");
function safeArg(v) {
    return typeof v === "string" ? v : undefined;
}
/**
 * Resolve an import path from a usecase import string to a module path.
 * Example: resolveImportPath({ from: "--module user_management --feature user --kind custom" }, currentModule, currentFeature, config)
 * @param imp - The import string to resolve.
 * @param currentModule - The current module.
 * @param currentFeature - The current feature.
 * @param config - The modules config.
 * @param context - The context of the import, either "repository" or "datasource".
 * @returns A resolved import path.
 */
function resolveImportPath(imp, currentModule, currentFeature, config, context // ← NOUVEAU
) {
    const argsParser = (0, parse_related_args_1.parseRelatedArgs)(imp.$from);
    const targetModuleName = safeArg(argsParser.module);
    if (!targetModuleName)
        throw new Error(`--module manquant dans ${imp.$from}`);
    const targetFeatureName = safeArg(argsParser.feature);
    const kind = safeArg(argsParser.kind) ?? "custom";
    // Trouver le module
    const targetModule = config.$modules.find(m => m.$name === targetModuleName);
    if (!targetModule) {
        throw new Error(`Module ${targetModuleName} not found for import ${imp.$from} in feature ${currentFeature.$name} inside module ${currentModule.$name}`);
    }
    const casing = targetModule.$fileNameCasing ?? "snakeCase";
    const moduleFile = targetModuleName;
    let importPath = `@/modules/${moduleFile}`;
    if (targetFeatureName && typeof targetFeatureName === "string") {
        const targetFeature = targetModule.$features.find(f => f.$name === targetFeatureName);
        if (!targetFeature)
            throw new Error(`Feature ${targetFeatureName} not found in ${targetModuleName}`);
        const featureFile = (0, file_name_1.getFileName)(casing, targetFeatureName.toString());
        importPath += `/${featureFile}`;
        // === NOUVELLE LOGIQUE : DataSource vs Repository ===
        const isSameModule = targetModuleName === currentModule.$name;
        if (kind === "entity") {
            if (context === "datasource" && isSameModule) {
                // Vérifier si on est dans la meme feature
                if (targetFeatureName !== currentFeature.$name) {
                    // DataSource → Entity
                    return {
                        type: `Entity${casing_1.toCasing.pascalCase(targetFeatureName.toString())}`,
                        from: `${importPath}/domain/entities/${(0, file_name_1.getFileName)(casing, `entity_${featureFile}`)}`
                    };
                }
                // DataSource → Model
                return {
                    type: `Model${casing_1.toCasing.pascalCase(targetFeatureName)}`,
                    from: `../models/${(0, file_name_1.getFileName)(casing, `model_${featureFile}`)}`
                };
            }
            else {
                // Repository ou autre module → Entity
                return {
                    type: imp.$name,
                    from: `${importPath}/domain/entities/${(0, file_name_1.getFileName)(casing, `entity_${featureFile}`)}`
                };
            }
        }
        if (kind === "model") {
            return {
                type: imp.$name,
                from: `${importPath}/data/models/${(0, file_name_1.getFileName)(casing, `model_${featureFile}`)}`
            };
        }
        if (kind === "custom") {
            if (argsParser.step) {
                if (argsParser.step === "module") {
                    return {
                        type: imp.$name,
                        from: `${importPath}/types/${(0, file_name_1.getFileName)(casing, imp.$name)}_types`
                    };
                }
            }
            return {
                type: imp.$name,
                from: `${importPath}/domain/types/${(0, file_name_1.getFileName)(casing, imp.$name)}`
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
            if (argsParser.step) {
                if (argsParser.step === "module") {
                    return {
                        type: imp.$name,
                        from: `${importPath}/types/${(0, file_name_1.getFileName)(casing, imp.$name)}_types`
                    };
                }
            }
            return {
                type: imp.$name,
                from: `${importPath}/types/${(0, file_name_1.getFileName)(casing, imp.$name)}_types`
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
    throw new Error(`Invalid import: ${imp.$from} in feature ${currentFeature.$name} inside module ${currentModule.$name}`);
}
