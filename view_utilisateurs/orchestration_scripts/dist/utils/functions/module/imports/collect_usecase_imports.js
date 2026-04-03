"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectUsecaseImports = collectUsecaseImports;
const casing_1 = require("../../../casing");
const file_name_1 = require("../../commons/file_name");
const resolve_import_paths_1 = require("./resolve_import_paths");
// ────── Nouvelle fonction : collectUsecaseImports ──────
function collectUsecaseImports(uc, currentModule, currentFeature, config) {
    const imports = new Set();
    // 1. Import obligatoire : Repository local
    const repoName = `${casing_1.toCasing.pascalCase(currentFeature.$name)}Repository`;
    const repoFile = (0, file_name_1.getFileName)(currentModule.$fileNameCasing ?? "snakeCase", `${currentFeature.$name}_repository`);
    imports.add(`import { ${repoName} } from "../repositories/${repoFile}";`);
    // 2. Imports des types dans params / return (via config.imports)
    uc.$imports?.forEach(imp => {
        const resolved = (0, resolve_import_paths_1.resolveImportPath)(imp, currentModule, currentFeature, config, "repository");
        imports.add(`import { ${resolved.type} } from "${resolved.from}";`);
    });
    // 3. Si returnType ou params utilisent Entity local → pas d'import supplémentaire (déjà dans repo)
    //    Si autre Model/Entity → déjà géré via imports[]
    return Array.from(imports);
}
