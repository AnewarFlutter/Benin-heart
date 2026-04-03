import { UsecaseSchema, ModuleSchema, FeatureSchema, ModulesConfigSchema } from "../../../../config_validator";
import { toCasing } from "../../../casing";
import { getFileName } from "../../commons/file_name";
import { resolveImportPath } from "./resolve_import_paths";

// ────── Nouvelle fonction : collectUsecaseImports ──────
export function collectUsecaseImports(
    uc: UsecaseSchema,
    currentModule: ModuleSchema,
    currentFeature: FeatureSchema,
    config: ModulesConfigSchema
): string[] {
    const imports = new Set<string>();

    // 1. Import obligatoire : Repository local
    const repoName = `${toCasing.pascalCase(currentFeature.$name)}Repository`;
    const repoFile = getFileName(currentModule.$fileNameCasing ?? "snakeCase", `${currentFeature.$name}_repository`);
    imports.add(`import { ${repoName} } from "../repositories/${repoFile}";`);

    // 2. Imports des types dans params / return (via config.imports)
    uc.$imports?.forEach(imp => {
        const resolved = resolveImportPath(imp, currentModule, currentFeature, config, "repository");
        imports.add(`import { ${resolved.type} } from "${resolved.from}";`);
    });

    // 3. Si returnType ou params utilisent Entity local → pas d'import supplémentaire (déjà dans repo)
    //    Si autre Model/Entity → déjà géré via imports[]

    return Array.from(imports);
}
