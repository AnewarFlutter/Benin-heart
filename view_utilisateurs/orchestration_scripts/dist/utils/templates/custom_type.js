"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomTypeTemplate = void 0;
const generate_imports_from_type_attributes_1 = require("../../tasks/modules/generate_imports_from_type_attributes");
const CustomTypeTemplate = (config, module, type, feature) => {
    const relatedImports = (0, generate_imports_from_type_attributes_1.generateImportsFromTypeAttributes)(type.$attributes, config, module, feature);
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
`;
};
exports.CustomTypeTemplate = CustomTypeTemplate;
