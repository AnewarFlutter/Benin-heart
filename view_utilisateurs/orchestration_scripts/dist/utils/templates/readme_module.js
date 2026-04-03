"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadmeModuleTemplate = void 0;
const casing_1 = require("../casing");
const ReadmeModuleTemplate = (moduleName) => `# ${casing_1.toCasing.pascalCase(moduleName)} Module

# Description et autres informations du module ici....
`;
exports.ReadmeModuleTemplate = ReadmeModuleTemplate;
