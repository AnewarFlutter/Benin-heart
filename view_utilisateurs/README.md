# Next.js Clean Starter

Un **starter Next.js** prêt à l’emploi avec **TypeScript**, **TailwindCSS**, **App Router**, **Turbopack**, et une architecture **Clean Architecture** organisée par fonctionnalités. Conçu pour faciliter le développement maintenable et scalable d’applications web modernes.

---

## 🚀 Installation du projet

### Option 1 : Créer le projet depuis zéro

1. Créer une nouvelle application Next.js :

```bash
npx create-next-app@latest
```

2. Lors de l’installation, choisissez les options suivantes :

| Question           | Réponse recommandée | Pourquoi                             |
| ------------------ | ------------------- | ------------------------------------ |
| Nom du projet      | my-app              | Nom de votre projet                  |
| TypeScript ?       | Yes                 | Typage statique et auto-complétion   |
| Linter ?           | ESLint              | Qualité et cohérence du code         |
| TailwindCSS ?      | Yes                 | Styling rapide et modulable          |
| Code dans `src/` ? | Yes                 | Organisation du code source          |
| App Router ?       | Yes                 | Recommandé pour Next.js moderne      |
| Turbopack ?        | Yes                 | Build rapide et développement fluide |
| Import alias ?     | Yes (`@/*`)         | Simplifie les imports                |

3. Installer les dépendances supplémentaires :

```bash
npm install zod zustand next-intl axios
```

