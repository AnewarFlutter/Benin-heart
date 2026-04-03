import { ModuleSchema, FeatureSchema, ModulesConfigSchema } from "../../config_validator";
import { getUsecaseImportPathForController } from "../../tasks/modules/get_usecase_import_path_for_controller";
import { toCasing } from "../casing";
import { collectExternalTypeImports } from "../functions/module/imports/collect_external_type_imports";

export const ControllerTemplate = (module: ModuleSchema, f: FeatureSchema, config: ModulesConfigSchema) => {
    const controllerName = `${toCasing.pascalCase(f.$name)}Controller`;

    const finalUsecases = f.$usecases?.filter(uc => !uc.$delete) ?? [];

// 1. Imports usecases (locaux)
const usecaseImports = finalUsecases.map(uc => {
    const className = `${toCasing.pascalCase(uc.$name)}UseCase`;
    const importPath = getUsecaseImportPathForController(uc.$name, module, f);
    return `import { ${className} } from "${importPath}";`;
}).join('\n');

// 2. Imports externes : UNIQUEMENT depuis usecase.imports[]
const externalImports = collectExternalTypeImports(finalUsecases, module, f, config).join('\n');

// 3. Constructor
const constructorParams = finalUsecases.map(uc =>
    `    private readonly ${toCasing.camelCase(uc.$name)}UseCase: ${toCasing.pascalCase(uc.$name)}UseCase`
).join(',\n');

// 4. Méthodes
const methods = finalUsecases.map(uc => {
    const methodName = toCasing.camelCase(uc.$name);
    const params = uc.$params?.map(p => `${p.$name}${p.$optional ? '?' : ''}: ${p.$type}`).join(', ') || '';
    const returnType = uc.$returnType
        ? `${uc.$returnType.$type}${uc.$returnType.$list ? '[]' : ''}${uc.$returnType.$nullable ? ' | null' : ''}`
        : 'void';
    const args = uc.$params?.map(p => p.$name).join(', ') || '';
    const defaultReturn = returnType.includes(' | null') || returnType.includes('null') ? 'null' :
        returnType.includes('[]') ? '[]' :
            returnType.includes('boolean') ? 'false' :
                returnType.includes('{') ? '{ status: "error" }' : 'null';

    return `
    /**
     * ${uc.$description || uc.$name}.
     */
    ${methodName} = async (${params}): Promise<${returnType}> => {
        try {
            const res = await this.${toCasing.camelCase(uc.$name)}UseCase.execute(${args});
            return res;
        } catch (e) {
            console.log(\`Error while executing ${uc.$name}: \${e}\`);
            // TODO : Gérer vos erreurs ici et retournez ce qu'il faut dans ce/ces cas
            return ${defaultReturn};
        }
    }`;
}).join('\n');

return `\
// Controller pour la feature ${f.$name}

${usecaseImports}
${externalImports}

/**
 * This class is an adapter for the ${f.$name} feature.
 * It acts as an interface between the application and the ${f.$name} feature.
 */
export class ${controllerName} {
    constructor(
        ${constructorParams}
    ) { }

${methods}
}
`;
    }