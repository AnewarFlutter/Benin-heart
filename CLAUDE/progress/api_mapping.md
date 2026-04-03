# Mapping API Complet — Benin Heart

> Généré après lecture exhaustive de chaque page du frontend.
> Source de vérité pour tous les endpoints backend à développer.
> Mise à jour : 2026-04-03

---

## Légende
- ✅ Backend implémenté + frontend connecté
- ⚠️ Backend implémenté, frontend pas encore connecté
- ❌ Backend à créer

---

## 1. AUTH

| Endpoint | Méthode | Statut | Source Frontend |
|----------|---------|--------|----------------|
| `/api/login/` | POST | ✅ | `login.config.tsx` |
| `/api/token/refresh/` | POST | ✅ | automatique |
| `/api/client/register/` | POST | ⚠️ | `register.config.tsx` — champs: `lastname, firstname, email, telephone, password` |
| `/api/client/verify-otp/` | POST | ⚠️ | `otp.config.tsx` |
| `/api/client/resend-otp/` | POST | ⚠️ | `otp.config.tsx` |
| `/api/client/forgot-password/` | POST | ⚠️ | `forgot-password.config.tsx` |
| `/api/client/verify-otp-forgot-password/` | POST | ⚠️ | `otp.config.tsx` (mode reset) |
| `/api/client/resend-otp-forgot-password/` | POST | ⚠️ | — |
| `/api/client/reset-password/` | POST | ⚠️ | `reset-password.config.tsx` |
| `/api/client/logout/` | POST | ⚠️ | `header-user-menu.tsx` |

---

## 2. STOREFRONT PUBLIC

### Hero Banners
| Endpoint | Méthode | Statut | Source Frontend |
|----------|---------|--------|----------------|
| `/api/storepages/hero-banners/` | GET | ⚠️ | `hero_banner_carousel.tsx` — données statiques hardcodées, API à connecter |
| `/api/admin/hero-banners/` | GET/POST/PUT/DELETE | ✅ | Django admin |

**Modèle réponse attendu :**
```json
[{ "id": 1, "titre": "...", "description": "...", "image": "url", "bouton_texte": "...", "bouton_lien": "url", "ordre": 0, "actif": true }]
```

### Témoignages
| Endpoint | Méthode | Statut | Source Frontend |
|----------|---------|--------|----------------|
| `/api/client/temoignages/` | GET | ⚠️ | `before_and_after.tsx` — données statiques hardcodées, API à connecter |
| `/api/admin/temoignages/` | GET/POST/PUT/DELETE | ✅ | admin existant |

**Modèle réponse attendu :**
```json
[{ "id": 1, "quote": "...", "name": "...", "designation": "...", "src": "url_photo" }]
```

### FAQ
| Endpoint | Méthode | Statut | Source Frontend |
|----------|---------|--------|----------------|
| `/api/client/faqs/` | GET | ⚠️ | `answer_and_question.tsx` — données statiques hardcodées, API à connecter |
| `/api/admin/faqs/` | GET/POST/PUT/DELETE | ✅ | admin existant |

**Modèle réponse attendu :**
```json
[{ "id": 1, "question": "...", "answer": "..." }]
```

### Contact
| Endpoint | Méthode | Statut | Source Frontend |
|----------|---------|--------|----------------|
| `/api/client/contact/` | POST | ⚠️ | `contact_form_card.tsx` — champs: `name, email, phone, subject, message` |
| `/api/client/contact-info/` | GET | ⚠️ | `contact_info_card.tsx` — affiche adresse, téléphones, emails, horaires |
| `/api/admin/contact/` | GET/DELETE | ✅ | admin existant |

**Modèle réponse `/api/client/contact-info/` :**
```json
{ "adresse": "...", "ville": "...", "telephones": ["+229..."], "emails": ["..."], "horaires": {"Lun-Ven": "9h-18h"}, "url_site": "..." }
```

---

## 3. ABONNEMENTS

> Plans gérés via Django admin. Pas de paiement en ligne pour l'instant.

### Plans (public)
| Endpoint | Méthode | Statut | Source Frontend |
|----------|---------|--------|----------------|
| `/api/client/plans/` | GET | ❌ | `abonnements/page.tsx`, `nos_services_section.tsx`, `checkout/page.tsx` |
| `/api/admin/plans/` | GET/POST/PUT/DELETE | ❌ | Django admin + futur admin frontend |

**Modèle Plan :**
```json
{
  "id": 1,
  "slug": "premium",
  "titre": "Plan Premium",
  "description": "...",
  "prix": 14.99,
  "prix_affiche": "14,99€ / mois",
  "duree": "Mensuel",
  "fonctionnalites": ["Likes illimités", "Voir qui vous a liké"],
  "fonctionnalites_exclues": ["Mode invisible"],
  "est_populaire": true,
  "icone": "star"
}
```

