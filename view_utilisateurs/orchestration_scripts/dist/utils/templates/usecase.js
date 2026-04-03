"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsecaseTemplate = void 0;
const generate_execute_body_1 = require("../../tasks/modules/generate_execute_body");
const generate_signatures_1 = require("../../tasks/modules/generate_signatures");
const casing_1 = require("../casing");
const collect_usecase_imports_1 = require("../functions/module/imports/collect_usecase_imports");
const UsecaseTemplate = (uc, feature, module, config) => {
    const imports = (0, collect_usecase_imports_1.collectUsecaseImports)(uc, module, feature, config).join('\n');
    const className = `${casing_1.toCasing.pascalCase(uc.$name)}UseCase`;
    const executeSig = (0, generate_signatures_1.generateExecuteSignature)(uc);
    const executeBody = (0, generate_execute_body_1.generateExecuteBody)(uc);
    return `\
${imports}

/**
 * ${uc.$description || `${uc.$name} use case for ${feature.$name} feature.`}
 */
export class ${className} {
    constructor(private readonly repository: ${casing_1.toCasing.pascalCase(feature.$name)}Repository) {}

    /**
     * Executes the use case.
     */
    ${executeSig} {
        ${executeBody}
    }
}
`;
};
exports.UsecaseTemplate = UsecaseTemplate;
