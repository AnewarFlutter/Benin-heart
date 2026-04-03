# SCAF – Config-Driven Scaffolding Platform

## Présentation

**SCAF** est une plateforme de génération de structure de projet basée sur des fichiers de configuration.
L’objectif est de créer automatiquement l’architecture d’un projet web (Next.js ou similaire) en se basant sur des modules, features, use cases et endpoints définis dans des fichiers YAML.

La plateforme repose sur deux éléments essentiels à la racine du projet :

1. **Dossier `orchestration_scripts/`**

   * Contient les scripts qui exécutent la génération de la structure.
   * **Important :** ce dossier doit toujours être présent à la racine pour que la génération fonctionne correctement.

2. **Dossier `app_configs/`**

   * Contient la configuration du projet, organisée en modules, features et endpoints.
   * Chaque sous-dossier représente un composant ou un module (API, feature métier, etc.).
   * Les fichiers YAML définissent chaque endpoint ou use case individuellement.

---

## Exemple d’arborescence de `app_configs/`

```txt
app_configs/
├── apis/
│   ├── v1/
│   │   ├── auth/
│   │   │   ├── endpoints/
│   │   │   │   ├── LOGIN.yml
│   │   │   │   ├── LOGOUT.yml
│   │   │   │   └── REFRESH_TOKEN.yml
│   │   │   └── root.yml
│   │   ├── user/
│   │   │   ├── endpoints/
│   │   │   │   ├── GET_ME.yml
│   │   │   │   ├── CHANGE_PASSWORD.yml
│   │   │   │   └── UPDATE_ME.yml
│   │   │   └── root.yml
│   │   └── root_v1.yml
├── modules/
│   ├── auth/
│   │   ├── features/
│   │   │   └── session/
│   │   │       ├── usecases/
│   │   │       │   ├── Login.yml
│   │   │       │   ├── Logout.yml
│   │   │       │   └── RefreshToken.yml
│   │   │       └── root.yml
│   │   └── root.yml
│   ├── user/
│   │   ├── features/
│   │   │   └── me/
│   │   │       ├── usecases/
│   │   │       │   ├── GetMe.yml
│   │   │       │   ├── ChangeMePassword.yml
│   │   │       │   └── UpdateMe.yml
│   │   │       └── root.yml
│   │   └── root.yml
└── app.yml
```

