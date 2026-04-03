"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectDsImplImports = collectDsImplImports;
const casing_1 = require("../../../casing");
const file_name_1 = require("../../commons/file_name");
const resolve_import_path_for_custom_type_1 = require("./resolve_import_path_for_custom_type");
const resolve_import_paths_1 = require("./resolve_import_paths");
// Collecter tous les imports uniques pour dsImpl
function collectDsImplImports(usecases, currentModule, currentFeature, config) {
    const imports = new Set();
    // Import de base : datasource interface
    imports.add(`import { ${casing_1.toCasing.pascalCase(currentFeature.$name)}DataSource } from "./${(0, file_name_1.getFileName)(currentModule.$fileNameCasing ?? 'snakeCase', `${currentFeature.$name}_data_source`)}";`);
    // Imports des modèles/types utilisés dans les params/retour
    usecases.forEach(uc => {
        uc.$params?.forEach(p => {
            if (p.$type.includes(`Model${casing_1.toCasing.pascalCase(currentFeature.$name)}`)) {
                imports.add(`import { Model${casing_1.toCasing.pascalCase(currentFeature.$name)} } from "../models/${(0, file_name_1.getFileName)(currentModule.$fileNameCasing ?? 'snakeCase', `model_${currentFeature.$name}`)}";`);
            }
        });
        if (uc.$returnType?.$type.includes(`Model${casing_1.toCasing.pascalCase(currentFeature.$name)}`)) {
            imports.add(`import { Model${casing_1.toCasing.pascalCase(currentFeature.$name)} } from "../models/${(0, file_name_1.getFileName)(currentModule.$fileNameCasing ?? 'snakeCase', `model_${currentFeature.$name}`)}";`);
        }
        uc.$imports?.forEach(imp => {
            const resolved = (imp.$kind === "custom" && imp.$step === "module") ?
                (0, resolve_import_path_for_custom_type_1.resolveImportPathForCustomType)(imp, currentModule, config) :
                (0, resolve_import_paths_1.resolveImportPath)(imp, currentModule, currentFeature, config, "datasource");
            imports.add(`import { ${resolved.type} } from "${resolved.from}";`);
        });
    });
    return Array.from(imports);
}
