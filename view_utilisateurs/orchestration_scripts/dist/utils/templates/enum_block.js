"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumBlockTemplate = void 0;
const casing_1 = require("../casing");
const EnumBlockTemplate = (scopeName, e) => {
    const values = e.$values
        .map((v) => {
        const valueName = typeof v === "string" ? v : `VALUE_${v}`;
        const valueDesc = e.$descriptions?.[valueName] ?? "";
        const comment = valueDesc ? ` /** ${valueDesc} */\n` : "";
        return `${comment}    ${valueName} = ${typeof v === "string" ? `"${v}"` : v}`;
    })
        .join(",\n");
    const desc = e.$description ?? "Valeurs possibles pour cette énumération";
    return `/**
* ${e.$name}
*
* **Énumération** de la scopeName **${casing_1.toCasing.pascalCase(scopeName)}**
*
* ${desc}
*
* @example
* Usage dans une entité
* const status: ${e.$name} = ${e.$name}.M;
*
* @example
* Vérification
* if (status === ${e.$name}.${e.$values[0]}) { ... }
*/
export enum ${e.$name} {
${values}
}`.trim();
};
exports.EnumBlockTemplate = EnumBlockTemplate;