> Cette structure illustre la logique de découpage :
>
> * **apis/** contient les définitions d’API et leurs endpoints par version.
> * **modules/** contient les modules métiers, chaque module pouvant avoir plusieurs features et use cases.
> * Chaque sous-dossier peut inclure un `root.yml` pour des métadonnées ou des configurations globales.

---

## Points clés

1. **Dossiers obligatoires** : `orchestration_scripts/` et `app_configs/` à la racine.
2. **Découpage clair par module et feature** : facilite la maintenance et l’évolution.
3. **Fichiers YAML modulaires** : un fichier = un endpoint ou un use case.
4. **Extensibilité** : ajout facile de nouveaux modules, features, endpoints ou use cases.

---

## 🔹 Nomenclature des mots-clés (`$`)

Dans **SCAF – Config-Driven Scaffolding Platform**, tous les **mots-clés importants utilisés dans les fichiers de configuration sont précédés du symbole `$`**.

Cette convention est **globale** et s’applique à toutes les configurations gérées par SCAF. Elle permet :

* **D’identifier rapidement** les éléments structurants d’un fichier YAML.
* **D’uniformiser la lecture et le parsing** par la plateforme.
* **De différencier clairement** les mots-clés des valeurs classiques ou des commentaires.

Exemples généraux de mots-clés :

* `$ProjectName` : nom du projet
* `$Version` : version de l’application
* `$Language` : langue principale
* `$environnement` : environnement cible (`dev`, `prod`, …)
* `$modules`, `$primaryApi`, `$permissions`, `$roles`, etc. : éléments structurants spécifiques

> ⚠️ Le symbole `$` **n’est pas réservé à un type de fichier particulier**, il est utilisé dans toutes les configurations pour identifier les mots-clés de manière uniforme.

---

## 🔹 Fichier de base `app.yml`

Le fichier **`app_configs/app.yml`** est **la configuration centrale de l’application**. Il référence tous les modules, APIs, permissions et rôles et sert de point d’entrée pour la génération de la structure via SCAF.

### Structure générale

```text
app.yml
├─ $ProjectName       # Nom de l’application
├─ $Version           # Version de l’application
├─ $Language          # Langue principale
├─ $environnement     # Environnement cible
├─ $primaryApi        # API principale exposée par le backend
├─ $modules           # Modules applicatifs
├─ $permissions       # Permissions (optionnel)
└─ $roles             # Rôles utilisateurs (optionnel)
```

### Détails des sections

* **``$ProjectName``, ``$Version``, ``$Language``, ``$environnement``**
  Informations de base sur le projet.

* **``$primaryApi``**
  Point d’entrée principal pour l’API backend.
  Utilise `$include` pour référencer un fichier YAML externe, par exemple `./apis/root_v1.yml`.

* **``$modules``**
  Liste tous les modules applicatifs, chacun lié à une API métier.
  Chaque module utilise `$include` pour pointer vers son fichier de configuration principal (`root.yml`).
  Exemples : Core, User, RBAC, Manager, Coach, Player, Auth, Admin, Playground, Schedule, Reservation, Coaching.

* **``$permissions``** (optionnel)
  Référence un fichier YAML listant toutes les permissions disponibles (`./permissions/root.yml`).

* **$roles** (optionnel)
  Référence un fichier YAML définissant les rôles utilisateurs (`./roles/root.yml`).

### Bonnes pratiques

* Les **commentaires sont fortement recommandés** pour chaque module et section afin de faciliter la lisibilité.
* Utiliser `$include` pour **modulariser et réutiliser** les configurations.
* Le fichier `app.yml` **centralise la configuration** et sert de référence pour tous les générateurs de scaffolding de SCAF.

---

### Exemple annoté de `app.yml`

```yaml
# ====================== Padel Club APP CONFIGURATION ======================

$ProjectName: Padel Club Admin        # Nom complet de l’application
$Version: 1.0.0                       # Version initiale
$Language: en                          # Langue principale
$environnement: dev                    # Environnement cible : dev, staging, prod

# API principale exposée par le backend
$primaryApi:
  $include: "./apis/root_v1.yml"      # Fichier YAML de configuration de l’API

# Modules applicatifs
# Chaque module est directement lié à UNE API métier
$modules:

  # ─────────────────────────────────────────────
  # Core / Transversal - 0
  # ─────────────────────────────────────────────
  - $include: "./modules/core/root.yml"  # → Transverse : config, http, errors, i18n, storage

  # ─────────────────────────────────────────────
  # User - 1
  # ─────────────────────────────────────────────
  - $include: "./modules/user/root.yml"  # → API : USER

  # ─────────────────────────────────────────────
  # RBAC - 2
  # ─────────────────────────────────────────────
  - $include: "./modules/rbac/root.yml"  # → API : RBAC

  # ─────────────────────────────────────────────
  # Manager - 3
  # ─────────────────────────────────────────────
  - $include: "./modules/manager/root.yml"  # → API : MANAGER

  # ─────────────────────────────────────────────
  # Coach - 4
  # ─────────────────────────────────────────────
  - $include: "./modules/coach/root.yml"  # → API : COACH

  # ─────────────────────────────────────────────
  # Player - 5
  # ─────────────────────────────────────────────
  - $include: "./modules/player/root.yml"  # → API : PLAYER

  # ─────────────────────────────────────────────
  # Authentication - 6
  # ─────────────────────────────────────────────
  - $include: "./modules/auth/root.yml"  # → API : AUTH

  # ─────────────────────────────────────────────
  # Admin - 7
  # ─────────────────────────────────────────────
  - $include: "./modules/admin/root.yml"  # → API : ADMIN

  # ─────────────────────────────────────────────
  # Playground Management - 8
  # ─────────────────────────────────────────────
  - $include: "./modules/playground/root.yml"  # → API : PLAYGROUND, PLAYGROUND_CONFIGURATION, PLAYGROUND_IMAGE, SLOT

  # ─────────────────────────────────────────────
  # Planning - 9
  # ─────────────────────────────────────────────
  - $include: "./modules/schedule/root.yml"  # → API : SCHEDULE

  # ─────────────────────────────────────────────
  # Réservation - 10
  # ─────────────────────────────────────────────
  - $include: "./modules/reservation/root.yml"  # → API : RESERVATION

  # ─────────────────────────────────────────────
  # Coaching - 11
  # ─────────────────────────────────────────────
  - $include: "./modules/coaching/root.yml"  # → API : COACHING

# Permissions possibles dans l’application (optionnel)
$permissions:
  $include: "./permissions/root.yml"

# Rôles utilisateurs (optionnel)
$roles:
  $include: "./roles/root.yml"
```

---

Parfait ! Voici une proposition de section **Permissions** pour ton README, intégrée et prête à l’emploi. J’ai respecté tout ce que tu m’as dit : nomenclature `$`, structure, commentaires explicatifs, et j’ai inclus un **exemple partiel du fichier**.

---

## 🔐 Permissions

SCAF gère les **permissions applicatives** via des fichiers YAML centralisés. Ces permissions définissent **ce que chaque rôle ou utilisateur peut faire dans l’application**.

### 1️⃣ Nomenclature et symbole `$`

Dans SCAF, **tous les mots-clés de configuration sont précédés du symbole `$`**. Cela permet :

* De distinguer les clés “spéciales” utilisées par le moteur SCAF des données métier.
* D’assurer une **uniformité et lisibilité** dans tous les fichiers YAML (`app.yml`, `permissions/root.yml`, `roles/root.yml`, etc.).
* De permettre la **génération automatique de code et de documentation**.

Exemples de mots-clés génériques :

```yaml
$override: true
$fileNameCasing: snakeCase
$enumName: UserPermission
$constantName: APP_MODULES_STATES
$skip: true
$groups: []
$items: []
```

> ⚠️ Tous ces mots-clés commencent par `$` et sont **réservés au moteur SCAF**, mais peuvent être combinés avec des données projet spécifiques (actions, modules, utilisateurs).

---

### 2️⃣ Fichier de permissions de base

Le fichier principal des permissions se situe dans :

```
/app_configs/permissions/root.yml
```

Il est structuré en trois parties principales :

1. **Métadonnées de génération**

   * `$override` → Remplace ou merge les permissions existantes.
   * `$fileNameCasing` → Style de nommage des fichiers générés.
   * `$enumName` → Nom de l’enum généré pour le code.
   * `$constantName` → Nom de la constante globale.
   * `$skip` → Permet de ne pas générer ce fichier.

2. **Groupes de permissions (`$groups`)**

   * Permettent de regrouper les permissions par module ou fonctionnalité pour générer de la documentation lisible.
   * Chaque groupe contient `$name` et `$description`.

3. **Items de permissions (`$items`)**

   * Chaque permission est définie par :

     * `$key` → Identifiant unique dans le code.
     * `$value` → Action ou route backend associée.
     * `$description` → Explication de la permission.
     * `$group` → Groupe auquel elle appartient.
     * `$available` → Si la permission est active.

---

### 3️⃣ Exemple partiel du fichier `root.yml`

```yaml
# ──────────────────────────────────────────────────────────────
# Permissions pour l'application Padel Club
# ──────────────────────────────────────────────────────────────

$override: true
$fileNameCasing: snakeCase
$enumName: UserPermission
$constantName: APP_MODULES_STATES
$skip: false

$groups:
  - { $name: RESERVATION, $description: "Gestion des réservations de terrains" }
  - { $name: MATCH, $description: "Permissions liées aux matchs" }
  - { $name: PAYMENT, $description: "Permissions liées aux paiements" }

$items:
  - { $key: MATCH_CREATE, $value: match.create, $description: "Créer un match", $group: MATCH, $available: true }
  - { $key: MATCH_LIST, $value: match.list, $description: "Lister les matchs", $group: MATCH, $available: true }
  - { $key: RESERVATION_CREATE, $value: reservation.create, $group: RESERVATION, $available: true }
  - { $key: RESERVATION_CANCEL, $value: reservation.cancel, $group: RESERVATION, $available: true }
  - { $key: PAYMENT_PROCESS, $value: payment.process, $group: PAYMENT, $available: true }
```

> ⚠️ Les permissions sont **spécifiques à chaque projet**, mais la structure reste **identique** pour permettre une génération et une gestion centralisée cohérente.

---

## Roles

SCAF utilise une configuration centralisée pour définir les rôles applicatifs via des fichiers YAML. Les rôles sont indépendants et générés automatiquement côté code selon la nomenclature définie.

### ⚡ Symbolique des mots-clés `$`

Comme dans toutes les configurations SCAF, les mots-clés **sont précédés du symbole `$`** :

* `$override` → détermine si le fichier remplace entièrement la configuration existante (`true`) ou si un merge incrémental est appliqué (`false`).
* `$fileNameCasing` → style de nommage des fichiers générés (`snakeCase`, `camelCase`, etc.).
* `$enumName` → nom de l’enum généré côté code pour représenter les rôles.
* `$constantName` → nom de la constante globale qui contiendra les rôles et permissions.
* `$skip` → si `true`, le moteur ignore ce fichier lors de la génération.
* `$groups` → liste des groupes de rôles pour regrouper et documenter les rôles.
* `$items` → liste des rôles définis, chacun avec ses métadonnées et permissions.

Tous les mots-clés spécifiques à SCAF suivent ce préfixe `$`, ce qui permet au moteur de les distinguer des données “utilisateur” ou des valeurs textuelles.

---

### 📂 Fichier de base : `app_configs/roles/root.yml`

Le fichier contient :

1. **Groupes de rôles** (`$groups`)
   Chaque groupe permet de regrouper les rôles par type :

   * `METIER` → rôles métier (ex. PLAYER, COACH, MANAGER)
   * `ADMIN` → rôles administratifs (ex. ADMIN, SUPER_ADMIN)

2. **Définition des rôles** (`$items`)
   Chaque rôle définit :

   * `$key` → identifiant unique du rôle
   * `$value` → valeur associée
   * `$description` → description textuelle du rôle
   * `$level` → niveau hiérarchique (utilisé pour comparer les privilèges)
   * `$group` → groupe d’appartenance
   * `$permissions` → liste des permissions associées, **qui doivent correspondre aux clés de `/permissions/root.yml`**
   * `$available` → indique si le rôle est actif

> ⚠️ Les permissions doivent être cohérentes avec celles définies dans la configuration des permissions. Pour un rôle avec un accès total (ex. SUPER_ADMIN), il est possible d’utiliser le wildcard `"*"`.

---

### 🔹 Exemple partiel de fichier `root.yml`

```yaml
# ──────────────────────────────────────────────────────────────
# Section dédiée aux rôles (100% indépendante)
# ──────────────────────────────────────────────────────────────

$override: true
$fileNameCasing: snakeCase
$enumName: UserRole
$constantName: ROLE_PERMISSIONS
$skip: true

$groups:
  - $name: METIER
    $description: "Rôles métier"
  - $name: ADMIN
    $description: "Rôles administratifs"

$items:
  - $key: PLAYER
    $value: PLAYER
    $description: "Joueur standard"
    $level: 1
    $group: METIER
    $permissions: []
    $available: true

  - $key: MANAGER
    $value: MANAGER
    $description: "Manager de club"
    $level: 5
    $group: METIER
    $permissions:
      - RESERVATION_LIST
      - PAYMENT_PROCESS
      - VIEW_COURT
      - ADD_COURT
      - CHANGE_COURT
    $available: true

  - $key: SUPER_ADMIN
    $value: SUPER_ADMIN
    $description: "Accès total (dev only)"
    $level: 99
    $group: ADMIN
    $permissions: [ "*" ]
    $available: true
```

---

Cette section du README fournit **une vue globale sur la manière de définir, structurer et documenter les rôles** dans SCAF, et comment ils se lient aux permissions.

---

## 📡 API Configuration

SCAF permet de centraliser et de standardiser la configuration de toutes les APIs utilisées par l’application. Chaque API est définie par un fichier YAML, versionné et modulaire, référencé depuis `app.yml` via `$primaryApi`.

### 🔹 Utilisation du symbole `$`

Comme pour toutes les sections SCAF, **tous les mots-clés importants sont précédés du symbole `$`**. Cela permet au moteur SCAF de :

* Identifier les paramètres configurables
* Gérer l’héritage, le merge ou le skip
* Générer automatiquement les clients API ou les enums côté front

Exemples de mots-clés génériques utilisés dans les fichiers d’API :

| Mot-clé          | Description                                                               |
| ---------------- | ------------------------------------------------------------------------- |
| `$version`       | Version de l’API (ex. v1)                                                 |
| `$title`         | Nom lisible de l’API                                                      |
| `$description`   | Description fonctionnelle de l’API                                        |
| `$environnement` | Environnement cible (dev, prod, test…)                                    |
| `$skip`          | Si `true`, le fichier est ignoré lors de la génération                    |
| `$baseUrl`       | URL de base de l’API, pouvant être dynamique via `$envVar` et `$default`  |
| `$endpoints`     | Liste de tous les modules ou ressources exposés par l’API                 |
| `$include`       | Chemin relatif vers un fichier YAML détaillant le module ou les endpoints |

---

### 🔹 Fichier de base API : `root_v1.yml`

Ce fichier définit l’API principale (`v1`) de l’application et sert de référence pour tous les endpoints consommés par le front. La structure est **modulaire**, chaque module étant inclus via `$include` pour garder le fichier principal lisible et maintenable.

#### Exemple de structure :

```yaml
# ====================== ROOT API V1 ======================
$version: v1
$title: "Root API v1"
$description: "Gestion de l'API v1"
$environnement: dev
$skip: false

$baseUrl:
  $envVar: NEXT_PUBLIC_API_URL
  $default: http://localhost:3000/api/v1

$endpoints:
  RBAC: 
    $description: "Gestion des droits d'accès"
    $include: "./v1/rbac/root.yml"

  USER:
    $description: "Gestion des utilisateurs"
    $include: "./v1/user/root.yml"

  ADMIN:
    $description: "Gestion des actions administratives"
    $include: "./v1/admin/root.yml"

  COACHING:
    $description: "Gestion du coaching (disponibilités et sessions)"
    $include: "./v1/coaching/root.yml"

  RESERVATION: 
    $description: "Gestion des réservations"
    $include: "./v1/reservation/root.yml"
```

#### 🔹 Points clés

* Chaque module d’API est indépendant et possède son propre fichier YAML (`./v1/<module>/root.yml`) détaillant tous les endpoints (GET, POST, PATCH, DELETE…).
* `$baseUrl` peut pointer vers **une variable d’environnement** ou une valeur par défaut selon l’environnement.
* La hiérarchie et le découpage par module permettent :

  * Une meilleure lisibilité
  * La réutilisation des modules entre projets
  * Une maintenance plus simple des endpoints

---

Voici une proposition de section README pour la partie **Modules API** des fichiers indexés par `$endpoints` dans `root_v1.yml` :

---

## Modules API – Fichiers `root.yml` de chaque groupe d'endpoints API

Chaque groupe d'endpoints API de l’application dispose de son propre fichier `root.yml`, situé dans le dossier correspondant au module, par exemple :

```
/app_configs/apis/v1/coach_schedule_time_slot/root.yml
```

Ces fichiers servent de **point d’entrée pour la configuration du module** et permettent de centraliser tous les endpoints d’un groupe d'endpoints API de façon uniforme.

### Objectif

* Fournir un **point d’inclusion unique** pour chaque groupe d'endpoints dans le fichier principal `root_v1.yml`.
* Décrire **le groupe d'endpoints de manière lisible** grâce à un commentaire et au champ `$description`.
* Lister tous les endpoints du groupe d'endpoints via `$routes` afin que le moteur de scaffolding puisse **générer automatiquement le client API, la documentation ou les mocks**.
* Permettre de **désactiver temporairement** un groupe d'endpoins sans affecter le reste du projet grâce à `$skip`.

---

### Structure type d’un fichier `root.yml` de groupe d'endpoints

```yaml
# ====================== NOM DU GROUPE D'ENDPOINTS - ADMIN API ======================
# Commentaire de début : description concise et claire du module
# Exemples :
#   - "Gestion des plages horaires dans un jour du planning de coaching (disponibilités des coachs)"
#   - "Gestion des actions administratives sur les utilisateurs et rôles"
# Les commentaires doivent être informatifs pour toute personne lisant la config.

$description: "Gestion des plages horaires dans un jour du planning de coaching (disponibilités des coachs)"

$routes:
  ROUTE1:
    $include: "./endpoints/ROUTE1.yml"
  ROUTE2:
    $include: "./endpoints/ROUTE2.yml"
  ROUTE3:
    $include: "./endpoints/ROUTE3.yml"
  # Inclut tous les endpoints du module

$skip: false  # true → module ignoré par le moteur de scaffolding
```

---

### Points clés à retenir

1. **Commentaire de début**

   * Obligatoire pour décrire le groupe d'endpoints de façon lisible.
   * Doit donner un contexte fonctionnel et technique.
   * Peut inclure plusieurs lignes pour expliquer l’usage du groupe d'endpoints, la relation avec d’autres groupes d'endpoints, ou les APIs concernées.

2. **$description**

   * Brève description textuelle du groupe d'endpoints.
   * Sert pour la documentation générée et la compréhension rapide du groupe d'endpoints.

3. **$routes**

   * Inclus tous les fichiers endpoints du groupe.
   * Utiliser un format uppercase pour le nom de ROUTE.
   * Permet au moteur de scaffolding de parcourir et générer uniformément toutes les routes du groupe d'endpoints.

4. **$skip**

   * Si `true`, le groupe d'endpoints est ignoré lors de la génération automatique.
   * Permet de désactiver temporairement un groupe d'endpoints sans supprimer ses fichiers.

5. **Consistance**

   * Tous les groupes d'endpoints API doivent suivre exactement cette structure.
   * Respecter cette convention assure que le moteur de scaffolding peut scanner tous les groupes d'endpoints de manière uniforme et fiable.

---

### Exemple concret

```yaml
# ====================== COACH_SCHEDULE_TIME_SLOT ADMIN API ======================
# Gestion des plages horaires dans un jour du planning de coaching
# Ce groupe d'endpoints centralise les disponibilités horaires des coachs et les endpoints associés
# Chaque endpoint est inclus via le répertoire ./endpoints
$description: "Gestion des plages horaires dans un jour du planning de coaching (disponibilités des coachs)"

$routes:
  ROUTE1:
    $include: "./endpoints/ROUTE1.yml"

$skip: false
```

---

## 📌 Endpoints API

Chaque endpoint/route de l’API est défini dans son propre fichier YAML. Ces fichiers sont inclus dans les modules via les fichiers `root.yml` des modules ou directement dans le `root_v1.yml` du dossier `/app_configs/apis`. Cette structure permet :

* la **documentation automatique**,
* la **génération de clients API**,
* la **validation stricte des paramètres et des réponses**,
* et une **cohérence totale entre les endpoints**.

Tous les endpoints suivent une nomenclature uniforme et des conventions strictes.

---

### 1️⃣ Structure générale d’un fichier endpoint/route

Chaque endpoint est représenté par un fichier YAML individuel avec :

```yaml
# ------------------------------------------------------------------
# NOM_ENDPOINT - Description courte et contexte de l'endpoint
# ------------------------------------------------------------------

$path: /chemin/endpoint/{param}       # URL de l'API (placeholders autorisés)
$method: GET|POST|PUT|DELETE|PATCH   # Méthode HTTP en majuscules
$description: "Description fonctionnelle complète"
$auth: true|false                     # Authentification requise
$skip: true|false                     # Ignorer l’endpoint dans la génération
$params:                              
  $path: {...}                        # paramètres dans l’URL
  $query: {...}                       # paramètres query string
  $body: {...}                        # paramètres du body (POST/PUT/PATCH)
$response:
  $default: {...}                     # schéma principal de réponse succès
  $byStatus: {...}                    # schéma des réponses par code d'erreur (optionnel)
```

#### Points clés :

* **$type** est **obligatoire pour tous les attributs**.
* `$optional` doit être défini (`true` ou `false`) pour chaque champ.
* Les types disponibles : `string`, `number`, `boolean`, `array`, `object`.
* Les objets `$type: object` doivent **avoir soit `$schema`, soit `$keyType/$valueType`**.
* Les tableaux `$type: array` doivent toujours définir `$items`.
* Les endpoints sont atomiques : un endpoint = un fichier YAML.
* Le commentaire de début doit être précis : séparation, nom de l’endpoint et description courte.

---

### 2️⃣ Structure des paramètres ($params)

* `$path` : paramètres dans l’URL, souvent des IDs (`day_id`, `slot_id`, etc.)
* `$query` : paramètres query string (optionnels ou filtrages)
* `$body` : payload JSON pour POST, PUT, PATCH

Chaque paramètre doit préciser :

```yaml
nom_param:
  $type: string|number|boolean|object|array
  $optional: true|false
  $description: "facultatif, description détaillée"
```

Exemple :

```yaml
$params:
  $path:
    day_id: { $type: string, $optional: false }
  $body:
    start_time: { $type: string, $optional: false, $description: "HH:MM" }
    end_time: { $type: string, $optional: false, $description: "HH:MM" }
    session_duration_minutes: { $type: number, $optional: false }
    session_type: { $type: string, $optional: false, $description: "INDIVIDUAL, GROUP, MIXED" }
```
> Souevent en cas d'une enumeration, il faut le préciser dans la description avec ses valeurs possibles
---

### 3️⃣ Structure de la réponse ($response)

* `$default` : schéma principal pour le succès (HTTP 200/201/202)
* `$byStatus` : schéma pour les codes d’erreur spécifiques (400, 401, 403, 404, etc.)
* Les objets `$type: object` peuvent contenir :

  * `$schema` : structure fixe de l’objet
  * `$keyType` / `$valueType` : pour modéliser des maps ou dictionnaires
* Les tableaux `$type: array` doivent définir `$items`
* Les descriptions sont optionnelles mais toujours recommander pour une meilleure gestion plus tard.

Exemple `$response` pour un endpoint POST de création d’une plage horaire :

```yaml
$response:
  $default:
    $description: "..........."
    $schema:
      message: { $type: string, $description: "------" }
      data:
        $type: object
        $schema:
          id: { $type: string, $description: "------" }
          availability_day: { $type: string, $description: "------" }
          start_time: { $type: string, $description: "------" }
          end_time: { $type: string, $description: "------" }
          duration_minutes: { $type: number, $description: "------" }
          session_duration_minutes: { $type: number, $description: "------" }
          session_type: { $type: string, $description: "------" }
          individual_price: { $type: number, $description: "------" }
          group_price_per_person: { $type: number, $description: "------" }
          max_participants: { $type: number, $description: "------" }
          min_participants: { $type: number, $description: "------" }
          label: { $type: string, $description: "------" }
          is_active: { $type: boolean, $description: "------" }
          can_have_individual: { $type: boolean, $description: "------" }
          can_have_group: { $type: boolean, $description: "------" }
          created_at: { $type: string, $description: "------" }
          updated_at: { $type: string, $description: "------" }
  $byStatus:
    "400":
      $schema:
        error: { $type: string, $description: "------" }
        code: { $type: string, $description: "------" }
```
> Souevent en cas d'une enumeration, il faut le préciser dans la description avec ses valeurs possibles
---

### 4️⃣ Exemple complet de fichier endpoint

```yaml
# ------------------------------------------------------------------
# CREATE_COACH_SCHEDULE_TIME_SLOT - Création d'une plage horaire (Admin)
# ------------------------------------------------------------------

$path: /coaching/admin/days/{day_id}/slots/
$method: POST
$description: "[ADMIN] Ajoute une nouvelle plage horaire sur un jour de disponibilité"
$auth: true
$skip: false
$params:
  $path:
    day_id: { $type: string, $optional: false }
  $body:
    start_time: { $type: string, $optional: false, $description: "HH:MM" }
    end_time: { $type: string, $optional: false, $description: "HH:MM" }
    session_duration_minutes: { $type: number, $optional: false }
    session_type: { $type: string, $optional: false, $description: "INDIVIDUAL, GROUP, MIXED" }
$response:
  $default:
    $schema:
      message: { $type: string }
      data:
        $type: object
        $schema:
          id: { $type: string }
          availability_day: { $type: string }
          start_time: { $type: string }
          end_time: { $type: string }
          duration_minutes: { $type: number }
          session_duration_minutes: { $type: number }
          session_type: { $type: string }
          is_active: { $type: boolean }
          created_at: { $type: string }
          updated_at: { $type: string }
  $byStatus:
    "400":
      $schema:
        error: { $type: string }
        code: { $type: string }
```

---

### ✅ Points clés à retenir

1. Chaque attribut **doit** avoir `$type` et `$optional`.
2. `$params` et `$response` sont optionnels mais fortement recommandés pour typage et validation.
3. `$schema` pour objets à structure fixe, `$keyType/$valueType` pour maps dynamiques.
4. `$byStatus` pour gérer les erreurs selon le code HTTP.
5. Les commentaires initiaux sont **obligatoires** et doivent respecter la structure :

   * ligne de séparation,
   * nom de l’endpoint,
   * description courte et rôle.
6. Endpoints atomiques → un fichier YAML = un endpoint.

---

## 📌 RECAPITUTIF API – Architecture et Configuration

SCAF utilise une **architecture API 100% configurable via YAML**, permettant :

* une **documentation centralisée et standardisée**,
* une **génération de clients API automatiques**,
* une **validation stricte des paramètres et des réponses**,
* et une **modularité complète** pour chaque module applicatif.

L’organisation se fait sur plusieurs niveaux : **root API → groupes_endpoints → endpoints**.

---

### 1️⃣ Root API (`root_v1.yml`)

Le fichier `root_v1.yml` définit la racine de l’API et référence tous les groupes_endpoints principaux.

Exemple :

```yaml id="root_api_example"
# ====================== ROOT API V1 ======================

$version: v1
$title: "Root API v1"
$description: "Gestion de l'API v1"
$environnement: dev
$skip: false

$baseUrl:
  $envVar: NEXT_PUBLIC_API_URL
  $default: http://localhost:3000/api/v1

$endpoints:
  RBAC: 
    $description: "Gestion des droits d'accès"
    $include: "./v1/rbac/root.yml"

  USER:
    $description: "Gestion des utilisateurs"
    $include: "./v1/user/root.yml"

  COACH:
    $description: "Gestion des actions des coaches"
    $include: "./v1/coach/root.yml"
```

#### Points clés :

* `$baseUrl` peut être dynamique via une variable d’environnement (`$envVar`).
* Chaque module ou endpoint majeur est inclus via `$include`, permettant la **modularité**.
* `$description` permet de documenter chaque module.

**Diagramme simplifié des dépendances root → groupes_endpoints → endpoints** :

```
root_v1.yml
 ├─ RBAC/root.yml
 │    └─ endpoints/*.yml
 ├─ USER/root.yml
 │    └─ endpoints/*.yml
 └─ COACH/root.yml
      └─ endpoints/*.yml
```

---

### 2️⃣ Modules API (`groupes_endpoints/root.yml`)

Chaque module regroupe les endpoints d’un domaine fonctionnel. Exemple : `coach_schedule_time_slot/root.yml` :

```yaml id="module_root_example"
# ====================== COACH_SCHEDULE_TIME_SLOT ADMIN API ======================

$description: "Gestion des plages horaires dans un jour du planning de coaching (disponibilités des coachs)"
$routes:
  ROUTE1:
    $include: "./endpoints/ROUTE1.yml"
$skip: false
```

#### Points clés :

* `$routes` référence **tous les endpoints** du groupes_endpoints pour chacun
* Chaque groupes_endpoints est autonome et peut être activé ou ignoré (`$skip: true|false`).
* Le commentaire initial décrit le groupes_endpoints et son périmètre fonctionnel.

---

### 3️⃣ Endpoints (`endpoints/*.yml`)

Chaque endpoint a **son propre fichier YAML**.
Il décrit :

* URL (`$path`) et méthode HTTP (`$method`)
* Authentification (`$auth`)
* Paramètres (`$params`) : `$path`, `$query`, `$body`
* Schéma de réponse (`$response`) : `$default` + `$byStatus`

Exemple :

```yaml id="endpoint_example"
# ------------------------------------------------------------------
# CREATE_COACH_SCHEDULE_TIME_SLOT - Création d'une plage horaire (Admin)
# ------------------------------------------------------------------

$path: /coaching/admin/days/{day_id}/slots/
$method: POST
$description: "[ADMIN] Ajoute une nouvelle plage horaire sur un jour de disponibilité"
$auth: true
$skip: false

$params:
  $path:
    day_id: { $type: string, $optional: false }
  $body:
    start_time: { $type: string, $optional: false, $description: "HH:MM" }
    end_time: { $type: string, $optional: false, $description: "HH:MM" }
    session_duration_minutes: { $type: number, $optional: false }
    session_type: { $type: string, $optional: false, $description: "INDIVIDUAL, GROUP, MIXED" }

$response:
  $default:
    $schema:
      message: { $type: string }
      data:
        $type: object
        $schema:
          id: { $type: string }
          start_time: { $type: string }
          end_time: { $type: string }
          session_type: { $type: string }
          session_duration_minutes: { $type: number }
          created_at: { $type: string }
          updated_at: { $type: string }
  $byStatus:
    "400":
      $schema:
        error: { $type: string }
        code: { $type: string }
```

#### Conventions importantes :

1. **Commentaire de début** : lignes de séparation + nom de l’endpoint + description courte.
2. **$type obligatoire** pour chaque attribut (`string`, `number`, `boolean`, `array`, `object`).
3. **$optional obligatoire** pour chaque attribut (`true` ou `false`).
4. Les objets `$type: object` doivent avoir `$schema` (structure fixe) ou `$keyType/$valueType` (map dynamique).
5. Les tableaux `$type: array` doivent définir `$items`.
6. `$byStatus` pour gérer les réponses d’erreur selon le code HTTP.
7. Les endpoints polymorphes (plusieurs réponses succès 200/201/202) peuvent soit être séparés en plusieurs endpoints, soit fusionnés dans `$default` avec des attributs optionnels.

---

### 4️⃣ Exemple complet de chemin modulaire

```
root_v1.yml
 └─ COACH/root.yml
      └─ coach_schedule_time_slot/root.yml
            └─ endpoints/CREATE_COACH_SCHEDULE_TIME_SLOT.yml
            └─ endpoints/GET_COACH_SCHEDULE_TIME_SEGMENTS_FOR_TIME_SLOT.yml
```

* **root_v1.yml** → centralise tous les modules
* **module/root.yml** → référence tous les endpoints du module
* **endpoints/*.yml** → détaille chaque endpoint avec paramètres et schéma de réponse

Cette structure garantit :

* **Lisibilité** : chaque endpoint est isolé et bien documenté
* **Réutilisabilité** : endpoints et modules peuvent être activés, désactivés ou réutilisés dans plusieurs projets
* **Validation stricte** : tous les champs ont `$type` et `$optional`, évitant les erreurs runtime

---

## 📦 Modules Applicatifs et Features

### Cohérence et approche

La définition des modules applicatifs et de leurs features se fait toujours **après analyse complète de la partie API**.
L’objectif est d’assurer une **cohérence totale entre les endpoints exposés, les fonctionnalités attendues et la structure de l’application**. On ne définit pas un module “à la volée” : chaque module découle de la compréhension technique du projet, des besoins métiers et de l’architecture API.

* Un **groupe de endpoints API** peut correspondre à un module complet.
* Dans certains cas, **plusieurs groupes de endpoints** peuvent coexister dans un seul module, sous forme de **features** distinctes.
* Cette approche garantit que la navigation, l’exploration et la génération de code dans l’application restent cohérentes avec les services backend.

---

### 1️⃣ Structure générale d’un module

Chaque module applicatif possède un fichier racine `root.yml` situé dans `app_configs/modules/{module}/root.yml`. Ce fichier décrit les informations principales et la composition du module.

Champs principaux :

| Clé               | Description                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `$name`           | Nom unique du module, utilisé pour référence dans l’application et pour les features.               |
| `$fileNameCasing` | Casing utilisé pour générer les fichiers (`snakeCase`, `camelCase`, etc.).                          |
| `$description`    | Description textuelle du module (optionnelle).                                                      |
| `$override`       | Si `true`, remplace le module existant à la génération.                                             |
| `$delete`         | Si `true`, supprime le module existant.                                                             |
| `$skip`           | Si `true`, ignore complètement le module lors du scan.                                              |
| `$enums`          | Présence d’enums transverses au module (optionnel, rôle : fournir des valeurs fixes réutilisables). |
| `$types`          | Présence de types complexes (optionnel, rôle : structures d’objets pour TypeScript).                |
| `$features`       | Liste des features (sous-modules fonctionnels) du module.                                           |

---

### 2️⃣ Hiérarchie Modules → Features

* Les **features** sont des sous-modules fonctionnels décrits via `$features` dans le `root.yml` du module.
* Chaque feature peut contenir ses propres enums, types.
* Une feature non incluse dans `$features` **ne sera jamais scannée ni générée**, ce qui permet un contrôle fin de ce qui est actif dans l’application.
* La valeur définie dans `$name` du module ou de la feature sera **toujours utilisée pour référence ailleurs** dans le projet.

**Exemple minimal de module avec features :**

```yaml
$name: coaching
$fileNameCasing: snakeCase
$description: "Module de gestion du coaching pour admin"
$override: false
$delete: false
$skip: false

$features:
  - $include: "./features/coach_availability/root.yml"
  - $include: "./features/coaching_session/root.yml"
```

---

### 3️⃣ Points clés et bonnes pratiques

1. **Référencement obligatoire dans `app.yml`** : un module non référencé ne sera jamais scanné.
2. **Module Core recommandé** : centralise enums/types transverses et évite les duplications.
3. **Flexibilité et modularité** : un module peut correspondre à un ou plusieurs groupes d’API selon l’analyse technique.
4. **Cohérence** : chaque module doit refléter fidèlement la structure et la logique des APIs backend.
5. **Enums et Types** : leur présence est facultative mais recommandée pour la standardisation et la réutilisation des valeurs et des structures.

---

### 4️⃣ Diagramme simplifié de dépendances

```text
app.yml
 ├─ modules/
 │    ├─ core/
 │    │    ├─ enums (valeurs transverses)
 │    │    └─ types (objets transverses)
 │    ├─ coaching/
 │    │    └─ features/
 │    │         ├─ coach_availability/root.yml
 │    │         └─ coaching_session/root.yml
 │    └─ ... autres modules
```

---

Cette section pose le cadre **global et stratégique** pour tous les modules applicatifs et features.
La définition détaillée des **enums et types** sera traitée dans une section dédiée plus tard.

---

## 📌 Features métier

### Présentation générale

Une **feature** représente une unité fonctionnelle spécifique d’un module applicatif.
Elle est conçue pour encapsuler :

* Les règles métiers propres à une action ou un ensemble d’actions.
* Les types et enums spécifiques à cette fonctionnalité.
* Les usecases liés aux endpoints de l’API correspondants.

> **Point clé :** La cohérence des features est directement dépendante de la compréhension des APIs. Une feature doit toujours être conçue en fonction des endpoints existants et des types de données qu’ils exposent pour assurer une intégration fiable dans l’application.

---

### Structure générale d’une feature

Chaque feature possède un **fichier root** (`root.yml`) avec les sections principales suivantes :

| Section                    | Description                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| `$name`                    | Nom unique de la feature, utilisé pour la référence dans le module et l’application.      |
| `$description`             | Description textuelle et rôle de la feature.                                              |
| `$fileNameCasing`          | Convention de nommage des fichiers générés (`snakeCase`, `camelCase`, etc.).              |
| `$override`                | Si `true`, remplace la feature existante à la génération.                                 |
| `$delete`                  | Si `true`, supprime la feature existante.                                                 |
| `$skip`                    | Si `true`, ignore complètement la feature lors du scan.                                   |
| `$rewriteInController`     | Si `true`, génère automatiquement le code de la feature dans le controller.               |
| `$rewriteInDataSourceImpl` | Si `false`, la génération dans la datasource est désactivée.                              |
| `$enums`                   | Optionnel : contient les enums spécifiques à la feature (valeurs fixes et réutilisables). |
| `$types`                   | Optionnel : définit les types complexes (objets) utilisés dans la feature.                |
| `$usecases`                | Liste des usecases fonctionnels, chacun correspondant à un endpoint API spécifique.       |

**Exemple minimal de feature (sans enums/types)** :

```yaml
# ------------------------------------------------------------------
# Feature : reservations_metadata (choix publics pour réservation)
# ------------------------------------------------------------------
$name: reservations_metadata
$description: "Récupération des enums et choix pour les formulaires de réservation (public/authentifié)"
$fileNameCasing: snakeCase
$override: false
$delete: false
$skip: false
$rewriteInController: true
$rewriteInDataSourceImpl: false

$enums: []

$types: []

$usecases:
  - $include: "./usecases/getReservationMetadataChoices.yml"
```

---

### Points clés

1. **Header commenté** : toujours présent pour décrire la feature et son rôle.
2. **Flags de génération** : `$rewriteInController` et `$rewriteInDataSourceImpl` sont essentiels pour la génération automatique du code.
3. **``$enums`` et ``$types``** : optionnels mais permettent de standardiser les valeurs et objets propres à la feature.
4. **$usecases** : chaque usecase est lié à un endpoint de l’API et gère une action métier spécifique.
5. **Cohérence** : le nom des types et la structure des attributs doivent correspondre à la logique de l’API pour garantir l’intégration frontend/backend.
6. **Modularité** : une feature peut être référencée dans un module applicatif, mais elle ne sera prise en compte que si elle est incluse via `$features` dans le module et non `$skip: true`.

---

### Exemple de commentaire pour une feature

```yaml
# ------------------------------------------------------------------
# Feature : nom_de_la_feature (description courte)
# ------------------------------------------------------------------
```

> Les commentaires en en-tête permettent de documenter rapidement la feature, son objectif et son contexte.
> Ils sont obligatoires pour faciliter la maintenance et la génération de code.

---

Cette structure permet :

* Une **lecture claire et documentée** des features.
* Une **réutilisation facile** des enums et types spécifiques.
* Une **traçabilité complète** entre les usecases et les endpoints de l’API.

---

# 📌 Gestion des `$enums` dans les modules et features

## 🎯 Objectif

Les `$enums` sont utilisés pour **centraliser et standardiser toutes les valeurs fixes ou répétitives** de l’application. Leur rôle principal est de :

* Garantir **la cohérence des valeurs** entre l’API, la base de données et le code frontend/backend.
* Servir à **la génération automatique de types** et d’interfaces.
* Faciliter l’utilisation des valeurs dans les formulaires, validations et UI.

> ⚠️ La définition des enums nécessite **une analyse préalable des endpoints API et éventuellement de la base de données**.
> On ne les définit pas « à la volée » : il faut observer quels attributs prennent un ensemble de valeurs fixes, soit dans la description des endpoints, soit dans les valeurs retournées par la base.

---

## 🛠️ Structure générale d’un `$enum`

Chaque `$enum` suit la structure suivante :

```yaml
$enums:
  - $name: NomDeLEnum
    $generate: true
    $splitPerFile: true
    $values: ["VALEUR1", "VALEUR2", "VALEUR3"]
    $description: "Description générale de l'enum"
    $descriptions:
      VALEUR1: "Description détaillée de VALEUR1"
      VALEUR2: "Description détaillée de VALEUR2"
      VALEUR3: "Description détaillée de VALEUR3"
```

### 🔹 Explications des champs

| Clé             | Description                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| `$name`         | Nom unique de l’enum pour référence dans le code (module/feature).                                            |
| `$generate`     | Indique si un type/code doit être généré automatiquement (`true`).                                            |
| `$splitPerFile` | Si `true`, chaque enum sera générée dans un fichier séparé pour faciliter la maintenance et la réutilisation. |
| `$values`       | Liste des valeurs possibles (strings ou nombres).                                                             |
| `$description`  | Description globale de l’enum pour documentation.                                                             |
| `$descriptions` | Map optionnelle pour décrire chaque valeur individuellement (utile pour UI, formulaires ou doc).              |

---

# 📦 Types et Enums

## 🔹 Bonnes pratiques pour créer un `$enum`

1. **Analyse API / Base de données**

   * Identifier les attributs qui ne prennent qu’un ensemble de valeurs limitées.
   * Vérifier dans la documentation des endpoints ou les tables SQL correspondantes.
   * Exemple : `session_type` dans les endpoints de coaching → `"INDIVIDUAL" | "GROUP" | "MIXED"`.

2. **Consistance dans l’application**

   * Enum définie au niveau **module** si elle est transversale (ex : WeekdayEnum).
   * Enum définie au niveau **feature** si spécifique à une logique métier (ex : CoachingSessionStatusEnum).

3. **Documentation complète**

   * Toujours renseigner `$description` et `$descriptions` pour chaque valeur.
   * Permet à l’équipe frontend et backend de comprendre immédiatement le rôle et les usages.

4. **Typage fort**

   * Les valeurs peuvent être des `string` ou `number` selon le contexte métier.
   * Utiliser des enums permet de limiter les erreurs (typos, incohérences) dans le code.

5. **Fichiers séparés si réutilisation**

   * `$splitPerFile: true` pour réutiliser facilement l’enum dans plusieurs modules/features.
   * Sinon, l’enum reste dans le fichier principal des `$enums` du module/feature.

---

## 🔹 Exemples concrets

### Enum de type de session de coaching

```yaml
$name: CoachingSessionTypeEnum
$generate: true
$splitPerFile: true
$values: ["INDIVIDUAL", "GROUP", "MIXED"]
$description: "Type de session de coaching"
$descriptions:
  INDIVIDUAL: "Session individuelle (1 joueur)"
  GROUP: "Session de groupe (plusieurs joueurs)"
  MIXED: "Session mixte (1 joueur ou plusieurs joueurs)"
```

### Enum de jours de la semaine (numérique)

```yaml
$name: WeekdayEnum
$generate: true
$splitPerFile: true
$values: [0, 1, 2, 3, 4, 5, 6]
$description: "Jour de la semaine (0=Lundi, 6=Dimanche)"
$descriptions:
  0: "Lundi"
  1: "Mardi"
  2: "Mercredi"
  3: "Jeudi"
  4: "Vendredi"
  5: "Samedi"
  6: "Dimanche"
```

> ✅ Ces enums sont ensuite utilisées dans les modules ou features pour typer les formulaires, gérer les filtres, et sécuriser les valeurs envoyées à l’API.

---

## 🔹 Points clés

* La création des enums **ne se fait jamais à la volée**, toujours basée sur **une analyse de l’API et/ou de la base de données**.
* Les enums doivent être **réutilisables et centralisées** autant que possible.
* Chaque valeur d’enum **doit être documentée** pour éviter toute ambiguïté.
* `$generate: true` et `$splitPerFile: true` sont conseillés pour garantir modularité et génération automatique de code.

---

Voici une proposition de section README pour la partie `$types` et gestion des enums/types basée sur ton exemple et les principes que tu as décrits :

---
## 🛠️ Structure générale d’un `$types`

Dans ce projet, tous les types utilisés pour l’API sont centralisés dans la section `$types`. L’objectif est de garantir :

* Une **consistance** dans les payloads et les réponses.
* Une **réutilisabilité** des types et enums à travers les modules et features.
* Une **documentation claire** pour les développeurs front et back.

---

### 1️⃣ Types pour les paramètres d’API

* Les types peuvent être créés pour les **body**, **query**, et **path**.
* Bonnes pratiques :

  * Si un body a plus de 3 attributs, il est préférable de lui créer un type spécifique (payload).
  * Les query params (filtres, pagination) peuvent aussi bénéficier d’un type.
  * Les path params sont rarement transformés en type, sauf si le parent comporte plusieurs segments complexes (>3).

**Exemple : `GetCoachingSessionsParams`**

```yaml
$types:
  - $name: GetCoachingSessionsParams
    $attributes:
      - { $name: coach_id, $type: string, $optional: true }
      - { $name: player_id, $type: string, $optional: true }
      - { $name: status, $type: CoachingSessionStatusEnum, $optional: true }
      - { $name: date_from, $type: string, $optional: true }
      - { $name: date_to, $type: string, $optional: true }
```

---

### 2️⃣ Types pour les réponses

* Tout `$schema` détecté dans les réponses doit être transformé en type.
* Utiliser systématiquement la notation **accolades** `{}` pour les attributs.
* Les objets complexes (`object`) deviennent obligatoirement des types.
* Les tableaux utilisent `$list: true`.
* Les champs pouvant être absents ou `null` utilisent `$optional: true` et `$nullable: true`.

**Exemple : `CoachingSessionListResponse`**

```yaml
- $name: CoachingSessionListResponse
  $attributes:
    - { $name: count, $type: number }
    - { $name: results, $type: CoachingSessionLite, $list: true, $optional: false }
```

---

### 3️⃣ Référencer un type ou une enum

Pour garantir que les types/enums soient retrouvables à travers modules et features, chaque attribut lié utilise `$related` :

```yaml
$related:
  $name: PaymentStatus
  $module: reservation
  $kind: enum      # "enum" ou "custom" (custom = type)
  $step: module    # "module" ou "feature"
  $feature: null   # optionnel, si spécifique à une feature
```

* `$kind` : indique si c’est un `enum` ou `custom` (type applicatif).
* `$module` : module propriétaire.
* `$feature` : si l’enum/type appartient à une feature spécifique.
* `$step` : niveau de recherche (`module` ou `feature`).

---

### 4️⃣ Attributs

Chaque attribut doit préciser :

* `$name` : le nom exact côté API.
* `$type` : le type (string, number, boolean, custom type ou enum).
* `$optional` : true/false selon si le champ est requis.
* `$nullable` : true si le champ peut être null.
* `$list` : true si c’est un tableau.
* `$related`: au besoin si c'est un type applicatif ou enum

Exemple :

```yaml
- $name: status
  $type: CoachingSessionStatusEnum
  $optional: true
  $related:
    $name: CoachingSessionStatusEnum
    $module: coaching
    $kind: enum
    $step: module
```

---

### 5️⃣ Conseils pour créer des enums/types

1. **Analyser l’API et la base de données** :

   * Identifier tous les champs qui ont un nombre limité de valeurs (enum) ou des objets complexes (type).
   * Les réponses d’API (`$schema`) et les payloads sont les sources principales.
2. **Regrouper par module ou feature** :

   * Les enums globales vont au niveau module.
   * Les types ou enums spécifiques vont dans la feature correspondante.
3. **Réutilisation** :

   * Si un type ou enum est utilisé dans plusieurs endpoints, le créer une seule fois et référencer via `$related`.
4. **Évolution** :

   * Ajouter les nouveaux attributs ou valeurs enum nécessite une **revue des endpoints** pour vérifier cohérence et compatibilité.

---

### 6️⃣ Exemple concret

**Payload de création de session**

```yaml
- $name: CreateCoachingSessionPayload
  $attributes:
    - $name: coach_id
      $type: string
    - $name: session_type
      $type: CoachingSessionTypeEnum
      $related:
        $name: "CoachingSessionTypeEnum"
        $module: "coaching"
        $kind: "enum"
        $step: "module"
    - $name: participants_count
      $type: number
      $optional: true
```

**Réponse**

```yaml
- $name: CoachingSessionDetailResponse
  $attributes:
    - $name: data
      $type: CoachingSession
      $related:
        $name: "CoachingSession"
        $module: "coaching"
        $feature: "coaching_session"
        $kind: "custom"
        $step: "feature"
```

---

En résumé, la gestion des `$types` et `$enums` repose sur une **analyse rigoureuse de l’API**, une **organisation par module/feature**, et l’utilisation cohérente de `$related`, `$optional` et `$nullable`. Cela assure une base solide pour générer les interfaces TypeScript, les payloads et les validations côté front comme back.

---

Parfait ! Je vais te rédiger une **section README complète** pour la gestion des usecases, avec **un exemple concret et intégral** basé sur `cancelCoachingSession.yml`. Je vais respecter **path/query/body**, `$params`, `$returnType`, `$imports`, `$implementationInDataSource`, et tous les détails que tu as précisés.

---

## Structure générale – Gestion des Usecases

Chaque usecase correspond à la gestion d’un endpoint spécifique. Son rôle est de définir **la logique métier côté application**, en s’appuyant sur les types et enums définis dans le module ou la feature.

### 1. Commentaire et métadonnées

En haut du fichier YAML, un **commentaire standard** indique le nom du usecase et la méthode HTTP associée :

```yaml
# --------------------------------------------------------------
# cancelCoachingSession - POST
# --------------------------------------------------------------
```

* Obligatoire pour la **documentation et l’indexation automatique**.
* Doit être précis et refléter exactement le `$name` du usecase.

### 2. Champs principaux du usecase

```yaml
$name: cancelCoachingSession
$description: "Annule une session coaching"
$skip: false
$async: true
```

* `$name` : identique au nom du fichier YAML.
* `$description` : explique le rôle du usecase.
* `$skip` : toujours `false` par défaut.
* `$async` : toujours `true` pour tous les appels API.

- Toujours false pour ``$skip`` par défaut ; le usecase doit être actif dès sa création.
- ``$async: true`` est systématique, car toutes les interactions avec l’API sont asynchrones.
⚠️ Ne jamais mettre ``$async: false``, même pour des endpoints simples : ça casserait la cohérence du flux de gestion des erreurs et des appels réseau.

### 3. Paramètres

```yaml
$params:
  - $name: sessionId
    $type: string
    $optional: false
  - $name: payload
    $type: CancelSessionPayload
    $related: "--module coaching --feature coaching_session --kind custom --step feature"
    $optional: false
```

* Inclut **path, query et body** sans distinction.
* `$type` : type ou enum existant dans la feature ou le module.
* `$related` : chaîne obligatoire pour indiquer `module`, `feature`, `kind`, et `step`.

⚠️ Attention : la syntaxe de `$related` dans `$params` est **différente** de celle dans `$returnType` et `$imports`.

### 4. Type de retour

```yaml
$returnDescription: "Session annulée"
$returnType:
  $type: CoachingSessionDetailResponse
  $nullable: true
  $related:
    - $name: CoachingSessionDetailResponse
      $module: coaching
      $feature: coaching_session
      $kind: custom
      $step: feature
```

* Créer un type pour tout objet complexe retourné.
* `$nullable: true` : permet de gérer les erreurs ou absences de data côté frontend.
* `$related` : référence correcte au module/feature.

On référence ici le type de retour tel qu’il est défini dans la feature ou module, mais en format array of objects ou type simple, jamais en string.
- ``$related`` inline comme pour ``$params``.
- ``$nullable: true`` indispensable : même si le endpoint réussit normalement, il peut retourner null en cas d’erreur ou absence de data. Cela sécurise la gestion côté frontend.
- ``$returnDescription`` : explicite et clair pour le dev.

⚠️ Règle importante : toujours créer un type applicatif pour le retour si le endpoint retourne un objet complexe (ici CoachingSessionDetailResponse), et toujours le référencer.

### 5. Imports

```yaml
$imports:
  - $name: CancelSessionPayload
    $from: "--module coaching --feature coaching_session --kind custom --step feature"
    $step: feature
  - $name: CoachingSessionDetailResponse
    $from: "--module coaching --feature coaching_session --kind custom --step feature"
    $step: feature
```

* Obligatoire pour tout type ou enum référencé dans `$params` ou `$returnType`.
* `$from` doit refléter **exactement** le module et la feature.
* `$step` : peut etre de valeur `feature` ou `module`.
* C'est pareil si on utilisait une enum dans le usecase.

⚠️ Erreur fréquente : oublier ``$imports`` ou mal référencer ``$from``, ce qui bloque la génération de code et l’import dans le controller.

### 6. Implémentation dans le DataSource

```yaml
$rewriteInController: true
$rewriteInDataSourceImpl: true
$implementationInDataSource:
  $type: api
  $client: fetch
  $endpoint: COACHING.CANCEL_COACHING_SESSION
  $mapping:
    $path:
      session_id: sessionId
    $body:
      reason: payload.reason
      source: payload.source
  $responseMapping:
    $returnValue: data
```

* `$type: api` → interaction avec un endpoint.
* `$client: fetch` → client réseau.
* `$endpoint` → référence complète au module et à l’endpoint.
* `$mapping` → lie tous les paramètres du usecase aux paramètres path/query/body du endpoint.
> - On mappe tous les paramètres de l’endpoint (path, body, query) vers les **``$params``** du usecase.
Ici, **session_id** vient de **sessionId** et le body **reason** et **source** viennent de **payload**.
Si le endpoint ajoutait d’autres params query ou path, il faudrait les mapper ici.
* `$responseMapping` → récupère la partie `data` pour la transformer en type attendu.

⚠️ Erreur fréquente : oublier de mapper path/body ou mal mapper les noms → runtime crash.

---

## Exemple complet – `cancelCoachingSession.yml`

```yaml
# --------------------------------------------------------------
# cancelCoachingSession - POST
# --------------------------------------------------------------

$name: cancelCoachingSession
$description: "Annule une session coaching"
$skip: false
$async: true

$params:
  - $name: sessionId
    $type: string
    $optional: false
  - $name: payload
    $type: CancelSessionPayload
    $related: "--module coaching --feature coaching_session --kind custom --step feature"
    $optional: false

$returnDescription: "Session annulée"
$returnType:
  $type: CoachingSessionDetailResponse
  $nullable: true
  $related:
    - $name: CoachingSessionDetailResponse
      $module: coaching
      $feature: coaching_session
      $kind: custom
      $step: feature

$rewriteInController: true
$rewriteInDataSourceImpl: true
$implementationInDataSource:
  $type: api
  $client: fetch
  $endpoint: COACHING.CANCEL_COACHING_SESSION
  $mapping:
    $path:
      session_id: sessionId
    $body:
      reason: payload.reason
      source: payload.source
  $responseMapping:
    $returnValue: data

$imports:
  - $name: CancelSessionPayload
    $from: "--module coaching --feature coaching_session --kind custom --step feature"
    $step: feature
  - $name: CoachingSessionDetailResponse
    $from: "--module coaching --feature coaching_session --kind custom --step feature"
    $step: feature

```

---

## Bonnes pratiques

1. Toujours inclure **path, query et body** dans `$params`.
2. `$returnType` : créer un type pour tout objet complexe et ajouter `$nullable: true`.
3. `$imports` : obligatoire pour tout type ou enum utilisé.
4. `$implementationInDataSource` : mapper correctement path/query/body vers `$params`.
5. `$skip: false` et `$async: true` par défaut.
6. Ajouter le **commentaire de tête** pour documentation.
7. Respecter la différence de syntaxe `$related` entre `$params`, `$imports` et `$returnType`.

---

💡 **Résumé :**
Le usecase standardise la **gestion des paramètres**, des **types applicatifs**, du **mapping vers les endpoints**, et du **retour des données**. Cette structure garantit **cohérence, maintenabilité et robustesse** pour tout module/feature.

---