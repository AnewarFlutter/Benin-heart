"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepoImplTemplate = void 0;
const generate_repo_impl_method_body_1 = require("../../tasks/modules/generate_repo_impl_method_body");
const generate_signatures_1 = require("../../tasks/modules/generate_signatures");
const casing_1 = require("../casing");
const collect_repo_impl_imports_1 = require("../functions/module/imports/collect_repo_impl_imports");
const RepoImplTemplate = (module, f, config) => {
    const imports = (0, collect_repo_impl_imports_1.collectRepoImplImports)(f.$usecases?.filter(uc => !uc.$delete) ?? [], module, f, config).join('\n');
    const methods = (f.$usecases?.filter(uc => !uc.$delete) ?? []).map(uc => `
${(0, generate_signatures_1.generateRepoImplMethodSignature)(uc)} {
${(0, generate_repo_impl_method_body_1.generateRepoImplMethodBody)(uc, f.$name)}
    }`).join('\n');
    return `\
${imports}

/**
 * Implémentation concrète du repository pour ${f.$name}.
 * Délègue l'accès aux données à un datasource et mappe entre Model et Entity.
 */
export class ${casing_1.toCasing.pascalCase(f.$name)}RepositoryImpl implements ${casing_1.toCasing.pascalCase(f.$name)}Repository {
    constructor(private ds: ${casing_1.toCasing.pascalCase(f.$name)}DataSource) {}

${methods}
}
`;
};
exports.RepoImplTemplate = RepoImplTemplate;
