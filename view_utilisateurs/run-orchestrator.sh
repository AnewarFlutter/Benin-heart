#!/bin/bash
set -e  # stop au premier échec

echo "🧹 Nettoyage du dossier dist..."
rm -rf orchestration_scripts/dist

echo "🏗️ Compilation TypeScript..."
npx tsc orchestration_scripts/*.ts \
  --outDir orchestration_scripts/dist \
  --target ES2021 \
  --module commonjs \
  --esModuleInterop true

echo "🚀 Lancement de l’orchestrateur..."
node orchestration_scripts/dist/orchestrator.js app_configs/app.yml

echo "✅ Orchestration terminee"