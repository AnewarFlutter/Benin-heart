# État du Projet — Benin Heart

> Mise à jour : 2026-04-03
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
| Script `create_django_app.py` | Création d'app Clean Architecture automatisée |
| Suppression apps inutiles | `devis`, `creneaux`, `commande`, `service` supprimées |
| Suppression `DeliveryPerson` | Logique livraison retirée de `users` |

### Frontend (`view_utilisateurs/`)

| Composant | Détail |
|-----------|--------|
| Storefront | Pages: home, abonnements, contact, FAQ, checkout |
| Auth CLIENT | Login, register, OTP, forgot/reset password |
| Dashboard CLIENT | Home (stats), tomeetsomeone (swipe Tinder), chatlike, likes, favorites, settings, abonnement |
| Composants | TinderCard, Cart, Checkout, Chatbot widget, Notifications, PWA |
| Système SCAF | Orchestrateur TypeScript opérationnel |
| Module `magasin` | ⚠️ TEST UNIQUEMENT — ne fait PAS partie du vrai projet |

---

## Ce qui est EN COURS 🔄

| Tâche | Blocage |
|-------|---------|
| Migrations `users` (suppression DeliveryPerson) | `python manage.py makemigrations users` à exécuter |

---

## Ce qui est À FAIRE ❌

### Priorité HAUTE — Backend

| Tâche | Description |
|-------|-------------|
| Migrations users | Exécuter makemigrations pour supprimer la table DeliveryPerson |
| App `profil` | Profils de rencontre (photos, bio, âge, intérêts, localisation) — le frontend swipe sur ces profils |
| App `abonnement` | Plans (Gratuit/Premium/VIP) + souscriptions des membres |

### Priorité HAUTE — Frontend

| Tâche | Description |
|-------|-------------|
| Nettoyer `api_routes.ts` | Supprimer les routes test (STOCK, PRODUCTS, MOCK_USER), corriger AUTH |
| Connecter Hero Banners | `hero_banner_carousel.tsx` → `/api/storepages/hero-banners/` |
| Connecter Témoignages | `before_and_after.tsx` → `/api/client/temoignages/` |
| Connecter FAQ | `faq/page.tsx` → `/api/client/faqs/` |
| Connecter Contact | `contact/page.tsx` → `/api/client/contact/` |

### Priorité MOYENNE

| Tâche | Description |
|-------|-------------|
| App `like` backend | Liker/disliker des profils, voir qui m'a liké |
| App `match` backend | Détecter les matchs mutuels |
| Connecter auth frontend | Formulaires login/register → vraies API backend |

### Priorité BASSE

| Tâche | Description |
|-------|-------------|
| App `conversation` backend | Messagerie entre utilisateurs matchés |
| Nettoyer module `magasin` | Supprimer le module test du frontend |
| Nettoyer `features_di.ts` | Réécrire l'injection de dépendances sans magasin |

---

## Note Importante sur le Module Magasin

Le dossier `view_utilisateurs/src/modules/magasin/` est un **module de test SCAF**.
Il ne représente PAS les fonctionnalités de l'application.
Ne pas s'en inspirer pour créer de nouveaux modules frontaux.
S'inspirer plutôt des composants réels dans `src/components/` et des pages dans `src/app/`.
