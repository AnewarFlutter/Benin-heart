import { EnumSchema } from "../../config_validator";
import { toCasing } from "../casing";

export const EnumBlockTemplate = (scopeName: string, e: EnumSchema) => {
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
* **Énumération** de la scopeName **${toCasing.pascalCase(scopeName)}**
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
}