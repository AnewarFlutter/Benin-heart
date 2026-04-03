import { ModulesConfigSchema, ModuleSchema, CustomTypeSchema, FeatureSchema } from "../../config_validator";
import { generateImportsFromTypeAttributes } from "../../tasks/modules/generate_imports_from_type_attributes";

export const CustomTypeTemplate = (config: ModulesConfigSchema, module: ModuleSchema, type: CustomTypeSchema, feature?: FeatureSchema) => {
    const relatedImports = generateImportsFromTypeAttributes(type.$attributes, config, module, feature);

            return `\
${relatedImports ? relatedImports + "\n\n" : ""}/**

/**
 * ${type.$name}
 * 
 * ${type.$description ?? "Type personnalisé"}
 */
export type ${type.$name} = {
${type.$attributes
                    .map(a => {
                        const optional = a.$optional ? "?" : "";
                        //const defaultVal = a.default !== undefined ? ` = ${JSON.stringify(a.default)}` : "";
                        const comment = a.$description ? `  /** ${a.$description} */\n` : "";
                        return `${comment}\n${a.$name}${optional}: ${a.$type}${a.$list ? "[]" : ""}${a.$nullable ? " | null" : ""};`; // ${defaultVal};
                    })
                    .join("\n")}
};
`
        }