### Souscriptions
| Endpoint | Méthode | Statut | Source Frontend |
|----------|---------|--------|----------------|
| `/api/client/souscriptions/` | POST | ❌ | `checkout/page.tsx` — champs: `plan_slug, prenom, nom, email, telephone, adresse, ville, code_postal, nombre_mois, code_promo` |
| `/api/client/mon-abonnement/` | GET | ❌ | `customer/abonnement/page.tsx` — plan actuel, date renouvellement, statut, historique factures |
| `/api/client/mon-abonnement/annuler/` | POST | ❌ | `customer/abonnement/page.tsx` — bouton "Annuler l'abonnement" |
| `/api/admin/souscriptions/` | GET/PUT/DELETE | ❌ | Django admin + futur admin frontend |

**Modèle réponse `/api/client/mon-abonnement/` :**
```json
{
  "plan": "Premium",
  "facturation": "Mensuel",
  "date_renouvellement": "2026-02-21",
  "statut": "actif",
  "moyen_paiement": { "type": "Visa", "derniers_chiffres": "0973" },
  "factures": [
    { "id": 1, "date": "2026-01-21", "total": "20,00 €", "statut": "paid" }
  ]
}
```

---

## 4. PROFILS DE RENCONTRE

### Profils publics (swipe)
| Endpoint | Méthode | Statut | Source Frontend |
|----------|---------|--------|----------------|
| `/api/client/profils/` | GET | ❌ | `tomeetsomeone/page.tsx` — liste paginée de profils à swiper |
| `/api/client/profils/vedettes/` | GET | ❌ | `nos_services_section.tsx` — profils mis en avant page d'accueil |
| `/api/admin/profils/` | GET/PUT/PATCH/DELETE | ❌ | modération admin + futur admin frontend |

**Modèle Profil (réponse swipe) :**
```json
{
  "id": 1,
  "images": ["url1", "url2", "url3"],
  "prenom": "Marie",
  "age": 25,
  "bio": "Passionnée de voyages...",
  "profession": "Designer graphique",
  "ville": "Cotonou",
  "pays": "Bénin",
  "centres_interet": ["Voyages", "Photographie", "Cuisine"]
}
```

