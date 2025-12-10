import fs from 'fs';
import path from 'path';

// Helper pour mettre la première lettre en majuscule
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Supprime le bloc DI complet d'une feature dans features_di.ts
 */
function removeFeatureBlock(content, feature) {
    const capFeature = capitalize(feature);
    const lines = content.split('\n');
    let startIndex = -1;
    let endIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        // Début du bloc : inclut la ligne /** Dependency Injection…
        if (lines[i].includes(`Dependency Injection (DI) setup for the ${capFeature} Feature`)) {
            startIndex = i - 1; // <-- inclure la ligne /** en amont
            if (startIndex < 0) startIndex = 0;
        }
        // Fin du bloc : ligne du controller
        if (startIndex !== -1 && lines[i].includes(`${feature}Controller = new ${capFeature}Controller(`)) {
            endIndex = i;
            // On continue jusqu'à la ligne qui se termine par ');'
            while (endIndex < lines.length && !lines[endIndex].trim().endsWith(');')) {
                endIndex++;
            }
            break;
        }
    }

    if (startIndex !== -1 && endIndex !== -1) {
        lines.splice(startIndex, endIndex - startIndex + 1);
    }

    return lines.join('\n');
}

function removeFeatureFromFeaturesDi(feature) {
    const diFilePath = path.join(process.cwd(), 'src', 'di', 'features_di.ts');

    if (!fs.existsSync(diFilePath)) {
        console.log("features_di.ts does not exist. Nothing to remove.");
        return;
    }

    let content = fs.readFileSync(diFilePath, 'utf8');

    // 1️⃣ Supprimer les imports liés à la feature
    const importRegex = new RegExp(`import\\s+\\{\\s*${capitalize(feature)}Controller\\s*\\}.*\\n`, 'g');
    const dataSourceRegex = new RegExp(`import\\s+\\{\\s*RestApi${capitalize(feature)}DataSourceImpl\\s*\\}.*\\n`, 'g');
    const repoRegex = new RegExp(`import\\s+\\{\\s*${capitalize(feature)}RepositoryImpl\\s*\\}.*\\n`, 'g');
    const useCaseRegex = new RegExp(`import\\s+\\{\\s*Get${capitalize(feature)}ByIdUseCase\\s*\\}.*\\n`, 'g');

    content = content.replace(importRegex, '')
        .replace(dataSourceRegex, '')
        .replace(repoRegex, '')
        .replace(useCaseRegex, '');

    // 2️⃣ Supprimer la configuration DI liée à la feature (robuste)
    content = removeFeatureBlock(content, feature);

    // 3️⃣ Supprimer le controller de l'export
    const exportRegex = /export\s+const\s+featuresDi\s*=\s*{([\s\S]*?)}/m;
    if (exportRegex.test(content)) {
        content = content.replace(exportRegex, (_, p1) => {
            let controllers = p1.split(',').map(s => s.trim()).filter(Boolean);
            controllers = controllers.filter(c => c !== `${feature}Controller`);
            return `export const featuresDi = {\n    ${controllers.join(',\n    ')}\n}`;
        });
    }

    fs.writeFileSync(diFilePath, content);
    console.log(`Removed ${feature} from featuresDi.`);
}

function removeFolder(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log(`Deleted: ${folderPath}`);
    } else {
        console.log(`Folder does not exist: ${folderPath}`);
    }
}

function removeFeature(feature) {
    const pathsToRemove = [
        path.join(process.cwd(), 'src', 'features', feature),
        path.join(process.cwd(), 'src', 'actions', feature),
        path.join(process.cwd(), 'src', 'adapters', feature),
    ];

    pathsToRemove.forEach(removeFolder);
}

// Récupérer les features passées en arguments
const features = process.argv.slice(2);

if (features.length === 0) {
    console.error('Usage: node feature_module_remover_script.js <featureName1> <featureName2> ...');
    process.exit(1);
}

// Supprimer chaque feature passée
features.forEach(feature => {
    removeFeature(feature);
    removeFeatureFromFeaturesDi(feature);
});

console.log('Features removed successfully.');
