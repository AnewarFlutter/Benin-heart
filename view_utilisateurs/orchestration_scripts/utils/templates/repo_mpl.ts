import { ModuleSchema, FeatureSchema, ModulesConfigSchema } from "../../config_validator";
import { generateRepoImplMethodBody } from "../../tasks/modules/generate_repo_impl_method_body";
import { generateRepoImplMethodSignature } from "../../tasks/modules/generate_signatures";
import { toCasing } from "../casing";
import { collectRepoImplImports } from "../functions/module/imports/collect_repo_impl_imports";

export const RepoImplTemplate = (module: ModuleSchema, f: FeatureSchema, config: ModulesConfigSchema) => {
    const imports = collectRepoImplImports(f.$usecases?.filter(uc => !uc.$delete) ?? [], module, f, config).join('\n');
    const methods = (f.$usecases?.filter(uc => !uc.$delete) ?? []).map(uc => `
${generateRepoImplMethodSignature(uc)} {
${generateRepoImplMethodBody(uc, f.$name)}
    }`).join('\n');
    return `\
${imports}

/**
 * Implémentation concrète du repository pour ${f.$name}.
 * Délègue l'accès aux données à un datasource et mappe entre Model et Entity.
 */
export class ${toCasing.pascalCase(f.$name)}RepositoryImpl implements ${toCasing.pascalCase(f.$name)}Repository {
    constructor(private ds: ${toCasing.pascalCase(f.$name)}DataSource) {}

${methods}
}
`;
}