* **Zod** : validation de données ([https://zod.dev](https://zod.dev))
* **Zustand** : gestion d’état globale ([https://zustand-demo.pmnd.rs](https://zustand-demo.pmnd.rs))
* **next-intl** : internationalisation ([https://next-intl-docs](https://next-intl-docs))
* **axios** : gestion des requêtes HTTP depuis les navigateurs (via XMLHttpRequest) et les serveurs Node.js ([https://axios-http.com](https://axios-http.com))

---

### Option 2 : Cloner le starter

1. Cloner le projet :

```bash
git clone <URL_DE_VOTRE_REPO>
cd <NOM_DU_PROJET>
```

2. Installer toutes les dépendances :

```bash
npm install
```

> Cette option est beaucoup plus rapide car tout est déjà configuré.

---

## 🏗 Arborescence du projet

```
├── .next/ 🚫 (auto-hidden)
├── messages/         # Traductions (ex. en.json, fr.json)
├── node_modules/ 🚫
├── public/
│   ├── fonts/
│   ├── images/
│   └── icônes, svg, etc.
├── src/
│   ├── actions/      # Actions métier par modules et fonctionnalités
│   ├── adapters/     # Controllers pour interagir avec le domaine (par modules et fonctionnalités aussi)
│   ├── app/          # Pages et layout, organisés par [locale]
│   ├── di/           # Injections de dépendances
│   ├── modules/      # Modules
│   ├── ├── [module]/     # Un module précis
│   ├── ├── ├── [features]/ # Fonctionnalités du module avec domain / data
│   ├── i18n/         # Configuration next-intl
│   ├── stores/       # Gestionnaires d’état global
│   ├── shared/       # Code réutilisable (constants, hooks, types, utils)
│   ├── lib/          # Librairies internes non-React
│   ├── tests/        # Tests unitaires et d’intégration
│   └── utils/        # Fonctions utilitaires spécifiques
├── .env.local 🚫      # Variables d’environnement
├── middleware.ts     # Middleware global
├── next.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 💡 Pourquoi cette architecture ?

* **Maintenabilité** : code clair et facile à comprendre
* **Scalabilité** : ajouter des fonctionnalités sans casser l’existant
* **Testabilité** : chaque couche peut être testée indépendamment
* **Réutilisabilité** : composants, hooks et utils partagés

---

## ⚡ Scripts utiles

* Vérifier le code avant push :

```bash
npm run check
# Défini comme "next build && tsc --noEmit"
```

* Développement :

```bash
npm run dev
```

* Build production :

```bash
npm run build
```

* Lint :

```bash
npm run lint
```

---

## ✅ Prochaines étapes

1. Configurer vos **variables d’environnement** dans `.env.local`.
2. Vérifier le projet :

```bash
npm run check
```

3. Démarrer le serveur de développement :

```bash
npm run dev
```

4. Commencer à développer vos fonctionnalités dans `src/features`.

-----

## 🧩 Modules

Chaque module ici représente un bloc qui comprendra plusieurs fonctionnalités.  
C'est un découpage modulaire afin de mieux gérer l'application globale.

-----

## 🏷 Features

Chaque **feature** suit une structure type **Clean Architecture**, avec séparation claire entre la **logique métier** (`domain`) et les **implémentations techniques** (`data`). Les **controllers** dans le dossier `adapters` servent d’interface entre l’application et la feature, et les **actions** dans `actions` permettent d’exposer la logique côté serveur ou UI.

### Exemple : Feature User dans un module `auth`

#### Arborescence

```
├── 📁 auth/user/
│   ├── 📁 data/
│   │   ├── 📁 datasources/
│   │   │   ├── appwrite_user_data_source_impl.ts
│   │   │   ├── firebase_user_data_source_impl.ts
│   │   │   ├── mongodb_user_data_source_impl.ts
│   │   │   ├── rest_api_user_data_source_impl.ts
│   │   │   ├── supabase_user_data_source_impl.ts
│   │   │   └── user_data_source.ts
│   │   ├── 📁 models/
│   │   │   └── model_user.ts
│   │   └── 📁 repositories/
│   │       └── user_repository_impl.ts
│   ├── 📁 domain/
│   │   ├── 📁 entities/
│   │   │   └── entity_user.ts
│   │   ├── 📁 enums/
│   │   │   └── user_enums.ts
│   │   ├── 📁 repositories/
│   │   │   └── user_repository.ts
│   │   └── 📁 usecases/
│   │       ├── get_user_by_id_usecase.ts
│   │       └── update_user_usecase.ts
│   └── 📝 USER_README.md
```

---

### 📄 Adapters : UserController

Le **controller** sert d’interface entre l’application et la feature. Il expose les méthodes pour interagir avec les **usecases**.

```ts
import { GetUserByIdUseCase } from "@/modules/auth/user/domain/usecases/get_user_by_id_usecase";
import { UpdateUserUseCase } from "@/modules/auth/user/domain/usecases/update_user_usecase";
import { EntityUser } from "@/modules/auth/user/domain/entities/entity_user";

export class UserController {
    constructor(
        private readonly getUserByIdUseCase: GetUserByIdUseCase,
        private readonly updateUserUseCase: UpdateUserUseCase,
    ) {}

    getUserById = async (id: string) => {
        try {
            return await this.getUserByIdUseCase.execute(id);
        } catch (e) {
            console.log(`Error while getting user by id: ${e}`);
            return null;
        }
    }

    updateUser = async (user: EntityUser) => {
        try {
            return await this.updateUserUseCase.execute(user);
        } catch (e) {
            console.log(`Error while updating user: ${e}`);
            return null;
        }
    }
}
```

---

### 🧩 Dependency Injection

Toutes les dépendances sont déclarées **une seule fois** dans `features_di.ts` : datasources, repositories, usecases et controllers.

```ts
import { UserController } from "@/adapters/auth/user/user_controller";
import { SupabaseUserDataSourceImpl } from "@/modules/auth/user/data/datasources/supabase_user_data_source_impl";
import { UserRepositoryImpl } from "@/modules/auth/user/data/repositories/user_repository_impl";
import { GetUserByIdUseCase } from "@/modules/auth/user/domain/usecases/get_user_by_id_usecase";
import { UpdateUserUseCase } from "@/modules/auth/user/domain/usecases/update_user_usecase";

// Setup de la feature User
const userDataSource = new SupabaseUserDataSourceImpl();
const userRepository = new UserRepositoryImpl(userDataSource);

const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
const updateUserUseCase = new UpdateUserUseCase(userRepository);

const userController = new UserController(getUserByIdUseCase, updateUserUseCase);

// Export de tous les controllers des features
export const featuresDi = {
    userController,
};
```

> Cette approche permet de centraliser les dépendances et de les partager facilement dans toute l’application.

---

### ⚡ Actions côté serveur / UI

Dans `actions/user/actions.ts`, on expose les méthodes pour interagir avec le **controller** et renvoyer un **ActionResult**.

```ts
"use server";
import { featuresDi } from "@/di/features_di";
import { EntityUser } from "@/modules/auth/user/domain/entities/entity_user";
import { AppActionResult } from "@/shared/types/global";

export async function getUserByIdAction(id: string): Promise<AppActionResult<EntityUser | null>> {
    const user = await featuresDi.userController.getUserById(id);
    if (!user) return { success: false, message: "Error while getting user by id.", data: null };
    return { success: true, message: "User has been fetched.", data: user };
}

export async function updateUserAction(user: EntityUser): Promise<AppActionResult<EntityUser | null>> {
    const updatedUser = await featuresDi.userController.updateUser(user);
    if (!updatedUser) return { success: false, message: "Error while updating user.", data: null };
    return { success: true, message: "User has been updated.", data: updatedUser };
}
```

**Note** : Converion de nommage des fonctions dans les fichiers `actions.ts` : il faut toujours mettre le suffix `Action`.
``
Exemple : updateUserAction, getUserByIdAction
``

---

✅ **Résumé** :

1. Chaque **feature** a sa structure `data` / `domain`.
2. Les **controllers** dans `adapters` gèrent les interactions avec les usecases.
3. Le fichier **features\_di.ts** centralise toutes les dépendances.
4. Le dossier **actions** expose des méthodes utilisables côté serveur ou UI.

---

### 📝 Note importante : README par feature

Chaque feature doit **avoir son propre README.md** dans son dossier racine.

Exemple pour la feature `user` :

```
features/user/USER_README.md
```

Ce README interne permet de :

* Décrire la **structure de la feature** (data, domain, usecases, etc.)
* Expliquer le rôle des **datasources, repositories et controllers**
* Documenter les **actions disponibles**
* Fournir des **instructions spécifiques** ou notes pour les développeurs utilisant cette feature

> Cela facilite grandement la compréhension et la maintenance, surtout lorsque plusieurs développeurs travaillent sur le projet.

---
Parfait 🙌 tu veux une section **documentation pratique des commandes** à mettre dans ton README.
Voici une proposition bien structurée, prête à copier-coller :

---

## ⚙️ CLI – Gestion des Modules & Features

Ces scripts facilitent la création, l’évolution et la suppression des **modules**, **features** et **usecases** dans le projet.
Ils respectent l’architecture `modules/<module>/features/<feature>` avec séparation en `domain`, `data`, `adapters`, `actions`.

**Ajoutez ou completer cette ligne dans le fichier `package.json`
    `> "type": "module"`**

---

### 🚀 1. Créer un module avec une ou plusieurs features

```bash
node feature_module_creator_script.js <moduleName> <featureName1> [<featureName2> ...]
```
* Remplacez `<featureName>` par le nom de votre feature (ex : `user`, `donation`, etc.).
* Il peut prendre plusieurs `<featureName>`.
* Le script va automatiquement créer l’arborescence correspondante dans :

```
src/modules/<moduleName>/<featureName>/
src/actions/<moduleName>/<featureName>/
src/adapters/<moduleName>/<featureName>/
```

**Exemple :**

```bash
node feature_module_creator_script.js blog user post comment
```

➡️ Crée le module `blog` avec les features `user`, `post`, `comment`.

### Étapes suivantes

Une fois la génération terminée :

1. Complétez le contenu des fichiers générés dans chaque dossier.
2. Ajoutez un `README.md` dans la feature pour documenter sa logique, son domaine et ses particularités.
3. Branchez la feature avec les stores ou actions globales si nécessaire.

⚠️ **Attention :** le script doit impérativement être exécuté depuis la racine du projet.

---

### 🧩 2. Ajouter un nouveau UseCase à une feature existante

```bash
# Usecase simple synchrone sans paramètre et sans type de retour(void)
node module_feature_usecase_creator_script.js <moduleName> <featureName> <usecaseName>
ou
node module_feature_usecase_creator_script.js <moduleName> <featureName> <usecaseName> "" "void"
# Exemple : node module_feature_usecase_creator_script.js magasin panier GetPanierTotal

# Usecase asynchrone avec paramètre
node module_feature_usecase_creator_script.js <moduleName> <featureName> <usecaseName> [params] [returnType] [async]
# Exemple : node module_feature_usecase_creator_script.js magasin panier GetPanierTotal "panierId:string" "number" async

# Usecase synchrone(non-asynchrone) avec paramètre
node module_feature_usecase_creator_script.js <moduleName> <featureName> <usecaseName> [params] [returnType]
# Exemple : node module_feature_usecase_creator_script.js magasin panier GetPanierTotal "panierId:string" "number"

# Usecase lié à une autre feature
node module_feature_usecase_creator_script.js <moduleName> <featureName> <usecaseName> [params] [returnType] [async] [--related feature]
# Exemple : node module_feature_usecase_creator_script.js magasin panier GetUserByPanierId "panierId:string,userId:string" "EntityUser | null" async --related user
```

**Exemple habitutel :**

```bash
node module_feature_usecase_creator_script.js blog post GetPostsByUser "user:EntityUser" "EntityPost[]" async --related user
```

➡️ Ajoute un usecase `GetPostsByUser` dans la feature `post` du module `blog`, avec paramètre `user:EntityUser`, retourne `EntityPost[]`, en mode `async`.
L’option `--related user` indique que le usecase dépend aussi de la feature `user`.


### 🧩 Paramètres de la commande

| Argument      | Description                                                          |
| ------------- | -------------------------------------------------------------------- |
| `moduleName`  | Nom du module.                    |
| `featureName` | Nom de la feature dans laquelle créer le usecase.                    |
| `usecaseName` | Nom du usecase (CamelCase).                                          |
| `params`      | Liste des paramètres séparés par des virgules, au format `nom:type`. |
| `returnType`  | Type de retour attendu (`void` par défaut).                          |
| `async`       | Si le usecase est asynchrone, ajouter `async`.                       |
| `--related`   | Si le usecase utilise des entités d’une autre feature.               |

### 🧩 Ce que la commande fait

La commande génère ou modifie automatiquement :

1. **Le fichier du UseCase** dans `src/modules/<module>/<feature>/domain/usecases/`.
2. **Le repository** (`<feature>_repository.ts`) avec la signature du usecase.
3. **Le datasource** et **datasource impl** avec la signature correspondante (méthode `throw new Error("Method not implemented.")`).
4. **Le repository impl** (`<feature>_repository_impl.ts`) avec un bloc `TODO` pour implémenter le retour correct.
5. **Le controller** (`<feature>_controller.ts`) avec :

   * L’import du usecase
   * Ajout dans le constructeur
   * Création d’une méthode fléchée pour appeler le usecase
   * Les imports nécessaires pour les entités utilisées dans la signature du usecase
6. **Le fichier DI** (`features_di.ts`) avec :

   * Import du usecase
   * Instanciation du usecase
   * Injection dans le controller correspondant

> ⚠️ **Important** : Le code généré pour le repository impl contient un **TODO** pour le retour. Le développeur doit remplir la logique en fonction de son action et de ce que le usecase doit retourner (mappage d’entités, liste, ou données brutes).

### 🧩 Actions manuelles à faire

* Implémenter la logique dans le **repository impl** pour que le usecase fonctionne correctement.
* Adapter le **controller** si nécessaire pour gérer le format exact de retour ou les exceptions.
* Ajouter ou modifier les vues et actions qui appelleront ce usecase.
* Vérifier les imports si tu utilises des entités d’une feature liée (`--related`).

### 🧩 Bonnes pratiques

* Toujours vérifier que le nom du usecase suit le **CamelCase**.
* Ne pas oublier d’ajouter les **paramètres et le type de retour** corrects.
* Les imports et DI sont générés automatiquement, mais si tu crées des entités spécifiques, vérifie qu’elles sont bien importées.
* Documenter le usecase dans son fichier pour décrire son rôle et son comportement.

---

## 📑 Gestion des Modules & Features via Fichier de Configuration

En plus des commandes CLI, il est possible de gérer la création des **modules**, **features** et **usecases** à partir d’un fichier de configuration centralisé.
Cela permet une **vision globale** du projet et une **génération automatique** de toute l’architecture.

---

### 📝 Format du fichier de configuration

Le fichier de configuration est au format **YAML**.
Il doit définir une liste de `modules`, chacun avec ses `features` et les `usecases` associés.

**Exemple :**

```yaml
modules:
  - name: blog
    features:
      - name: post
        usecases:
          - name: GetPostsByUser
            params: "user:EntityUser"
            returnType: "EntityPost[]"
            async: true
            related: user
      - name: comment
        usecases: []
```

---

### 🚀 Exemple de module inédit : Event

```yaml
modules:
  - name: event
    features:
      - name: event
        usecases:
          - name: CreateEvent
            params: "title:string,date:Date,location:string"
            returnType: "EntityEvent"
            async: true
          - name: GetEvents
            params: ""
            returnType: "EntityEvent[]"
            async: true
      - name: ticket
        usecases:
          - name: BuyTicket
            params: "eventId:string,userId:string"
            returnType: "EntityTicket"
            async: true
            related: event
      - name: attendee
        usecases:
          - name: RegisterAttendee
            params: "eventId:string,userId:string"
            returnType: "EntityAttendee"
            async: true
            related: event
```

---

### 🛒 Exemple de module e-commerce : Shop

```yaml
modules:
  - name: shop
    features:
      - name: catalog
        usecases:
          - name: GetProducts
            params: ""
            returnType: "EntityProduct[]"
            async: true
          - name: CreateProduct
            params: "name:string,price:number,stock:number"
            returnType: "EntityProduct"
            async: true
      - name: cart
        usecases:
          - name: AddToCart
            params: "userId:string,productId:string,quantity:number"
            returnType: "EntityCart"
            async: true
            related: catalog
          - name: GetCart
            params: "userId:string"
            returnType: "EntityCart | null"
            async: true
      - name: order
        usecases:
          - name: CreateOrder
            params: "userId:string,cartId:string"
            returnType: "EntityOrder"
            async: true
            related: cart
          - name: CancelOrder
            params: "orderId:string"
            returnType: "boolean"
            async: true
```

---

### ⚙️ Utilisation du script orchestrateur

Un script `orchestrator.js` est fourni pour **lire la configuration** et exécuter automatiquement les scripts de génération correspondants :

```bash
node orchestrator.js project_config.yml
```

➡️ Le script va :

1. Créer tous les modules et leurs features.
2. Ajouter automatiquement tous les usecases dans chaque feature.
3. Mettre à jour les fichiers `repositories`, `datasources`, `controllers` et `features_di.ts`.

---

### 📂 Découpage en plusieurs fichiers

Si votre configuration devient trop volumineuse, vous pouvez créer **un fichier de configuration par module**.
Par exemple :

```
modules_configs/
  event_config.yml
  shop_config.yml
```

Ensuite, exécuter :

```bash
node orchestrator.js modules_configs/event_config.yml
node orchestrator.js modules_configs/shop_config.yml
```

---

### ✅ Bonnes pratiques

* Centralisez vos usecases dans la config pour garder une **vision claire** du projet.
* Découpez vos fichiers de config par **module** si la taille devient importante.
* Committez vos fichiers de config (`modules_configs/*.yml`) pour partager l’état du projet avec toute l’équipe.
* Ajoutez toujours un `README.md` par feature générée pour documenter sa logique.

---

### 🗑️ 3. Supprimer une ou plusieurs features d’un module existant

Le projet inclut un script pour **supprimer complètement une feature**, y compris ses dossiers liés et son DI.

**Emplacement du script** : , un script est disponible à la racine du projet : `feature_module_remover_script.js`


```bash
node feature_module_remover_script.js <moduleName> <featureName1> <featureName2> ...
```

**Exemple :**

```bash
node feature_module_remover_script.js blog comment
```

### Emplacements supprimés

Lorsqu’une feature est supprimée, les dossiers suivants sont supprimés automatiquement :

```
src/modules/<module>/<featureName>/
src/actions/<module>/<featureName>/
src/adapters/<module>/<featureName>/
```

➡️ Supprime la feature `comment` du module `blog` et nettoie les références dans `features_di.ts`.


> ⚠️ **Attention :** Cette opération est irréversible. Assurez-vous de bien vouloir supprimer ces fonctionnalités avant d’exécuter le script.

---

### 💣 4. Supprimer un module entier (toutes ses features)

```bash
node module_remover_script.js <moduleName>
```

**Exemple :**

```bash
node module_remover_script.js blog
```

➡️ Supprime complètement le module `blog` (dossiers `modules/blog`, `actions/blog`, `adapters/blog`) et toutes ses références dans `features_di.ts`.


> ⚠️ **Attention :** Cette opération est irréversible. Assurez-vous de bien vouloir supprimer ces fonctionnalités avant d’exécuter le script.

---

## ✅ Bonnes pratiques

* Toujours **commiter** votre code avant d’exécuter un script de suppression.
* Les imports dans `features_di.ts` sont automatiquement nettoyés.
* En cas de doute, ajouter une option `--dry-run` (à implémenter) pour prévisualiser ce qui sera supprimé.

---

# 🌍 Documentation des variables d’environnement

Toutes les variables d’environnement utilisées dans le projet doivent être regroupées dans **APP\_CONFIG** (`src/shared/constants/app_config.ts`) sous forme de **blocs logiques**.
Cela facilite :

* ✅ La lisibilité
* ✅ La maintenance
* ✅ L’extension du projet (ajout d’un nouveau service, API, etc.)

---

## ⚙️ Configuration des variables d’environnement

Toutes les variables nécessaires au projet sont centralisées dans le fichier :

```

📁 root
└── .env.local.example

```

### 🔹 Étapes d’installation

1. **Dupliquez** le fichier `env.local.example` :
```bash
   cp env.local.example .env.local
```

2. **Supprimez** l’extension `.example` et renommer le fichier en `.env.local` → le projet utilisera automatiquement `.env.local`.
3. **Modifiez** les valeurs selon votre environnement (développement, staging, production, etc.).

---

### 🔹 Exemple de contenu

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_APP_NAME=NextJS Clean Template
NEXT_PUBLIC_DEFAULT_LOCALE=fr
NEXT_PUBLIC_SUPPORTED_LOCALES=fr,en
NEXT_PUBLIC_IMAGE_PLACEHOLDER=https://via.placeholder.com/150
```

> 💡 **Astuce** :
>
> * Les clés commençant par `NEXT_PUBLIC_` sont accessibles côté client (navigateur).
> * Les autres variables restent privées côté serveur uniquement.

---

## 📌 Règles à respecter

1. **Toujours utiliser le préfixe `NEXT_PUBLIC_`** pour les variables accessibles côté client.
   Exemple : `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SUPABASE_URL`
2. **Regrouper les variables par bloc** selon leur usage :

   * `API` → endpoints, timeouts
   * `AUTH` → clés d’authentification, secrets (⚠️ côté serveur uniquement si sensible)
   * `STORAGE` → buckets, URLs de fichiers
   * `THIRD_PARTY` → intégrations externes (Firebase, Supabase, Stripe, etc.)
3. **Toujours définir une valeur par défaut** pour éviter les crashs en dev.

---

## 📁 Exemple de structuration

📄 `src/shared/constants/app_config.ts`

```ts
export const APP_CONFIG = {
    APP_NAME: "NextJS Clean Template",

    COOKIES_KEYS: {
        accessToken: "accessToken",
        refreshToken: "refreshToken",
    },

    DEFAULT_LOCALE: "fr",
    SUPPORTED_LOCALES: ["fr", "en"],

    IMAGES_SETTINGS: {
        placeholder: "https://via.placeholder.com/150",
        mainThumbnail: {
        unit: "px",
        width: 150,
        height: 150,
        formatsAllowed: ["jpeg", "png", "jpg"],
        defaultFormat: "jpeg",
        },
    },

    /**
     * 🌐 API
     */
    API: {
        baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
        timeout: 10000, // ms
    },

    /**
     * 🔑 Auth
     */
    AUTH: {
        jwtSecret: process.env.JWT_SECRET || "default_secret", // côté serveur uniquement
        googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    },

    /**
     * 💾 Storage
     */
    STORAGE: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        firebaseBucket: process.env.NEXT_PUBLIC_FIREBASE_BUCKET,
    },

    /**
     * 🛠️ Services tiers
    */
    THIRD_PARTY: {
        stripeKey: process.env.NEXT_PUBLIC_STRIPE_KEY,
        sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    },
};
```

---

## 🚀 Exemple d’utilisation

```ts
import { APP_CONFIG } from "@/shared/constants/app_config";

// Appel API
fetch(`${APP_CONFIG.API.baseUrl}/users`, { timeout: APP_CONFIG.API.timeout });

// Connexion à Supabase
const supabase = createClient(
    APP_CONFIG.STORAGE.supabaseUrl!,
    APP_CONFIG.STORAGE.supabaseAnonKey!
);

// Tracking Sentry
Sentry.init({ dsn: APP_CONFIG.THIRD_PARTY.sentryDsn });
```

---

## ✨ Bonnes pratiques

* 📌 Créer un **bloc par nouveau service** (ex: `PAYMENTS`, `NOTIFICATIONS`).
* 📌 Ne pas mélanger les variables → chaque bloc a une **responsabilité claire**.
* 📌 Documenter chaque bloc en commentaire pour que le prochain dev sache à quoi il sert.
* 📌 **Ne pas** commiter vos fichiers `.env.local` : ils doivent rester dans le `.gitignore`.
* 📌 Mettez toujours à jour `.env.local.example` en meme temps que `.env.local` si vous ajoutez une nouvelle variable → cela sert de documentation pour toute l’équipe.

---

# 🌐 API Helper

La feature **API Helper** fournit un **client centralisé** pour tous les appels réseau dans le projet.
Elle encapsule la logique de `fetch`, la gestion des **headers**, des **erreurs**, du **timeout**, des **retry**, et permet d’ajouter des **intercepteurs globaux** pour le logging ou le refresh token.

---

## 📌 Pourquoi utiliser l’API Helper ?

* Centralise tous les appels API → plus besoin de répéter `fetch` ou `axios`.
* Gère automatiquement :

  * Les headers (`Content-Type`, `Authorization`)
  * Les erreurs et status codes
  * Les timeout et retry
* Compatible côté client et serveur (Next.js).
* Intercepteurs disponibles pour log, refresh token, alerting.

---

## 📁 Où se trouve le helper ?

`src/lib/api/api_client.ts`

---

## ⚡ Exemple d’utilisation simple

```ts
import { apiClient } from "@/lib/api/api_client.ts";

// Récupérer tous les utilisateurs
const { data, error } = await apiClient<User[]>("/users", {
    method: "GET",
});

if (error) console.error("Erreur :", error);
else console.log("Users :", data);
```

---

## 🔨 POST / Envoi de données

```ts
const { data, error } = await apiClient<User>("/users", {
    method: "POST",
    body: { name: "John Doe", email: "john@example.com" },
});

if (error) console.error("Erreur :", error);
else console.log("Utilisateur créé :", data);
```

---

## 🔑 Avec Token

```ts
const { data, error } = await apiClient<User>("/profile", {
    method: "GET",
    token: myAccessToken,
});
```

---

## ⏱️ Retry & Timeout

```ts
const { data, error } = await apiClient<User[]>("/users", {
  method: "GET",
  retries: 2,     // nombre de tentatives si échec
  timeout: 5000,  // temps max en ms
});
```

Nous avons mis en place un `apiClient` générique qui simplifie les appels API dans le projet.  
Par défaut, il utilise **axios**, mais il est possible de **forcer fetch (ou un autre moteur)** soit globalement, soit seulement pour un appel spécifique.

---

🔹 **a - Appel simple (axios par défaut)**
```ts
import { apiClient } from "@/shared/lib/api/api_client";
import { API_ROUTES } from "@/shared/lib/api/api_routes";

async getUserById(id: string): Promise<ModelUser | null> {
    try {
        const { data, error } = await apiClient<Record<string, unknown>>(API_ROUTES.MOCK_USER.GET_BY_ID(id), {
            method: "GET",
        });

        if (error) {
            console.error("Error fetching user:", error);
            return null;
        }
        
        return data ? ModelUser.fromJson(data) : null;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}
```

🔹 **b. Forcer fetch uniquement pour un appel**
```ts
import { apiClient } from "@/shared/lib/api/api_client";
import { FetchHttpClient } from "@/shared/lib/api/fetch_http_client";
import { API_ROUTES } from "@/shared/lib/api/api_routes";

async function getUserWithAxios(id: string) {
    try {
        const { data, error } = await apiClient<Record<string, unknown>>(API_ROUTES.MOCK_USER.GET_BY_ID(id), {
            method: "GET",
            client: new FetchHttpClient(), // moteur forcé UNIQUEMENT ici
        });

        if (error) {
            console.error("Error fetching user:", error);
            return null;
        }
        
        return data ? ModelUser.fromJson(data) : null;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}
```

🔹 **c. Utiliser fetch globalement (optionnel)**
```ts
import { setDefaultHttpClient, apiClient } from "@/shared/lib/api/api_client";
import { AxiosHttpClient } from "@/shared/lib/api/fetch_http_client";

// Toute l’app utilisera fetch par défaut
setDefaultHttpClient(new FetchHttpClient());

async function getUser(id: string) {
  const res = await apiClient<User>(`/users/${id}`, { method: "GET" });
  return res.data;
}
```

🔹 **d. Options disponibles**
Lors d’un appel, vous pouvez passer les options suivantes :
| Option         | Type                                              | Description                                |
| -------------- | ------------------------------------------------- | ------------------------------------------ |
| `method`       | `"GET" \| "POST" \| "PUT" \| "PATCH" \| "DELETE"` | Méthode HTTP                               |
| `body`         | `any`                                             | Corps de la requête                        |
| `headers`      | `Record<string,string>`                           | Headers supplémentaires                    |
| `token`        | `string`                                          | Token d’authentification (Bearer)          |
| `timeout`      | `number`                                          | Timeout (ms)                               |
| `retries`      | `number`                                          | Nombre de tentatives en cas d’échec        |
| `responseType` | `"json" \| "text" \| "blob"`                      | Format de la réponse                       |
| `client`       | `ApiHttpClient`                                     | Pour forcer le moteur (fetch, axios, etc.) |


---

## ✅ Bonnes pratiques

* Toujours utiliser le helper → **jamais de fetch direct**.
* Utiliser `ApiResponse<T>` pour un retour uniforme.
* Appeler ce helper dans les fichiers `data_source_impl` de vos features.

---

# 🛣️ Routes API

Toutes les **routes API** du projet sont centralisées dans un seul fichier pour éviter de dupliquer ou d’écrire les URLs en dur dans les composants ou les usecases.

---

## 📁 Où se trouve le fichier ?

`src/shared/constants/api_routes.ts`

C’est le **point unique** pour définir et modifier tous les endpoints des différentes features.

---

## 📄 Exemple de définition de routes

```ts
// src/shared/constants/api_routes.ts

export const ROUTES = {
    // Users
    USERS: {
        BASE: "/users",
        GET_BY_ID: (id: string) => `/users/${id}`,
        UPDATE: (id: string) => `/users/${id}`,
        CREATE: "/users",
    },

    // Auth
    AUTH: {
        LOGIN: "/auth/login",
        LOGOUT: "/auth/logout",
        REFRESH: "/auth/refresh",
        VERIFY_OTP: "/auth/verify-otp",
    },

    // Products
    PRODUCTS: {
        BASE: "/products",
        GET_BY_ID: (id: string) => `/products/${id}`,
        SEARCH: "/products/search",
    },

    // MOCK USER API
    MOCK_USER: {
        BASE: "https://jsonplaceholder.typicode.com",
        GET_BY_ID: (id: string) => `${API_ROUTES.MOCK_USER.BASE}/users/${id}`,
    },
};
```

---

## 🚀 Exemple d’utilisation avec l’API Helper

```ts
import { apiClient } from "@/lib/api/api_client";
import { API_ROUTES } from "@/shared/constants/api_routes";

// Récupérer un utilisateur par ID
const { data, error } = await apiClient(API_ROUTES.USERS.GET_BY_ID("123"), {
   method: "GET",
});

if (error) console.error("Erreur :", error);
else console.log("Utilisateur :", data);

// Créer un nouvel utilisateur
const { data: newUser, error: createError } = await apiClient(API_ROUTES.USERS.CREATE, {
   method: "POST",
   body: { name: "John Doe", email: "john@example.com" },
});
```

---
## 🚀 Exemple concret avec la feature `user`

Dans le fichier `rest_api_user_data_source_impl.ts`, on donne un exemple concret avec le `getUserById` 

```ts
/**
 *  Gets a user by its id.
 *  @param id The id of the user to retrieve.
 *  @returns A Promise that resolves to the user with the given id, or null if the user does not exist.
 */
async getUserById(id: string): Promise<ModelUser | null> {
    try {

        const { data, error } = await apiClient<Record<string, unknown>>(API_ROUTES.MOCK_USER.GET_BY_ID(id), {
            method: "GET",
        });

        if (error) {
            console.error("Error fetching user:", error);
            return null;
        }
        
        return data ? ModelUser.fromJson(data) : null;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}
```

**Résultat :** Inspecter l´affichage sur la page d´acceuil dans le fichier `src/app/[locale]/page.tsx`

---

## ✨ Bonnes pratiques

1. **Toujours utiliser `API_ROUTES`** → ne jamais écrire l’URL en dur.
2. Utiliser les fonctions pour les routes dynamiques (`GET_BY_ID(id)`) → sécurité et lisibilité.
3. Centralisation → facilite le **refactoring**, les **tests**, et le **mocking**.
4. Combine toujours avec **API Helper** pour gérer headers, erreurs, timeout et retry.

---

# 📊 Gestion du statut de l’application

Le projet inclut une **gestion centralisée du statut de l’application** via l’enum `AppStatus` et la fonction `getAppStatusContent`.
Cette fonctionnalité permet de **contrôler le rendu de l’UI, redirections, messages ou composants bloquants** selon l’état actuel de l’application (maintenance, coming soon, read-only, etc.).

---

## 📁 Où se trouve la fonction ?

`src/shared/enums/app_status.ts`

---

## 📄 Enum `AppStatus`

```ts
export enum AppStatus {
    ONLINE = "online",          // L'application est pleinement opérationnelle
    MAINTENANCE = "maintenance",// Maintenance planifiée ou en cours
    COMING_SOON = "coming_soon",// Produit non encore lancé
    DOWN = "down",              // Application indisponible
    READ_ONLY = "read_only",    // En ligne mais sans écriture
    BETA = "beta",              // Version beta / test
    SUSPENDED = "suspended",    // Désactivée temporairement
    LAUNCHING = "launching",    // Soft launch / early access
}
```

---

## 📄 Fonction `getAppStatusContent`

```ts
import { AppStatus, getAppStatusContent } from "@/shared/enums/app_status";

const currentStatus = getAppStatusContent("fr");

console.log(currentStatus.title);       // Titre localisé
console.log(currentStatus.description); // Description localisée
console.log(currentStatus.isBlocking);  // true si le statut bloque l’app
console.log(currentStatus.image);       // Image associée au statut
```

**Explication :**

* Lit la variable d’environnement `NEXT_PUBLIC_APP_STATUS`.
* Convertit la valeur en `AppStatus`.
* Retourne les métadonnées localisées : titre, description, image, `isBlocking`.
* Défaut : `AppStatus.ONLINE` si `NEXT_PUBLIC_APP_STATUS` n’est pas défini.

---

## 🚀 Exemple d’utilisation dans un Layout ou Page Next.js

```tsx
const currentStatus = getAppStatusContent(locale);

return (
  <>
    {currentStatus.isBlocking ? (
      <AppStateComponent />  // Composant affiché si l'app est bloquée
    ) : (
      <>
        {/* Code */}
        {children}
        {/* Code */}
      </>
    )}
  </>
);
```

---

## 🔹 Bonnes pratiques pour les devs

1. **Vérifier le statut** dans le layout principal ou dans les pages importantes.
2. **Rediriger ou afficher un composant bloquant** si `isBlocking === true`.
3. **Ne jamais hardcoder** les statuts → utiliser `AppStatus` et `getAppStatusContent`.
4. Utiliser la **localisation** (`titleFr`, `titleEn`) pour les messages affichés aux utilisateurs.
5. Peut être combiné avec **API Helper** ou **middleware** pour gérer l’accès aux pages côté serveur si nécessaire.

---

## 🗂️ Gestion de l’état avec Zustand (persistance)

Nous utilisons **Zustand** pour gérer l’état global de l’application, avec la **persistance dans `localStorage`** via le middleware `persist`.  
Cela permet de **conserver les données entre les rechargements de page** (par exemple, l’utilisateur connecté).

---

### 🔹 Exemple : `src/stores/user_store.ts`

```ts
import { EntityUser } from '@/features/user/domain/entities/entity_user'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserState = {
    user: EntityUser | null
}

export type UserActions = {
    setUser: (user: EntityUser) => void
    setUserAction: (user: EntityUser) => void
}

export type UserStore = UserState & UserActions

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user: EntityUser) => set({ user }),
            setUserAction: (user: EntityUser) => set({ user }),
        }),
        {
            name: 'current-user', // ← clé utilisée dans localStorage
        }
    )
)
```

---

### 🔹 Utilisation dans un composant React/Next.js

```tsx
import { useUserStore } from '@/stores/user_store'

export default function Profile() {
    const { user, setUser } = useUserStore((state) => state)

    return (
        <div>
            <h2>Profil</h2>
            {user ? (
                <p>Bienvenue, {user.name}</p>
            ) : (
                <button onClick={setUser({ id: '1', firstname: 'Alice', email: 'monemail@email.com' })}>
                    Se connecter
                </button>
            )}
        </div>
    )
}
```

---

### 🔹 Pourquoi c’est important ?

* ✅ **Persistance** : les données (ex. utilisateur connecté) survivent aux refreshs de page.
* ✅ **Centralisation** : l’état est stocké dans un store unique, accessible dans toute l’app.
* ✅ **Performance** : Zustand est très léger, plus simple que Redux dans ce cas d’usage.
* ✅ **Simplicité** : une API intuitive (`useUserStore`) pour accéder et modifier l’état.

---

### 🔹 Bonnes pratiques

1. **Un store = un domaine** : par ex. `user_store.ts`, `theme_store.ts`, etc.
2. **Toujours typer** le state et les actions pour éviter les erreurs.
3. **Utiliser `persist` avec prudence** → ne persistez que les données nécessaires (éviter les tokens sensibles).
4. **Nommez clairement la clé `localStorage`** (`name: "current-user"`) pour éviter les collisions.

---

### Configuration du PWA dans ce projet Next.js

Ce projet utilise la Progressive Web App (PWA) pour offrir une expérience améliorée, incluant une installation possible, un mode hors-ligne, et une meilleure performance grâce au caching.

***

#### Modification du manifeste `manifest.webmanifest`

1. Le fichier `manifest.webmanifest` se trouve dans le dossier `src/app` du projet.

2. Pour personnaliser l’application, modifie ce fichier pour inclure les informations suivantes :

   - `name` : Nom complet de l’application.
   - `short_name` : Nom court affiché sur l’écran d’accueil.
   - `description` : Description de l’application.
   - `start_url` : URL de démarrage de l’application (généralement `/`).
   - Couleurs `background_color` et `theme_color` personnalisées selon ta charte graphique.
   - Liste d’icônes dans le format et tailles attendus (voir ci-dessous).

3. Exemple simplifié de partie du manifest :

   ```json
   {
     "name": "Nom de mon app",
     "short_name": "MonApp",
     "description": "Description de mon app",
     "start_url": "/",
     "display": "standalone",
     "background_color": "#ffffff",
     "theme_color": "#000000",
     "icons": [
       {
         "src": "/icon-192x192.png",
         "sizes": "192x192",
         "type": "image/png"
       },
       {
         "src": "/icon-512x512.png",
         "sizes": "512x512",
         "type": "image/png"
       }
     ]
   }
   ```

***

## Remplacement des fichiers d’icônes

1. Les icônes utilisées par le PWA se trouvent dans `/public` sous les noms suivants :

   - `icon-192x192.png`
   - `icon-512x512.png`

2. Remplace ces fichiers PNG par tes propres icônes, en respectant obligatoirement :

   - Le format PNG.
   - Les dimensions exactes (`192x192` pixels et `512x512` pixels).
   - Le nom des fichiers (important pour que le manifest les référence correctement).

***

## Tester et lancer le PWA

1. Après modification, reconstruis le projet pour que les fichiers soient pris en compte :

   ```bash
   npm run build
   ```

2. Lance ensuite l’application en mode production pour tester le vrai comportement PWA :

   ```bash
   npm start
   ```

3. Dans un navigateur compatible, ouvre l’application et vérifie la présence de l’icône d’installation (Add to Home Screen) et le mode hors-ligne.

***

## Note importante

- Vérifie que la balise `<link rel="manifest" href="/manifest.webmanifest" />` est bien présente dans ton fichier `app/layout.tsx` ou équivalent, pour que le navigateur charge le manifest.
- Si tu utilises une configuration i18n avec un middleware, assure-toi que les requêtes vers `/manifest.webmanifest` ne sont pas interceptées ou réécrites par le middleware.

---