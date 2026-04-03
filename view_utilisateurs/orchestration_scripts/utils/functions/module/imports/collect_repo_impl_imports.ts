import { UsecaseSchema, ModuleSchema, FeatureSchema, ModulesConfigSchema } from "../../../../config_validator";
import { toCasing } from "../../../casing";
import { getFileName } from "../../commons/file_name";
import { resolveImportPath } from "./resolve_import_paths";

// NOUVELLE FONCTION : Collecter tous les imports uniques pour repoImpl
export function collectRepoImplImports(
    usecases: UsecaseSchema[],
    currentModule: ModuleSchema,
    currentFeature: FeatureSchema,
    config: ModulesConfigSchema
): string[] {
    const imports = new Set<string>();

    // Imports standards
    imports.add(`import { ${toCasing.pascalCase(currentFeature.$name)}DataSource } from "../datasources/${getFileName(currentModule.$fileNameCasing ?? 'snakeCase', `${currentFeature.$name}_data_source`)}";`);
    if (currentFeature.$entity) {
        imports.add(`import { Model${toCasing.pascalCase(currentFeature.$name)} } from "../models/${getFileName(currentModule.$fileNameCasing ?? 'snakeCase', `model_${currentFeature.$name}`)}";`);
    }
    imports.add(`import { ${toCasing.pascalCase(currentFeature.$name)}Repository } from "../../domain/repositories/${getFileName(currentModule.$fileNameCasing ?? 'snakeCase', `${currentFeature.$name}_repository`)}";`);

    // Imports supplémentaires des usecases
    usecases.forEach(uc => {
        uc.$imports?.forEach(imp => {
            const resolved = resolveImportPath(imp, currentModule, currentFeature, config, "repository");
            imports.add(`import { ${resolved.type} } from "${resolved.from}";`);
        });
    });

    return Array.from(imports);
}