import fs from 'fs';
import path from 'path';

// Helper pour mettre la première lettre en majuscule
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Réutilisé depuis ton script existant
function removeFeatureBlock(content, feature) {
    const capFeature = capitalize(feature);
    const lines = content.split('\n');
    let startIndex = -1;
    let endIndex = -1;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`Dependency Injection (DI) setup for the ${capFeature} Feature`)) {
            startIndex = i - 1;
            if (startIndex < 0) startIndex = 0;
        }
        if (startIndex !== -1 && lines[i].includes(`${feature}Controller = new ${capFeature}Controller(`)) {
            endIndex = i;
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
    const capFeature = capitalize(feature);

    // 1️⃣ Supprimer TOUS les imports liés à cette feature
    const importRegex = new RegExp(
        `import\\s+\\{[^}]*\\}\\s+from\\s+["'].*${feature}.*["'];?\\n`,
        'g'
    );
    content = content.replace(importRegex, '');

    // 2️⃣ Supprimer le bloc DI (dataSource, repo, usecases, controller)
    content = removeFeatureBlock(content, feature);

    // 3️⃣ Supprimer toutes les instanciations de usecases liés à cette feature
    const usecaseRegex = new RegExp(
        `const\\s+\\w+UseCase\\s*=\\s*new\\s+\\w+UseCase\\([^)]*${feature}Repository[^)]*\\);?\\n`,
        'g'
    );
    content = content.replace(usecaseRegex, '');

    // 4️⃣ Supprimer toutes les références de usecases dans le controller
    const controllerVar = `${feature}Controller`;
    const controllerRegex = new RegExp(
        `const\\s+${controllerVar}\\s*=\\s*new\\s+${capFeature}Controller\\([\\s\\S]*?\\);`,
        'm'
    );
    content = content.replace(controllerRegex, '');

    // 5️⃣ Nettoyer l’export
    const exportRegex = /export\s+const\s+featuresDi\s*=\s*{([\s\S]*?)}/m;
    if (exportRegex.test(content)) {
        content = content.replace(exportRegex, (_, p1) => {
            let controllers = p1
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
            controllers = controllers.filter((c) => c !== `${feature}Controller`);
            return `export const featuresDi = {\n    ${controllers.join(',\n    ')}\n}`;
        });
    }

    fs.writeFileSync(diFilePath, content);
    console.log(`Removed ${feature} (all imports, usecases, and controller) from featuresDi.`);
}

function removeFolder(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.rmSync(folderPath, { recursive: true, force: true });
        console.log(`Deleted: ${folderPath}`);
    } else {
        console.log(`Folder does not exist: ${folderPath}`);
    }
}

function removeModule(module) {
    const modulePath = path.join(process.cwd(), 'src', 'modules', module);

    if (!fs.existsSync(modulePath)) {
        console.error(`Module "${module}" does not exist.`);
        return;
    }

    // Récupérer toutes les features du module
    const features = fs.readdirSync(modulePath).filter(f => 
        fs.statSync(path.join(modulePath, f)).isDirectory()
    );

    console.log(`Found features in module "${module}": ${features.join(', ')}`);

    // Supprimer chaque feature de features_di.ts
    features.forEach(feature => {
        removeFeatureFromFeaturesDi(feature);
    });

    // Supprimer les dossiers module
    removeFolder(modulePath); // src/modules/<module>
    removeFolder(path.join(process.cwd(), 'src', 'actions', module));
    removeFolder(path.join(process.cwd(), 'src', 'adapters', module));

    console.log(`Module "${module}" removed successfully.`);
}

// Récupère le module passé en argument
const [moduleName] = process.argv.slice(2);

if (!moduleName) {
    console.error('Usage: node module_remover_script.js <moduleName>');
    process.exit(1);
}

removeModule(moduleName);
