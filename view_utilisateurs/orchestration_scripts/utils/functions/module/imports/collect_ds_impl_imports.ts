import { UsecaseSchema, ModuleSchema, FeatureSchema, ModulesConfigSchema } from "../../../../config_validator";
import { toCasing } from "../../../casing";
import { getFileName } from "../../commons/file_name";
import { resolveImportPathForCustomType } from "./resolve_import_path_for_custom_type";
import { resolveImportPath } from "./resolve_import_paths";

// Collecter tous les imports uniques pour dsImpl
export function collectDsImplImports(
    usecases: UsecaseSchema[],
    currentModule: ModuleSchema,
    currentFeature: FeatureSchema,
    config: ModulesConfigSchema
): string[] {
    const imports = new Set<string>();

    // Import de base : datasource interface
    imports.add(`import { ${toCasing.pascalCase(currentFeature.$name)}DataSource } from "./${getFileName(currentModule.$fileNameCasing ?? 'snakeCase', `${currentFeature.$name}_data_source`)}";`);

    // Imports des modèles/types utilisés dans les params/retour
    usecases.forEach(uc => {
        uc.$params?.forEach(p => {
            if (p.$type.includes(`Model${toCasing.pascalCase(currentFeature.$name)}`)) {
                imports.add(`import { Model${toCasing.pascalCase(currentFeature.$name)} } from "../models/${getFileName(currentModule.$fileNameCasing ?? 'snakeCase', `model_${currentFeature.$name}`)}";`);
            }
        });
        if (uc.$returnType?.$type.includes(`Model${toCasing.pascalCase(currentFeature.$name)}`)) {
            imports.add(`import { Model${toCasing.pascalCase(currentFeature.$name)} } from "../models/${getFileName(currentModule.$fileNameCasing ?? 'snakeCase', `model_${currentFeature.$name}`)}";`);
        }
        uc.$imports?.forEach(imp => {
            const resolved = (imp.$kind === "custom" && imp.$step === "module") ?
                resolveImportPathForCustomType(imp, currentModule, config) :
                resolveImportPath(imp, currentModule, currentFeature, config, "datasource");
            imports.add(`import { ${resolved.type} } from "${resolved.from}";`);
        });
    });

    return Array.from(imports);
}
