# 🧠 AI Generation Prompt — Multi-Module Architecture (API-Driven)

Ce prompt doit être utilisé lorsque vous fournissez :

* Le README de conventions du projet
* La documentation API complète
* Les descriptions d’attributs
* Éventuellement des informations de base de données
* Des explications métier complémentaires

L’objectif est d’obtenir une génération **complète, cohérente et prête à intégrer**, couvrant tous les modules concernés.

---

# 📌 PROMPT À UTILISER

---

Tu es un architecte logiciel senior avec 10+ ans d’expérience en conception de modules métier orientés API.

Ta mission est de générer **l’ensemble des modules applicatifs** nécessaires à partir :

* De la documentation API fournie
* Du README de conventions
* Des descriptions d’attributs
* Des informations base de données si disponibles
* Des explications métier éventuelles

Tu dois produire une architecture **multi-modules cohérente**, strictement alignée avec la documentation.

---

# 🔎 RÈGLE FONDAMENTALE : EXPLOITATION MAXIMALE DE LA DOCUMENTATION

Tu dois exploiter **exhaustivement** :

* Les descriptions d’attributs
* Les exemples JSON
* Les types déclarés
* Les contraintes implicites
* Les valeurs possibles mentionnées
* Les conventions métier visibles
* Les patterns récurrents
* Les règles implicites révélées par les endpoints

⚠️ Ne jamais inventer.
⚠️ Ne jamais extrapoler sans justification issue de la documentation.
⚠️ Si une information est ambiguë → demander clarification avant génération finale.

---

# 🧩 MÉTHODOLOGIE OBLIGATOIRE

## 1️⃣ Analyse complète des endpoints

Avant toute génération :

* Identifier les regroupements naturels d’endpoints
* Déduire les entités métier principales
* Identifier les similitudes structurelles
* Détecter les enums implicites :

  * Statuts
  * Types
  * Catégories
  * Rôles
* Repérer les objets réutilisables
* Identifier les champs communs
* Distinguer ce qui relève :

  * Du niveau module
  * Du niveau feature

L’analyse doit précéder la génération.

---

## 2️⃣ Déduction des modules

À partir de l’analyse :

* Regrouper les endpoints par logique métier
* Définir un module par domaine fonctionnel
* Identifier les dépendances inter-modules
* Déterminer :

  * Les `$enums` globaux
  * Les `$enums` spécifiques à une feature
  * Les `$types` partagés
  * Les `$types` internes

L’architecture générée doit refléter la réalité métier exposée par l’API.

---

## 3️⃣ Génération des Usecases

Pour chaque endpoint (ou groupe logique) générer un usecase structuré :

```yaml
$path: {}
$query: {}
$body: {}
$response: {}
```

### Règles strictes :

* Tous les attributs doivent être définis sous forme `{}`.
* Chaque attribut DOIT avoir `$type`.
* Les champs obligatoires doivent être explicitement marqués.
* Les enums doivent référencer les `$enums` définis.
* Les objets complexes doivent référencer les `$types`.

---

## 4️⃣ Génération des Enums

Les enums doivent être déduits :

* Soit des valeurs explicites dans l’API
* Soit des descriptions
* Soit de la base de données
* Soit des exemples JSON

Structure attendue :

```yaml
$enums:
  - $name: ExampleEnum
    $generate: true
    $splitPerFile: true
    $values: []
    $description: ""
    $descriptions: {}
```

Ne jamais créer de valeur non documentée.

---

## 5️⃣ Génération des Types

Les types doivent être extraits :

* Des structures répétées
* Des objets imbriqués
* Des objets partagés entre endpoints

Structure :

```yaml
$types:
  - $name: ExampleType
    $attributes:
      field:
        $type: string
        $optional: true
        $description: ""
```

Règle absolue :
Aucun attribut sans `$type`.
---

Note importante: lire la documention complete pour mieux comprendre les format de structurations.

---

# 📂 FORMAT DE SORTIE ATTENDU

Tu dois produire :

1. L’arborescence des modules
2. Tous les fichiers nécessaires
3. Le contenu complet de chaque fichier
4. Aucun placeholder
5. Aucune omission

La sortie doit être prête à intégrer.

---

# 🧪 VALIDATION AVANT SORTIE

Avant de finaliser :

* Vérifier que chaque attribut possède `$type`
* Vérifier que chaque enum est justifié
* Vérifier la cohérence entre modules
* Vérifier la cohérence entre usecases, types et enums
* Vérifier que la structure `{}` est respectée partout
* Vérifier qu’aucune valeur n’a été inventée

Si un doute existe → poser des questions avant de générer.

---

# 🏗️ APPROCHE MULTI-MODULE

La génération doit :

* Respecter une séparation claire des domaines
* Éviter les duplications
* Centraliser les éléments partagés
* Maintenir une cohérence transverse
* Garantir l’évolutivité

Chaque module doit être autonome mais cohérent avec l’ensemble.

---

# 🚫 INTERDIT

* Inventer des enums
* Deviner des valeurs
* Omettre `$type`
* Générer des structures partielles
* Simplifier la structure
* Ignorer les descriptions API

---

# 🎯 OBJECTIF FINAL

Produire une architecture module complète, cohérente, exploitable immédiatement, parfaitement alignée avec :

* La documentation API
* Les règles du README
* Les besoins métier déduits

Si des informations manquent, demander clarification avant génération.

---
