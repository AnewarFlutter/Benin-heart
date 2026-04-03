"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepositoryMethodTemplate = void 0;
const casing_1 = require("../casing");
const RepositoryMethodTemplate = (uc, feature) => {
    const methodName = uc.$name;
    const params = uc.$params ?? [];
    const returnType = uc.$returnType;
    const isAsync = uc.$async ?? true;
    const paramStr = params
        .map(p => `${p.$name}${p.$optional ? "?" : ""}: ${p.$type}`)
        .join(", ");
    let returnStr = "void";
    if (returnType) {
        let type = returnType.$type;
        // Si c'est l'entité de la feature → forcer Entity
        if (type === `Entity${casing_1.toCasing.pascalCase(feature.$name)}`)
            type = `Entity${casing_1.toCasing.pascalCase(feature.$name)}`;
        if (type === `Model${casing_1.toCasing.pascalCase(feature.$name)}`)
            type = `Entity${casing_1.toCasing.pascalCase(feature.$name)}`;
        returnStr = type;
        if (returnType.$list)
            returnStr += "[]";
        if (returnType.$nullable)
            returnStr += " | null";
    }
    const promise = isAsync ? `Promise<${returnStr}>` : returnStr;
    const paramDocs = params.map(p => `   * @param ${p.$name} ${p.$description ?? ""}`).join("\n");
    const returnDoc = returnType ? `   * @returns ${uc.$returnDescription ?? returnStr}` : "";
    return `  /**
    * ${uc.$description ?? methodName}
    *${paramDocs ? "\n" + paramDocs : ""}${returnDoc ? "\n" + returnDoc : ""}
    */
    ${methodName}(${paramStr}): ${promise};`;
};
exports.RepositoryMethodTemplate = RepositoryMethodTemplate;
