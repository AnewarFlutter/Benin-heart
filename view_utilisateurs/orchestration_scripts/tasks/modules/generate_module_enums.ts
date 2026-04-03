import fs from "fs";
import path from "path";
import { Project } from "ts-morph";
import { ModuleSchema } from "../../config_validator";
import { T } from "../../utils/templates/templates_base";
import { getFileName } from "../../utils/functions/commons/file_name";

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
export function generateModuleEnums(
    module: ModuleSchema,
    project?: Project
) {
    console.log("🎨 [Enums-Module] Génération des enums au niveau module...");

    const casing = module.$fileNameCasing ?? "snakeCase";
    const root = path.join(process.cwd(), "src");
    const enumsDir = path.join(root, "modules", module.$name, "enums");
    const enums = module.$enums ?? [];

    fs.mkdirSync(enumsDir, { recursive: true });

    // Création des enums dans des fichiers séparés
    enums
        .filter((e) => e.$splitPerFile === true)
        .forEach((e) => {
            const file = `${getFileName(casing, e.$name)}.ts`;
            fs.writeFileSync(
                path.join(enumsDir, file),
                T.enumBlock(module.$name, e) + "\n"
            );
            console.log("🧾 Enum créé: " + file);
        });

    const tsProject =
        project ?? new Project({ tsConfigFilePath: "tsconfig.json" });

    // ── 1. Enums en fichiers séparés (splitPerFile: true) ──
    enums
        .filter((e) => e.$splitPerFile === true)
        .forEach((e) => {
            const fileName = `${getFileName(casing, e.$name)}.ts`;
            const filePath = path.join(enumsDir, fileName);
            const content = T.enumBlock(module.$name, e) + "\n";
            fs.writeFileSync(filePath, content);
            console.log("Enum créé (split): " + fileName);
        });

    // ── 2. Enums mergés dans un seul fichier ──
    const merged = enums.filter((e) => e.$splitPerFile !== true);
    if (merged.length === 0) {
        console.log("Enums Aucun enum à merger.");
        return;
    }

    const mergedFileName = `${getFileName(casing, `${module.$name}_enums`)}.ts`;
    const mergedFilePath = path.join(enumsDir, mergedFileName);

    const sourceFile = fs.existsSync(mergedFilePath)
        ? tsProject.addSourceFileAtPath(mergedFilePath)
        : tsProject.createSourceFile(mergedFilePath, "", { overwrite: true });

    let changed = false;

    // Générer les nouveaux blocs d'enum (texte brut pour comparaison)
    const newEnumBlocks = new Map<string, string>();
    merged.forEach((e) => {
        newEnumBlocks.set(e.$name, T.enumBlock(module.$name, e));
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
        } else if (existingText !== newBlock.trim()) {
            // Mettre à jour uniquement si le contenu a changé
            existingEnum.replaceWithText(newBlock);
            changed = true;
            console.log("Enum mis à jour: " + name);
        }
        // Sinon : inchangé → rien à faire
    });

    // Trier les enums alphabétiquement
    const sortedEnums = sourceFile.getEnums().sort((a, b) =>
        a.getName().localeCompare(b.getName())
    );

    if (sortedEnums.length > 0) {
        const header = "// This file is auto-generated and merged by SCAF\n\n";
        const body = sortedEnums.map(e => e.getFullText().trim()).join("\n\n");
        const fullContent = header + body + "\n";

        // Supprimer tout header précédent dans le texte actuel
        let currentText = sourceFile.getFullText().trimStart();
        currentText = currentText.replace(
            /^\/\/ This file is auto-generated and merged by SCAF\s*\n*/i,
            ""
        ).trimStart();

        // ⚠️ Comparaison uniquement du corps sans header
        if (currentText.trim() !== body.trim()) {
            // Écriture directe et propre du contenu complet
            fs.writeFileSync(mergedFilePath, fullContent, "utf8");
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
    } else {
        console.log("✅ Enums inchangés: " + mergedFileName);
    }

    console.log("🏁 [Enums-Module] Étape terminée.");
}