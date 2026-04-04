# État du Projet — Benin Heart

> Mise à jour : 2026-04-04
> Branche active : `anewar`
> Nature : Application de rencontres (style Tinder) — marché béninois

---

## Ce qui est FAIT ✅

### Backend (`backendBeninHeart/`)

| Composant | Détail |
|-----------|--------|
| App `users` | User + Role (CLIENT/ADMIN/SUPERADMIN), auth JWT, OTP, inscription, gestion admin |
| App `contact` | ContactInfo (singleton) + formulaire Contact + envoi email |
| App `faq` | CRUD FAQ (admin + public) |
| App `temoignage` | CRUD Témoignages (admin + public) |
| App `storepage` | HeroBanner (admin + public) |
| App `abonnement` | PlanAbonnement + Souscription — plans, souscriptions, validation admin |
| App `profil` | Profil + PhotoProfil — swipe, mon-profil, photos, vidéo, statut en ligne |
| App `like` | Like + Match — LIKE/SUPERLIKE/DISLIKE, matchs auto, stats |
| App `conversation` | Conversation + Message — messagerie entre matchs |
| **WebSocket `ws/notifications/`** | Notifications likes/matchs/statut en ligne (Django Channels) |
| **WebSocket `ws/chat/{uuid}/`** | Chat temps réel : typing, lu, messages (Django Channels) |
| Django Channels + Daphne | ASGI opérationnel, Redis channel layer configuré |
| Script `create_django_app.py` | Création d'app Clean Architecture automatisée |
| Venv Python 3.12 | `backendBeninHeart/venv` — toutes les dépendances installées |

### Migrations générées (non appliquées — seront appliquées via Docker)
- `abonnement/migrations/0001_initial.py`
- `profil/migrations/0001_initial.py`
- `like/migrations/0001_initial.py`
- `conversation/migrations/0001_initial.py`

### Frontend (`view_utilisateurs/`)

| Composant | Détail |
|-----------|--------|
| Storefront | Pages: home, abonnements, contact, FAQ, checkout |
| Auth CLIENT | Login, register, OTP, forgot/reset password |
| Dashboard CLIENT | Home (stats), tomeetsomeone (swipe Tinder), chatlike, likes, favorites, settings, abonnement |
| Composants | TinderCard, Cart, Checkout, Chatbot widget, Notifications, PWA |
| Système SCAF | Orchestrateur TypeScript opérationnel |
| Module `magasin` | ⚠️ TEST UNIQUEMENT — ne fait PAS partie du vrai projet |
| **Clean Architecture** | ✅ Modules beninheart : auth, abonnement, profil, like, conversation |
| **Modules domain** | ✅ Entities, Repositories, UseCases pour chaque feature |
| **Modules data** | ✅ Models, DataSources (REST), RepositoryImpl pour chaque feature |
| **Controllers** | ✅ adapters/beninheart/ : AuthController, PlanController, ProfilController, LikeController, ConversationController |
| **Server Actions** | ✅ actions/beninheart/ : auth, abonnement, profil, like, conversation |
| **DI** | ✅ features_di.ts mis à jour avec tous les controllers beninheart |
| **Pages connectées** | ✅ TOUTES les pages connectées au backend (voir détail ci-dessous) |
| **useAuth hook** | ✅ Migré vers featuresDi.authController (plus de beninheart_api direct) |
| **StorageController** | ✅ StorefrontController + actions storefront |
| **actions/plan** | ✅ getPlansAction, getMonAbonnementAction, souscrireAction |

---

## Ce qui est À FAIRE ❌

### Priorité HAUTE — ✅ TOUT CONNECTÉ

| Tâche | Fichier frontend | Statut |
|-------|-----------------|--------|
| Hero Banners | `hero_banner_carousel.tsx` | ✅ |
| Témoignages | `before_and_after.tsx` | ✅ |
| FAQ | `faq/page.tsx` | ✅ |
| Contact | `contact/page.tsx` | ✅ |
| Auth (login/register/OTP/forgot) | auth pages | ✅ |
| Plans abonnement | `abonnements/page.tsx` | ✅ |
| Swipe | `tomeetsomeone/page.tsx` | ✅ |
| Likes & Matchs | `likes/page.tsx` | ✅ |
| Superlikes (Coup de cœur) | `favorites/page.tsx` | ✅ |
| Paramètres profil | `settings/page.tsx` | ✅ |
| Mon abonnement | `abonnement/page.tsx` | ✅ |
| Stats dashboard | `home/page.tsx` + `StatsCards` | ✅ |
| Chat | `chatlike/page.tsx` | ✅ |
| WebSocket notifications | hook `useWebSocket` | ✅ |

### Priorité MOYENNE

| Tâche | Description |
|-------|-------------|
| Créer profil à l'inscription | Après register, rediriger vers création profil (page onboarding) |
| Dashboard admin frontend | À créer plus tard (APIs admin déjà prêtes) |
| Paiement en ligne | Intégration à faire quand le prestataire est choisi |

---

## Résumé API disponibles

### Client (authentifié)
- `POST /api/client/register/` + OTP + login
- `GET/POST/PUT /api/client/mon-profil/`
- `POST /api/client/mon-profil/photos/`
- `GET /api/client/profils/` (swipe)
- `POST /api/client/likes/`
- `GET /api/client/mes-matchs/`
- `GET /api/client/mes-likes/`
- `GET /api/client/mes-stats/`
- `GET /api/client/conversations/`
- `GET/POST /api/client/conversations/{uuid}/messages/`
- `POST /api/client/conversations/ouvrir/`
- `GET /api/client/mon-abonnement/`
- `POST /api/client/souscriptions/`

### Public (sans auth)
- `GET /api/client/plans/`
- `GET /api/client/hero-banners/`
- `GET /api/client/temoignages/`
- `GET /api/client/faq/`

### WebSocket
- `ws://host/ws/notifications/` — likes, matchs, statut en ligne
- `ws://host/ws/chat/{conversation_uuid}/` — chat temps réel

### Admin (staff/superuser)
- `/api/admin/plans/` (CRUD)
- `/api/admin/souscriptions/` + valider/annuler
- `/api/admin/profils/` + suspendre/bannir/verifier
- `/api/admin/faq/`, `/api/admin/temoignages/`, `/api/admin/contacts/`
- `/api/admin/users/` (gestion complète)

---

## Note Importante sur le Module Magasin

Le dossier `view_utilisateurs/src/modules/magasin/` est un **module de test SCAF**.
Il ne représente PAS les fonctionnalités de l'application.
Ne pas s'en inspirer pour créer de nouveaux modules frontaux.
