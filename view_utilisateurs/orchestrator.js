import fs from "fs";
import yaml from "js-yaml";
import { execSync } from "child_process";

function runCommand(cmd) {
    console.log(`\n➡️ Running: ${cmd}`);
    try {
        execSync(cmd, { stdio: "inherit" });
    } catch (err) {
        console.error(`❌ Error while executing: ${cmd}`, err.message);
    }
}

function processConfig(configPath) {
    if (!fs.existsSync(configPath)) {
        console.error(`❌ Config file not found: ${configPath}`);
        process.exit(1);
    }

    const config = yaml.load(fs.readFileSync(configPath, "utf8"));

    config.modules.forEach((module) => {
        const moduleName = module.name;
        const featureNames = module.features.map((f) => f.name);

        // 1️⃣ Créer le module avec toutes ses features
        runCommand(
            `node feature_module_creator_script.js ${moduleName} ${featureNames.join(
                " "
            )}`
        );

        // 2️⃣ Pour chaque feature, ajouter les usecases
        module.features.forEach((feature) => {
            feature.usecases?.forEach((uc) => {
                let cmd = `node module_feature_usecase_creator_script.js ${moduleName} ${feature.name} ${uc.name}`;

                if (uc.params) cmd += ` "${uc.params}"`;
                else cmd += ` ""`;

                cmd += ` "${uc.returnType || "void"}"`;

                if (uc.async) cmd += ` async`;

                if (uc.related) cmd += ` --related ${uc.related}`;

                runCommand(cmd);
            });
        });
    });
}

// Exécution
const [configPath] = process.argv.slice(2);
if (!configPath) {
    console.error("Usage: node orchestrator.js <config.yml>");
    process.exit(1);
}

processConfig(configPath);
