"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFeatureEnums = generateFeatureEnums;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ts_morph_1 = require("ts-morph");
const templates_base_1 = require("../../utils/templates/templates_base");
const file_name_1 = require("../../utils/functions/commons/file_name");
/**
 * Génère les enums de la feature, en gérant les modes split et merged via ts-morph.
 * @param module Le schéma du module.
 * @param f Le schéma de la feature.
 * - Enums en `splitPerFile: true` → fichiers individuels (toujours écrasés).
 * - Enums mergés → un seul fichier `*_enums.ts` :
 *   - **Header unique** : on le garde ou on l'ajoute **une seule fois**.
 *   - **Pas de duplication** : on ne touche jamais au header existant.
 *   - **Pas d'espaces supplémentaires** : on remplace **exactement** le body.
 *   - **Tri alphabétique** conservé.
 *   - **Formatage propre** avec `formatText`.
 */
function generateFeatureEnums(module, f, project) {
    console.log("🎨 [Enums-Feature] Génération des enums au niveau feeature...");
    const casing = module.$fileNameCasing ?? "snakeCase";
    const featureFile = (0, file_name_1.getFileName)(casing, f.$name);
    const root = path_1.default.join(process.cwd(), "src");
    const featurePath = path_1.default.join(root, "modules", module.$name, featureFile);
    const enums = f.$enums ?? [];
    const enumsDir = path_1.default.join(featurePath, "domain", "enums");
    fs_1.default.mkdirSync(enumsDir, { recursive: true });
    // Création des enums dans des fichiers séparés
    enums
        .filter((e) => e.$splitPerFile === true)
        .forEach((e) => {
        const file = `${(0, file_name_1.getFileName)(casing, e.$name)}.ts`;
        fs_1.default.writeFileSync(path_1.default.join(enumsDir, file), templates_base_1.T.enumBlock(f.$name, e) + "\n");
        console.log("🧾 Enum créé: " + file);
    });
    const tsProject = project ?? new ts_morph_1.Project({ tsConfigFilePath: "tsconfig.json" });
    // ── 1. Enums en fichiers séparés (splitPerFile: true) ──
    enums
        .filter((e) => e.$splitPerFile === true)
        .forEach((e) => {
        const fileName = `${(0, file_name_1.getFileName)(casing, e.$name)}.ts`;
        const filePath = path_1.default.join(enumsDir, fileName);
        const content = templates_base_1.T.enumBlock(f.$name, e) + "\n";
        fs_1.default.writeFileSync(filePath, content);
        console.log("Enum créé (split): " + fileName);
    });
    // ── 2. Enums mergés dans un seul fichier ──
    const merged = enums.filter((e) => e.$splitPerFile !== true);
    if (merged.length === 0) {
        console.log("Enums Aucun enum à merger.");
        return;
    }
    const mergedFileName = `${(0, file_name_1.getFileName)(casing, `${featureFile}_enums`)}.ts`;
    const mergedFilePath = path_1.default.join(enumsDir, mergedFileName);
    const sourceFile = fs_1.default.existsSync(mergedFilePath)
        ? tsProject.addSourceFileAtPath(mergedFilePath)
        : tsProject.createSourceFile(mergedFilePath, "", { overwrite: true });
    let changed = false;
    // Générer les nouveaux blocs d'enum (texte brut pour comparaison)
    const newEnumBlocks = new Map();
    merged.forEach((e) => {
        newEnumBlocks.set(e.$name, templates_base_1.T.enumBlock(f.$name, e));
    });
    // Parcourir les enums existants dans le fichier
    const existingEnums = sourceFile.getEnums();
    // Supprimer les enums qui n'existent plus dans la config
    existingEnums.forEach((enumNode) => {
        const name = enumNode.getName();
        if (!newEnumBlocks.has(name)) {
            enumNode.remove();
            changed = true;
            console.log("Enum supprimé: " + name);
        }
    });
    // Ajouter ou mettre à jour les enums
    newEnumBlocks.forEach((newBlock, name) => {
        const existingEnum = sourceFile.getEnum(name);
        const existingText = existingEnum?.getFullText().trim();
        if (!existingEnum) {
            // Ajouter un nouvel enum
            const endPos = sourceFile.getEnd();
            sourceFile.insertText(endPos, (endPos > 0 ? "\n\n" : "") + newBlock);
            changed = true;
            console.log("Enum ajouté: " + name);
        }
        else if (existingText !== newBlock.trim()) {
            // Mettre à jour uniquement si le contenu a changé
            existingEnum.replaceWithText(newBlock);
            changed = true;
            console.log("Enum mis à jour: " + name);
        }
        // Sinon : inchangé → rien à faire
    });
    // Trier les enums alphabétiquement
    const sortedEnums = sourceFile.getEnums().sort((a, b) => a.getName().localeCompare(b.getName()));
    if (sortedEnums.length > 0) {
        const header = "// This file is auto-generated and merged by SCAF\n\n";
        const body = sortedEnums.map(e => e.getFullText().trim()).join("\n\n");
        const fullContent = header + body + "\n";
        // Supprimer tout header précédent dans le texte actuel
        let currentText = sourceFile.getFullText().trimStart();
        currentText = currentText.replace(/^\/\/ This file is auto-generated and merged by SCAF\s*\n*/i, "").trimStart();
        // ⚠️ Comparaison uniquement du corps sans header
        if (currentText.trim() !== body.trim()) {
            // Écriture directe et propre du contenu complet
            fs_1.default.writeFileSync(mergedFilePath, fullContent, "utf8");
            tsProject.addSourceFileAtPath(mergedFilePath);
            changed = true;
            console.log("🧩 Enums fusionnés et header replacé proprement");
        }
    }
    // Sauvegarder si modifié
    if (changed) {
        sourceFile.formatText({ indentSize: 4, convertTabsToSpaces: true });
        sourceFile.saveSync();
        console.log("✅ Enums fusionnés & formatés: " + mergedFileName);
    }
    else {
        console.log("✅ Enums inchangés: " + mergedFileName);
    }
    console.log("🏁 [Enums-Feature] Étape terminée.");
}
