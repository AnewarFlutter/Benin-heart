"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectRepoImplImports = collectRepoImplImports;
const casing_1 = require("../../../casing");
const file_name_1 = require("../../commons/file_name");
const resolve_import_paths_1 = require("./resolve_import_paths");
// NOUVELLE FONCTION : Collecter tous les imports uniques pour repoImpl
function collectRepoImplImports(usecases, currentModule, currentFeature, config) {
    const imports = new Set();
    // Imports standards
    imports.add(`import { ${casing_1.toCasing.pascalCase(currentFeature.$name)}DataSource } from "../datasources/${(0, file_name_1.getFileName)(currentModule.$fileNameCasing ?? 'snakeCase', `${currentFeature.$name}_data_source`)}";`);
    if (currentFeature.$entity) {
        imports.add(`import { Model${casing_1.toCasing.pascalCase(currentFeature.$name)} } from "../models/${(0, file_name_1.getFileName)(currentModule.$fileNameCasing ?? 'snakeCase', `model_${currentFeature.$name}`)}";`);
    }
    imports.add(`import { ${casing_1.toCasing.pascalCase(currentFeature.$name)}Repository } from "../../domain/repositories/${(0, file_name_1.getFileName)(currentModule.$fileNameCasing ?? 'snakeCase', `${currentFeature.$name}_repository`)}";`);
    // Imports supplémentaires des usecases
    usecases.forEach(uc => {
        uc.$imports?.forEach(imp => {
            const resolved = (0, resolve_import_paths_1.resolveImportPath)(imp, currentModule, currentFeature, config, "repository");
            imports.add(`import { ${resolved.type} } from "${resolved.from}";`);
        });
    });
    return Array.from(imports);
}
