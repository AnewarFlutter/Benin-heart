import { ModuleSchema, FeatureSchema, ModulesConfigSchema } from "../../config_validator";
import { generateDsImplMethodSignature } from "../../tasks/modules/generate_signatures";
import { toCasing } from "../casing";
import { collectDsImplImports } from "../functions/module/imports/collect_ds_impl_imports";

/**
 * Génère le code de l'implémentation REST du datasource pour la feature ${f.name}.
 * Importe les usecases de la feature, et génère une méthode pour chaque usecase.
 * Les méthodes générées lèvent une erreur "Method not implemented.".
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 * @param config La configuration globale de l'app.
 * @returns Le code de l'implémentation REST du datasource.
 */
export const RestDsImplTemplate = (module: ModuleSchema, f: FeatureSchema, config: ModulesConfigSchema) => {
    const imports = collectDsImplImports(f.$usecases?.filter(uc => !uc.$delete) ?? [], module, f, config).join('\n');
    const methods = (f.$usecases?.filter(uc => !uc.$delete) ?? []).map(uc => `
${generateDsImplMethodSignature(uc, f.$name)} {
        throw new Error("Method not implemented.");
    }`).join('\n');
    return `\
${imports}

/**
 * Implémentation REST du datasource pour ${f.$name}.
 * Toutes les méthodes sont à implémenter.
 */
export class RestApi${toCasing.pascalCase(f.$name)}DataSourceImpl implements ${toCasing.pascalCase(f.$name)}DataSource {
${methods}
}
`;
}