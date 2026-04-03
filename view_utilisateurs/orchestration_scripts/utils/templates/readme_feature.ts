import { toCasing } from "../casing";

export const ReadmeFeatureTemplate = (featureName: string) => `
# ${toCasing.pascalCase(featureName)} Feature
    
La feature **${toCasing.pascalCase(featureName)}** centralise toute la logique métier et technique liée aux ${featureName}(s) dans le projet.
Elle suit la **Clean Architecture** avec séparation claire entre **domaine** (métier) et **données** (implémentations techniques).

---

## 📌 Ce que cette feature permet

* ...
* ...

---

## 🏗️ Structure simplifiée

* **domain/** → Logique métier pure (entités, contrats, usecases, enums).
* **data/** → Implémentations concrètes (repositories, modèles, datasources).
* **${toCasing.pascalCase(featureName)}_README.md** → Documentation de la feature.

---

## 🧩 Composition : DataSource → Repository → UseCases → Controller

Pour utiliser les usecases dans l’application, il faut d’abord composer les différentes couches de la feature.

....

### ✅ Pourquoi cette composition est nécessaire ?

* **Découplage total** : Le ${toCasing.pascalCase(featureName)}\`Controller\` ne dépend pas directement d’une techno (ex: Supabase). Il utilise uniquement les **usecases** définis au niveau du domaine.
* **Flexibilité** : Tu peux changer la source de données (\`SupabaseUserDataSourceImpl\` → \`MongoDBUserDataSourceImpl\`) sans modifier la logique métier.
* **Testabilité** : Tu peux injecter un **fake repository ou datasource** lors des tests, sans toucher au code métier.
* **Lisibilité** : Chaque couche a une responsabilité claire :

    * **Datasource** = accès aux données brutes
    * **Repository** = transformation en entités métier
    * **UseCases** = logique métier réutilisable
    * **Controller** = interface prête à l’emploi pour l’UI ou l’API

---

# ⚙️ ${toCasing.pascalCase(featureName)} Use Cases

Les **use cases** définissent les actions métiers disponibles pour la gestion des ${featureName}(s).
Ils exposent une API claire et indépendante de l’implémentation technique (\`repository\`).

---

## 🚀 Bonnes pratiques

* Toujours injecter un **repository conforme à \`${toCasing.pascalCase(featureName)}Repository\`** dans le constructeur.
* Centraliser les appels métiers dans ces usecases pour éviter de coupler la logique métier aux composants UI ou aux services externes.
* Manipuler uniquement des **\`Entity${toCasing.pascalCase(featureName)}\`** (jamais de modèles \`data/models\`) dans le domaine.

---
    `;