### Mon profil (settings)
| Endpoint | Méthode | Statut | Source Frontend |
|----------|---------|--------|----------------|
| `/api/client/mon-profil/` | GET | ❌ | `settings/page.tsx` — section "profile" |
| `/api/client/mon-profil/` | PUT/PATCH | ❌ | `settings/page.tsx` — mise à jour profil |
| `/api/client/mon-profil/photos/` | POST | ❌ | `settings/page.tsx` — section "photos" (jusqu'à 6 photos) |
| `/api/client/mon-profil/photos/{id}/` | DELETE | ❌ | `settings/page.tsx` — supprimer une photo |
| `/api/client/mon-profil/video/` | POST | ❌ | `settings/page.tsx` — section "video" (vidéo de présentation) |
| `/api/client/mon-profil/video/` | DELETE | ❌ | `settings/page.tsx` — supprimer la vidéo |

**Champs complets du profil (déduits de `settings/page.tsx`) :**
```
Section "profile"       : prenom, nom, date_naissance, bio, ville, pays, profession
Section "photos"        : photos[] (tableau jusqu'à 6 images)
Section "video"         : video_url (courte vidéo de présentation)
Section "education"     : niveau_education, ecole, domaine_etudes
Section "notifications" : notifs_likes (bool), notifs_messages (bool), notifs_matchs (bool)
```

---

## 5. LIKES / SUPER LIKES / MATCHS

| Endpoint | Méthode | Statut | Source Frontend |
|----------|---------|--------|----------------|
| `/api/client/likes/` | POST | ❌ | `tomeetsomeone/page.tsx` — swipe droite → body: `{ profil_id }` |
| `/api/client/superlikes/` | POST | ❌ | `tomeetsomeone/page.tsx` — bouton super like → body: `{ profil_id }` |
| `/api/client/dislikes/` | POST | ❌ | `tomeetsomeone/page.tsx` — swipe gauche → body: `{ profil_id }` |
| `/api/client/mes-likes/` | GET | ❌ | `likes/page.tsx` — filtres: `match / like_received / like_sent / superlike_received / superlike_sent` |
| `/api/client/mes-favoris/` | GET | ❌ | `favorites/page.tsx` — profils qui ont super-liké l'utilisateur |
| `/api/client/mes-stats/` | GET | ❌ | `stats-cards.tsx` — stats dashboard home |
| `/api/admin/likes/` | GET | ❌ | statistiques admin |

**Réponse POST likes (retourne si c'est un match) :**
```json
{ "est_match": true, "match_id": 15 }
```

**Réponse GET `/api/client/mes-likes/` :**
```json
{
  "matchs": [{ "id": 201, "images": [...], "prenom": "Juliette", "age": 25, "profession": "Danseuse" }],
  "likes_recus": [...],
  "likes_envoyes": [...],
  "superlikes_recus": [...],
  "superlikes_envoyes": [...]
}
```

**Réponse GET `/api/client/mes-stats/` :**
```json
{
  "likes": { "envoyes": 310, "recus": 820, "matchs": 104 },
  "superlikes": { "envoyes": 145, "recus": 380, "matchs": 42 },
  "chart_visites": [{ "mois": "Jan", "visites": 150 }]
}
```

---

## 6. CONVERSATIONS / CHAT

| Endpoint | Méthode | Statut | Source Frontend |
|----------|---------|--------|----------------|
| `/api/client/conversations/` | GET | ❌ | `chatlike/page.tsx` — liste des conversations avec dernier message |
| `/api/client/conversations/{id}/messages/` | GET | ❌ | `chatlike/page.tsx` — messages d'une conversation |
| `/api/client/conversations/{id}/messages/` | POST | ❌ | `chatlike/page.tsx` — envoyer un message → body: `{ contenu }` |
| `/api/client/conversations/{id}/lire/` | POST | ❌ | `chatlike/page.tsx` — marquer conversation comme lue |
| `/api/admin/conversations/` | GET | ❌ | modération futur admin frontend |

**Réponse GET `/api/client/conversations/` :**
```json
[{
  "id": 1,
  "profil": { "id": 5, "prenom": "Marie", "age": 25, "photo": "url" },
  "dernier_message": "Salut comment ça va ?",
  "timestamp": "2024-01-04T14:30:00Z",
  "non_lus": 2,
  "est_en_ligne": true
}]
```

**Réponse GET `/api/client/conversations/{id}/messages/` :**
```json
[{
  "id": 1,
  "contenu": "Salut !",
  "timestamp": "2024-01-04T14:25:00Z",
  "est_propre": false,
  "statut": "read"
}]
```

---

---

## 7. WEBSOCKETS — Temps Réel

> Stack backend : **Django Channels** + **Redis** (channel layer)
> Stack frontend : WebSocket natif + hook `useWebSocket`

| Canal WebSocket | Sens | Statut | Feature |
|----------------|------|--------|---------|
| `ws/chat/{conversation_id}/` | bidirectionnel | ❌ | `chatlike/page.tsx` — messages instantanés |
| `ws/notifications/` | serveur → client | ❌ | toutes les pages customer — matchs, likes, messages non lus |

### Canal `ws/chat/{conversation_id}/`

**Messages client → serveur :**
```json
{ "type": "message", "contenu": "Salut !" }
{ "type": "typing", "est_en_train_de_taper": true }
{ "type": "lire" }
```

**Messages serveur → client :**
```json
{ "type": "message", "id": 42, "contenu": "Salut !", "auteur_id": 5, "timestamp": "...", "statut": "delivered" }
{ "type": "statut_message", "message_id": 42, "statut": "read" }
{ "type": "typing", "auteur_id": 5, "est_en_train_de_taper": true }
```

### Canal `ws/notifications/`

**Messages serveur → client :**
```json
{ "type": "nouveau_match", "profil": { "id": 5, "prenom": "Marie", "photo": "url" } }
{ "type": "nouveau_like", "profil": { "id": 8, "prenom": "Sophie" } }
{ "type": "nouveau_message", "conversation_id": 12, "apercu": "Salut !", "expediteur": "Marie" }
{ "type": "statut_en_ligne", "profil_id": 5, "est_en_ligne": true }
```

---

## RÉCAPITULATIF — Apps Django à créer

| App Django | Endpoints REST | WebSocket | Priorité |
|-----------|---------------|-----------|---------|
| — (existant) | Auth, hero-banners, temoignages, FAQ, contact | ❌ | ✅ |
| `abonnement` | `/api/client/plans/`, `/api/client/souscriptions/`, `/api/client/mon-abonnement/` + admin | ❌ | 🔴 HAUTE |
| `profil` | `/api/client/profils/`, `/api/client/mon-profil/`, photos, vidéo + admin | ❌ | 🔴 HAUTE |
| `like` | `/api/client/likes/`, `/api/client/superlikes/`, `/api/client/mes-likes/`, `/api/client/mes-stats/` + admin | ✅ `ws/notifications/` — match instantané | 🟠 MOYENNE |
| `conversation` | `/api/client/conversations/`, messages REST (historique) + admin | ✅ `ws/chat/{id}/` — messages temps réel + typing + lu | 🟡 BASSE |

---

## ADMIN FRONTEND FUTUR — Endpoints déjà disponibles

| App | Endpoints admin disponibles |
|-----|----------------------------|
| `users` ✅ | `/api/admin/users/` |
| `storepage` ✅ | `/api/admin/hero-banners/` |
| `temoignage` ✅ | `/api/admin/temoignages/` |
| `faq` ✅ | `/api/admin/faqs/` |
| `contact` ✅ | `/api/admin/contact/`, `/api/admin/contact-info/` |
| `abonnement` ❌ | `/api/admin/plans/`, `/api/admin/souscriptions/` — à créer |
| `profil` ❌ | `/api/admin/profils/` — à créer |
| `like` ❌ | `/api/admin/likes/` — à créer |
| `conversation` ❌ | `/api/admin/conversations/` — à créer |
