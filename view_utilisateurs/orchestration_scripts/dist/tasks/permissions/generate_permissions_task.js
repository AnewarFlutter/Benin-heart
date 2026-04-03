"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePermissionsTask = generatePermissionsTask;
// src/tasks/generate_permissions_task.ts
const ts_morph_1 = require("ts-morph");
const path_1 = __importDefault(require("path"));
const ENUM_PATH = path_1.default.join(process.cwd(), "src", "shared", "enums", "auth.ts");
const CONST_PATH = path_1.default.join(process.cwd(), "src", "shared", "constants", "values", "app_module_availability.ts");
function generatePermissionsTask(config, project) {
    const perms = config.$permissions;
    if (!perms?.$items?.length) {
        console.log("Aucune permission définie → rien à faire.");
        return;
    }
    if (perms.$skip) {
        console.log("Permissions skipped → Skipped.");
        return;
    }
    const tsProject = project ?? new ts_morph_1.Project({ tsConfigFilePath: "tsconfig.json" });
    const enumName = perms.$enumName ?? "UserPermission";
    const constName = perms.$constantName ?? "APP_MODULES_STATES";
    const overwrite = perms.$overwrite ?? true;
    console.log(`Génération permissions → ${perms.$items.length} items | overwrite: ${overwrite}`);
    const sorted = [...perms.$items].sort((a, b) => a.$key.localeCompare(b.$key));
    const groupDesc = new Map(perms.$groups?.map(g => [g.$name, g.$description ?? ""]));
    // ── 1. Enum – deux stratégies selon overwrite ──
    if (overwrite) {
        // Stratégie brute → évite TOUS les bugs d'insertion ts-morph
        const enumContent = `/**
 * ${enumName}
 * Liste exhaustive des permissions utilisateur.
 * Généré automatiquement via config.yml → permissions
 */
export enum ${enumName} {
${sorted
            .map(item => {
            const lines = [];
            if (item.$group && item.$group !== (sorted[sorted.indexOf(item) - 1]?.$group ?? "")) {
                const desc = groupDesc.get(item.$group) ?? "";
                lines.push(`  
                               // ------------------------------------------------------------------
                               // ${item.$group}
                               // ${desc}
                               // ------------------------------------------------------------------`);
            }
            const doc = item.$description ? `  /** ${item.$description} */\n` : "";
            lines.push(`${doc}  ${item.$key} = "${item.$value}",`);
            return lines.join("\n");
        })
            .join("\n")}
}
`.trim();
        tsProject.createSourceFile(ENUM_PATH, enumContent + "\n", { overwrite: true });
    }
    else {
        // Mode merge incrémental (sécurisé car on ne touche pas à addEnum)
        const enumFile = tsProject.getSourceFile(ENUM_PATH) ?? tsProject.createSourceFile(ENUM_PATH);
        const enumDecl = enumFile.getEnum(enumName) ?? enumFile.addEnum({ name: enumName, isExported: true });
        const currentKeys = new Set(sorted.map(i => i.$key));
        let lastGroup = "";
        for (const item of sorted) {
            if (item.$group && item.$group !== lastGroup) {
                lastGroup = item.$group;
                const desc = groupDesc.get(item.$group) ?? "";
                enumDecl.addMember({ name: `// ── ${item.$group} ── ${desc}` });
            }
            const existing = enumDecl.getMember(item.$key);
            const doc = item.$description ? `/** ${item.$description} */` : "";
            if (existing) {
                existing.set({
                    initializer: `"${item.$value}"`,
                    docs: doc ? [{ description: doc }] : undefined,
                });
            }
            else {
                enumDecl.addMember({
                    name: item.$key,
                    initializer: `"${item.$value}"`,
                    docs: doc ? [{ description: doc }] : undefined,
                });
            }
        }
        // Nettoyage des clés supprimées
        enumDecl.getMembers().forEach(m => {
            if (ts_morph_1.Node.isEnumMember(m) && !currentKeys.has(m.getName()))
                m.remove();
        });
    }
    // ── 2. Constante APP_MODULES_STATES – toujours replaceWithText (fichier dédié) ──
    const constFile = tsProject.createSourceFile(CONST_PATH, "", { overwrite: true });
    const activeItems = sorted.filter(i => i.$available !== false);
    constFile.replaceWithText(`
import { ${enumName} } from "@/shared/enums/auth";
import { AppModulesState } from "@/shared/types/app_module";

/**
 * Disponibilité des modules selon les permissions utilisateur
 * Généré automatiquement via config.yml → permissions
 */
export const ${constName}: AppModulesState = {
${activeItems.length
        ? activeItems
            .map(i => `  [${enumName}.${i.$key}]: { available: true },`)
            .join("\n")
        : "  // Aucune permission active"}
} as const;
`.trim() + "\n");
    // ── Formatage & sauvegarde ──
    tsProject.getSourceFiles([ENUM_PATH, CONST_PATH]).forEach(f => {
        f.organizeImports();
        f.formatText({ indentSize: 4, convertTabsToSpaces: true });
        f.saveSync();
    });
    console.log(`🏗️ Permissions générées :
  → ${ENUM_PATH}
  → ${CONST_PATH}
  → ${sorted.length} items | overwrite: ${overwrite}`);
}
