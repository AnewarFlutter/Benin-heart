// utils/functions/module/imports/parse_import_flags.ts

export type ImportFlagKey = "module" | "feature" | "kind" | "step";
export type ImportKind = "entity" | "model" | "custom" | "enum";

export interface ParsedImportFlags {
    module?: string;
    feature?: string;
    kind?: ImportKind;
    step?: "module" | "feature";
    [key: string]: string | undefined; // pour extensibilité future si besoin
}

/**
 * Parse une chaîne de flags SCAF de façon strictement typée.
 * Exemple :
 * "--module auth --feature user --kind entity"
 * → { module: "auth", feature: "user", kind: "entity" }
 */
export function parseImportFlags(from: string): ParsedImportFlags {
    const result: ParsedImportFlags = {};

    // Regex qui capture --key value (value peut contenir des espaces si entre quotes)
    const regex = /--(\w+)\s+((?:".*?"|'.*?'|[^\s"']+)(?:\s+(?!--)".*?"|'.*?'|[^\s"']+)*)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(from)) !== null) {
        const key = match[1] as ImportFlagKey;
        let value = match[2].trim();

        // Nettoyage des quotes si présentes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        // Assignation typée
        if (key === "module") result.module = value;
        else if (key === "feature") result.feature = value;
        else if (key === "kind") {
            if (value === "entity" || value === "model" || value === "custom" || value === "enum") {
                result.kind = value;
            }
        } else if (key === "step") {
            if (value === "module" || value === "feature") {
                result.step = value;
            }
        } else {
            // Pour les flags futurs (ex: --as, --from, etc.)
            result[key] = value;
        }
    }

    return result;
}