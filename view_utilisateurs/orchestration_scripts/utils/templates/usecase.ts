import { UsecaseSchema, FeatureSchema, ModuleSchema, ModulesConfigSchema } from "../../config_validator";
import { generateExecuteBody } from "../../tasks/modules/generate_execute_body";
import { generateExecuteSignature } from "../../tasks/modules/generate_signatures";
import { toCasing } from "../casing";
import { collectUsecaseImports } from "../functions/module/imports/collect_usecase_imports";

export const UsecaseTemplate = (uc: UsecaseSchema, feature: FeatureSchema, module: ModuleSchema, config: ModulesConfigSchema) => {
    const imports = collectUsecaseImports(uc, module, feature, config).join('\n');
    const className = `${toCasing.pascalCase(uc.$name)}UseCase`;
    const executeSig = generateExecuteSignature(uc);
    const executeBody = generateExecuteBody(uc);

    return `\
${imports}

/**
 * ${uc.$description || `${uc.$name} use case for ${feature.$name} feature.`}
 */
export class ${className} {
    constructor(private readonly repository: ${toCasing.pascalCase(feature.$name)}Repository) {}

    /**
     * Executes the use case.
     */
    ${executeSig} {
        ${executeBody}
    }
}
`;
}