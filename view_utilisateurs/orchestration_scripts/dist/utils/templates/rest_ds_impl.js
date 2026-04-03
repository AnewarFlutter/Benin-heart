"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestDsImplTemplate = void 0;
const generate_signatures_1 = require("../../tasks/modules/generate_signatures");
const casing_1 = require("../casing");
const collect_ds_impl_imports_1 = require("../functions/module/imports/collect_ds_impl_imports");
/**
 * Génère le code de l'implémentation REST du datasource pour la feature ${f.name}.
 * Importe les usecases de la feature, et génère une méthode pour chaque usecase.
 * Les méthodes générées lèvent une erreur "Method not implemented.".
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 * @param config La configuration globale de l'app.
 * @returns Le code de l'implémentation REST du datasource.
 */
const RestDsImplTemplate = (module, f, config) => {
    const imports = (0, collect_ds_impl_imports_1.collectDsImplImports)(f.$usecases?.filter(uc => !uc.$delete) ?? [], module, f, config).join('\n');
    const methods = (f.$usecases?.filter(uc => !uc.$delete) ?? []).map(uc => `
${(0, generate_signatures_1.generateDsImplMethodSignature)(uc, f.$name)} {
        throw new Error("Method not implemented.");
    }`).join('\n');
    return `\
${imports}

/**
 * Implémentation REST du datasource pour ${f.$name}.
 * Toutes les méthodes sont à implémenter.
 */
export class RestApi${casing_1.toCasing.pascalCase(f.$name)}DataSourceImpl implements ${casing_1.toCasing.pascalCase(f.$name)}DataSource {
${methods}
}
`;
};
exports.RestDsImplTemplate = RestDsImplTemplate;
