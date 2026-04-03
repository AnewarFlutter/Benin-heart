# Architecture Globale — Benin Heart

## Nature du Projet
**Application de rencontres** (style Tinder) pour le marché béninois.
- Visiteurs : découvrent l'app, s'inscrivent, choisissent un abonnement
- Membres : swipent des profils, likent, chattent, gèrent leur compte

---

## Structure du Monorepo

```
D:/Benin-heart/
├── backendBeninHeart/         ← API Django REST Framework
├── view_utilisateurs/         ← Frontend Next.js (app de rencontres)
├── nginx/                     ← Config NGINX (reverse proxy)
└── CLAUDE/                    ← Configs agents + mémoire projet
```

---

## Backend — `backendBeninHeart/`

### Stack
- Python / Django 4.x
- Django REST Framework
- PostgreSQL
- Redis + Celery
- JWT (SimpleJWT)
- drf-spectacular (OpenAPI/Swagger)

### Architecture : Clean Architecture

```
apps/<nom_app>/
├── models.py                  ← ORM Django (Infrastructure)
├── domain/                    ← Logique métier pure
│   ├── entities.py
│   ├── repositories.py (interfaces ABC)
│   └── services.py
├── application/               ← Use cases
│   ├── dtos.py
│   ├── use_cases.py
│   └── validators.py
├── infrastructure/            ← Implémentations ORM
│   └── repositories.py
└── presentation/              ← REST API
    ├── admin/                 ← Endpoints ADMIN
    └── <ressource>s/          ← Endpoints CLIENT/PUBLIC
```

### Apps Backend Existantes (état 2026-04)

| App | Modèles Principaux | Statut | Sert à quoi |
|-----|-------------------|--------|-------------|
| `users` | User, Role | ✅ Complet | Auth JWT, OTP, inscription, gestion admin |
| `contact` | ContactInfo, Contact | ✅ Complet | Page contact + formulaire |
| `faq` | FAQ | ✅ Complet | Page FAQ |
| `temoignage` | Temoignage | ✅ Complet | Section témoignages page d'accueil |
| `storepage` | HeroBanner | ✅ Complet | Carrousel bannières page d'accueil |

### Apps Backend Manquantes (à créer)

| App | Utilité | Priorité |
|-----|---------|---------|
| `profil` | Profils de rencontre (photos, bio, intérêts, localisation) | HAUTE |
| `abonnement` | Plans tarifaires (Gratuit/Premium/VIP) + souscriptions | HAUTE |
| `like` | Système like/dislike entre profils | MOYENNE |
| `match` | Matchs détectés quand 2 profils se likent | MOYENNE |
| `conversation` | Messagerie entre utilisateurs matchés | BASSE |

---

## Frontend — `view_utilisateurs/`

### Stack
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- next-intl (i18n)
- PWA (manifest + push notifications)
- SCAF (scaffolding YAML-driven — pour générer des modules)

### Pages Existantes

#### Storefront (accès public)
| Route | Page | Backend nécessaire |
|-------|------|--------------------|
| `/` | Accueil : hero carousel, profils en vedette, témoignages | HeroBanner ✅, Temoignage ✅ |
| `/abonnements` | Plans Gratuit/Premium/VIP | App `abonnement` ❌ |
| `/contact` | Formulaire contact + infos | Contact ✅ |
| `/faq` | Questions fréquentes | FAQ ✅ |
| `/checkout` | Paiement abonnement | App `abonnement` ❌ |

#### Auth Customer
| Route | Page | Backend nécessaire |
|-------|------|--------------------|
| `/customer/auth/login` | Connexion | users ✅ |
| `/customer/auth/register` | Inscription (nom, prénom, email, tel, mdp) | users ✅ |
| `/customer/auth/otp` | Vérification OTP | users ✅ |
| `/customer/auth/forgot-password` | Mot de passe oublié | users ✅ |
| `/customer/auth/reset-password` | Réinitialisation mdp | users ✅ |

#### Customer Dashboard (authentifié)
| Route | Page | Backend nécessaire |
|-------|------|--------------------|
| `/customer/home` | Dashboard stats | — |
| `/customer/tomeetsomeone` | Swipe Tinder-like | App `profil` ❌, App `like` ❌ |
| `/customer/chatlike` | Messagerie | App `conversation` ❌ |
| `/customer/likes` | Profils qui ont aimé | App `like` ❌ |
| `/customer/favorites` | Favoris | App `like` ❌ |
| `/customer/settings` | Paramètres profil | App `profil` ❌ |
| `/customer/abonnement` | Mon abonnement | App `abonnement` ❌ |

### Structure du Code Frontend

```
src/
├── app/[locale]/              ← Pages Next.js
│   ├── (storefront)/          ← Pages publiques
│   └── customer/              ← Pages authentifiées
├── components/                ← Composants UI réutilisables
│   ├── tinder-card.tsx        ← Carte swipeable
│   ├── cart/                  ← Panier/checkout
│   ├── checkout/              ← Processus de paiement
│   └── ...
├── shared/constants/
│   ├── api_routes.ts          ← Routes API (⚠️ contient routes test "magasin" à nettoyer)
│   ├── routes.ts              ← Routes app Next.js
│   └── ...
├── stores/user_store.ts       ← Zustand store utilisateur
├── modules/magasin/           ← ⚠️ MODULE TEST UNIQUEMENT — NE PAS UTILISER
└── di/features_di.ts          ← ⚠️ Référence le module test — à réécrire
```

> ⚠️ **IMPORTANT** : Le dossier `src/modules/magasin/` et `src/di/features_di.ts` sont des artefacts
> du module de test SCAF. Ils ne font PAS partie de l'application réelle.

---

## Communication Backend ↔ Frontend

```
Frontend (Next.js) → NGINX → Backend (Django)
```

Les routes API réelles à construire :
```
/api/login/                         → Auth
/api/client/register/               → Inscription
/api/client/profils/                → Profils de rencontre
/api/admin/abonnements/             → Gestion abonnements
/api/client/abonnements/            → Plans disponibles
/api/client/likes/                  → Liker/disliker
/api/client/matchs/                 → Matchs
/api/client/conversations/          → Messagerie
```
