# 📦 WORKFLOW DES COMMANDES - MY SHOEMAKER APP

## 📋 Table des matières

1. [Vue d'ensemble](#-vue-densemble)
2. [Acteurs du système](#-acteurs-du-système)
3. [Les 9 statuts de commande](#-les-9-statuts-de-commande)
4. [Workflow complet étape par étape](#-workflow-complet-étape-par-étape)
5. [Résumé par acteur](#-résumé-par-acteur)
6. [Récapitulatif des emails](#-récapitulatif-des-emails)
7. [Endpoints API](#-endpoints-api)

---

## 🎯 Vue d'ensemble

Le système de commande de **My Shoemaker App** permet aux clients de commander des services de réparation de chaussures avec **collecte et livraison à domicile**.

### Principe général

1. **CLIENT** : Commande des services de réparation pour ses chaussures
2. **COLLECTE** : Un livreur vient récupérer les chaussures chez le client
3. **ATELIER** : Les chaussures sont réparées dans l'atelier
4. **LIVRAISON** : Un livreur rapporte les chaussures réparées au client

### Caractéristiques principales

- ✅ Commande multi-produits (plusieurs paires de chaussures)
- ✅ Multi-services par paire (plusieurs réparations sur une même paire)
- ✅ Système de créneaux horaires avec capacité limitée (optionnel)
- ✅ Codes de collecte uniques pour traçabilité
- ✅ Double livraison (collecte + livraison finale)
- ✅ Codes promotionnels (pourcentage ou montant fixe)
- ✅ Calcul de prix côté serveur (sécurisé)
- ✅ Emails automatiques à chaque étape
- ✅ Géolocalisation de l'adresse de collecte
- ✅ Workflow complet avec 9 statuts

---

## 👥 Acteurs du système

### 1. CLIENT

**Rôle** : Utilisateur qui commande les services de réparation

**Permissions** :
- ✅ Créer une commande
- ✅ Consulter ses commandes
- ✅ Suivre le statut de ses commandes
- ✅ Annuler une commande (si conditions remplies)
- ❌ Modifier une commande après création
- ❌ Voir les commandes d'autres clients

**Actions** :
1. S'inscrire et se connecter
2. Choisir des services dans le catalogue
3. Uploader photos de ses chaussures
4. Sélectionner un créneau de collecte
5. Appliquer un code promo (optionnel)
6. Choisir un moyen de paiement
7. Valider la commande (checkout)
8. Suivre l'avancement de sa commande

---

### 2. LIVREUR (DELIVERY)

**Rôle** : Personne qui collecte et livre les chaussures

**Permissions** :
- ✅ Voir les commandes qui lui sont assignées
- ✅ Confirmer la prise en charge d'une collecte
- ✅ Générer et scanner des codes de collecte
- ✅ Confirmer la collecte effective
- ✅ Confirmer la livraison finale
- ❌ Créer ou modifier des commandes
- ❌ Voir toutes les commandes

**Actions** :
1. Consulter ses missions de collecte/livraison
2. Confirmer qu'il se rend chez le client
3. Arriver chez le client et collecter les chaussures
4. Pour chaque paire : générer un code unique et le coller
5. Scanner les codes pour traçabilité
6. Déposer les chaussures à l'atelier
7. (Plus tard) Récupérer les chaussures réparées
8. Livrer chez le client et confirmer la livraison

---

### 3. ADMIN / SUPERADMIN

**Rôle** : Gestionnaire du système

**Permissions** :
- ✅ Voir TOUTES les commandes
- ✅ Créer/Modifier/Supprimer des commandes
- ✅ Assigner des livreurs aux commandes
- ✅ Changer les statuts des commandes
- ✅ Gérer les services (catalogue)
- ✅ Gérer les moyens de paiement
- ✅ Gérer les codes promotionnels
- ✅ Gérer les créneaux horaires
- ✅ Gérer la configuration du système
- ✅ Consulter les logs d'emails

**Actions** :
1. Valider les nouvelles commandes
2. Assigner un livreur pour la collecte
3. Suivre l'état des chaussures en atelier
4. Changer le statut en "prête" quand réparation terminée
5. Assigner un livreur pour la livraison
6. Gérer les problèmes et réclamations
7. Générer des rapports et statistiques

---

## 📊 Les 9 statuts de commande

| Statut | Description | Qui peut le changer | Actions possibles |
|--------|-------------|---------------------|-------------------|
| `nouvelle` | Commande créée par le client | Système (auto) | Admin : valider, annuler |
| `confirmee` | Admin a validé et assigné un livreur | Admin | Livreur : confirmer collecte |
| `en_collecte` | Livreur se rend chez le client | Livreur | Livreur : confirmer collecte effective |
| `collectee` | Chaussures collectées et codes scannés | Livreur/Système | Admin : changer en "en_cours" |
| `en_cours` | Chaussures à l'atelier, en réparation | Admin | Admin : changer en "prete" |
| `prete` | Réparation terminée, prêt à livrer | Admin | Admin : assigner livreur livraison |
| `en_livraison` | Livreur livre chez le client | Admin | Livreur : confirmer livraison |
| `terminee` | Chaussures livrées au client | Livreur | (STATUT FINAL) |
| `annulee` | Commande annulée | Client/Admin | (STATUT FINAL) |

### Diagramme de transition

```
                    ┌──────────┐
                    │ nouvelle │ ← Client crée commande
                    └────┬─────┘
                         │ Admin valide + assigne livreur
                         ↓
                    ┌──────────┐
                    │confirmee │ ← Admin valide
                    └────┬─────┘
                         │ Livreur confirme départ
                         ↓
                  ┌─────────────┐
                  │ en_collecte │ ← Livreur en route
                  └──────┬──────┘
                         │ Livreur scanne codes
                         ↓
                    ┌──────────┐
                    │collectee │ ← Chaussures collectées
                    └────┬─────┘
                         │ Admin met en atelier
                         ↓
                    ┌──────────┐
                    │ en_cours │ ← En réparation
                    └────┬─────┘
                         │ Admin termine réparation
                         ↓
                    ┌──────────┐
                    │   prete  │ ← Prêt à livrer
                    └────┬─────┘
                         │ Admin assigne livreur livraison
                         ↓
                  ┌─────────────┐
                  │en_livraison │ ← Livreur en route
                  └──────┬──────┘
                         │ Livreur livre et confirme
                         ↓
                    ┌──────────┐
                    │ terminee │ ← TERMINÉ
                    └──────────┘

        Annulation possible depuis n'importe quel état (sauf terminee)
                         ↓
                    ┌──────────┐
                    │ annulee  │ ← ANNULÉ
                    └──────────┘
```

---

## 🔄 Workflow complet étape par étape

### ÉTAPE 1 : CRÉATION DE LA COMMANDE
**Statut : `nouvelle`**

```
CLIENT                          SYSTÈME
  |                                |
  |--- POST /api/client/commandes/ ------>|
  |    {                           |
  |      produits: [...],          |
  |      collecte: {...},          |
  |      moyen_paiement_id: "uuid",|
  |      code_promo: "CODE"        |
  |    }                           |
  |                                |--- Vérifier créneau disponible
  |                                |--- Calculer prix (HT, TVA, TTC)
  |                                |--- Appliquer code promo
  |                                |--- Créer commande (statut=nouvelle)
  |                                |--- Incrémenter réservations créneau
  |                                |
  |<--- 201 Created ----------------|
  |    {                           |
  |      id: "uuid",               |
  |      code_unique: "CMD-2025-XXXXXX",
  |      montant_final: "126.00",  |
  |      statut_commande: "nouvelle"
  |    }                           |
```

**Emails envoyés :**
- ✅ **Client** : Confirmation de commande avec détails
- ✅ **Admins** : Notification nouvelle commande

---

### ÉTAPE 2 : VALIDATION PAR L'ADMIN
**Statut : `nouvelle` → `confirmee`**

```
ADMIN                           SYSTÈME                    LIVREUR
  |                                |                          |
  |--- PUT /api/admin/commandes/{uuid}/ -->|                |
  |    {                           |                          |
  |      statut_commande: "confirmee"                        |
  |    }                           |                          |
  |                                |                          |
  |--- POST .../assign-delivery-person/ -->|                 |
  |    {                           |                          |
  |      delivery_person_id: "uuid"|                         |
  |    }                           |                          |
  |                                |                          |
  |                                |--- Statut = confirmee    |
  |                                |--- date_assignation = now|
  |                                |                          |
  |                                |--- Email assignation ---->|
  |                                |                          |
  |<--- 200 OK --------------------|                          |
```

**Emails envoyés :**
- ✅ **Livreur** : Assignation collecte (adresse, horaire, contact)

---

### ÉTAPE 3 : CONFIRMATION DU LIVREUR
**Statut : `confirmee` → `en_collecte`**

```
LIVREUR                         SYSTÈME                    CLIENT
  |                                |                          |
  |--- POST .../confirm-collecte/ ->|                        |
  |                                |                          |
  |                                |--- Statut = en_collecte  |
  |                                |--- date_confirmation = now
  |                                |                          |
  |<--- 200 OK --------------------|                          |
  |                                |                          |
  |                         ⏰ Celery Task (1h avant créneau) |
  |                                |                          |
  |                                |--- Rappel email --------->|
  |                                |    "Collecte dans 1h"    |
```

**Système automatique :**
- ⏰ **Celery Beat** vérifie toutes les 15 minutes
- 📧 Envoie un rappel au client 1h avant le créneau

---

### ÉTAPE 4 : COLLECTE CHEZ LE CLIENT
**Statut : `en_collecte` → `collectee`**

```
LIVREUR                         SYSTÈME                    CLIENT
  |                                |                          |
  |    Arrive chez client          |                          |
  |                                |                    Donne chaussures
  |                                |                          |
  |--- POST .../codes-collecte/generate/ ->|                 |
  |    { nombre: 1 }               |                          |
  |                                |                          |
  |<--- { code: "ABC123" } --------|                          |
  |                                |                          |
  |    Colle étiquette "ABC123" sur paire 1                   |
  |                                |                          |
  |--- POST .../codes-collecte/scan/ ---->|                  |
  |    {                           |                          |
  |      code: "ABC123",           |                          |
  |      commande_produit_id: "uuid"                         |
  |    }                           |                          |
  |                                |                          |
  |<--- Code scanné ---------------|                          |
  |                                |                          |
  |--- POST .../codes-collecte/generate/ ->|                 |
  |<--- { code: "XYZ789" } --------|                          |
  |                                |                          |
  |    Colle étiquette "XYZ789" sur paire 2                   |
  |                                |                          |
  |--- POST .../codes-collecte/scan/ ---->|                  |
  |    { code: "XYZ789", ... }     |                          |
  |                                |                          |
  |                                |--- Vérifie : tous codes OK
  |                                |--- Statut = collectee    |
  |                                |                          |
  |<--- Collecte terminée ---------|                          |
  |                                |                          |
  |                                |--- Email collectée ------>|
```

**Validation automatique :**
- Le système passe au statut `collectee` quand :
  - Tous les produits ont un code de collecte
  - Tous les codes ont été scannés

**Emails envoyés :**
- ✅ **Client** : Chaussures collectées avec succès
- ✅ **Admins** : Collecte effectuée pour commande #XXX

---

### ÉTAPE 5 : ARRIVÉE À L'ATELIER
**Statut : `collectee` → `en_cours`**

```
ADMIN                           SYSTÈME                    CLIENT
  |                                |                          |
  |    Livreur dépose à l'atelier  |                          |
  |                                |                          |
  |--- PUT /api/admin/commandes/{uuid}/ ->|                 |
  |    {                           |                          |
  |      statut_commande: "en_cours"                         |
  |    }                           |                          |
  |                                |                          |
  |                                |--- Statut = en_cours     |
  |                                |                          |
  |<--- 200 OK --------------------|                          |
  |                                |                          |
  |                                |--- Email atelier -------->|
  |                                |    "Arrivée à l'atelier" |
```

**Emails envoyés :**
- ✅ **Client** : Vos chaussures sont arrivées à l'atelier

---

### ÉTAPE 6 : RÉPARATION TERMINÉE
**Statut : `en_cours` → `prete`**

```
ADMIN                           SYSTÈME                    CLIENT
  |                                |                          |
  |    Termine les réparations     |                          |
  |                                |                          |
  |--- PUT /api/admin/commandes/{uuid}/ ->|                 |
  |    {                           |                          |
  |      statut_commande: "prete"  |                          |
  |    }                           |                          |
  |                                |                          |
  |                                |--- Statut = prete        |
  |                                |                          |
  |<--- 200 OK --------------------|                          |
  |                                |                          |
  |                                |--- Email prête ---------->|
  |                                |    "Chaussures prêtes"   |
```

**Emails envoyés :**
- ✅ **Client** : Vos chaussures sont prêtes

---

### ÉTAPE 7 : ASSIGNATION LIVRAISON
**Statut : `prete` → `en_livraison`**

```
ADMIN                           SYSTÈME                    LIVREUR
  |                                |                          |
  |--- POST .../assign-delivery-livraison/ ->|              |
  |    {                           |                          |
  |      delivery_person_id: "uuid",                         |
  |      date_livraison: "2025-12-30"                        |
  |    }                           |                          |
  |                                |                          |
  |                                |--- Statut = en_livraison |
  |                                |--- date_assignation_livraison
  |                                |                          |
  |<--- 200 OK --------------------|                          |
  |                                |                          |
  |                                |--- Email assignation ---->|
  |                                |    (adresse client)      |
```

**Emails envoyés :**
- ✅ **Livreur** : Assignation livraison avec adresse client

---

### ÉTAPE 8 : LIVRAISON FINALE
**Statut : `en_livraison` → `terminee`**

```
LIVREUR                         SYSTÈME                    CLIENT
  |                                |                          |
  |    Arrive chez client          |                          |
  |                                |                    Reçoit chaussures
  |                                |                          |
  |--- POST .../confirm-livraison/ ->|                       |
  |                                |                          |
  |                                |--- Statut = terminee     |
  |                                |--- date_livraison_effective
  |                                |                          |
  |<--- 200 OK --------------------|                          |
  |                                |                          |
  |                                |--- Email terminée ------->|
  |                                |    "Livraison effectuée" |
```

**Emails envoyés :**
- ✅ **Client** : Livraison effectuée avec succès
- ✅ **Admins** : Commande terminée

---

## 🎯 Résumé par acteur

### 🔵 CLIENT

**Statuts qu'il déclenche :**
- `nouvelle` (création de commande)

**Statuts qu'il peut suivre :**
- Tous (reçoit email à chaque changement)

**Actions possibles :**
- ✅ Créer une commande
- ✅ Voir ses commandes : `GET /api/client/commandes/`
- ✅ Voir détails : `GET /api/client/commandes/{uuid}/`
- ✅ Annuler (si conditions) : `POST /api/client/commandes/{uuid}/annuler/`

---

### 🟢 LIVREUR

**Statuts qu'il déclenche :**
- `confirmee` → `en_collecte` (confirme collecte)
- `en_collecte` → `collectee` (scanne codes)
- `en_livraison` → `terminee` (confirme livraison)

**Endpoints disponibles :**
```
GET    /api/delivery/commandes/               # Ses missions
GET    /api/delivery/commandes/{uuid}/        # Détails
POST   /api/delivery/commandes/{uuid}/confirm-collecte/
POST   /api/delivery/codes-collecte/generate/
POST   /api/delivery/codes-collecte/scan/
POST   /api/delivery/commandes/{uuid}/confirm-livraison/
```

---

### 🟠 ADMIN

**Statuts qu'il déclenche :**
- `nouvelle` → `confirmee` (valide + assigne)
- `collectee` → `en_cours` (atelier)
- `en_cours` → `prete` (terminé)
- `prete` → `en_livraison` (assigne livraison)
- Tous → `annulee` (annulation)

**Endpoints disponibles :**
```
GET    /api/admin/commandes/                          # Toutes les commandes
GET    /api/admin/commandes/{uuid}/                   # Détails
PUT    /api/admin/commandes/{uuid}/                   # Modifier (+ email auto)
POST   /api/admin/commandes/checkout/                 # Créer pour client
POST   /api/admin/commandes/{uuid}/assign-delivery-person/
POST   /api/admin/commandes/{uuid}/assign-delivery-livraison/
DELETE /api/admin/commandes/{uuid}/                   # Supprimer
```

---

## 📧 Récapitulatif des emails

| Événement | Client | Admin | Livreur | Template |
|-----------|--------|-------|---------|----------|
| **Commande créée** | ✅ Confirmation | ✅ Nouvelle commande | ❌ | `confirmation_commande_client.html` <br> `nouvelle_commande_admin.html` |
| **Admin valide + assigne** | ❌ | ❌ | ✅ Assignation | `assignation_livreur.html` |
| **Rappel 1h avant** | ⏰ Rappel collecte | ❌ | ❌ | `rappel_collecte.html` |
| **Collecte effectuée** | ✅ Collectée | ✅ Collectée | ❌ | `collecte_effectuee_client.html` <br> `collecte_effectuee_admin.html` |
| **Arrivée atelier** | ✅ En atelier | ❌ | ❌ | `arrivee_atelier.html` |
| **Réparation terminée** | ✅ Prête | ❌ | ❌ | *(À créer)* |
| **Livraison assignée** | ❌ | ❌ | ✅ Assignation | `assignation_livreur_livraison.html` |
| **Livraison effectuée** | ✅ Terminée | ✅ Terminée | ❌ | `livraison_effectuee_client.html` <br> `livraison_effectuee_admin.html` |
| **Commande modifiée** | ✅ Modification | ❌ | ❌ | `modification_commande_client.html` |

**Note :** Tous les emails sont envoyés via **Celery tasks asynchrones** et loggés dans `EmailLog`.

---

## 🔌 Endpoints API

### Client Endpoints

```http
# Créer une commande
POST   /api/client/commandes/
Content-Type: multipart/form-data
Body: {
  "produits": [
    {
      "description": "Baskets Nike",
      "marque": "Nike",
      "modele": "Air Max",
      "couleur": "Blanc",
      "photo": <file>,
      "services": ["uuid1", "uuid2"],
      "note_utilisateur": "Taché"
    }
  ],
  "moyen_paiement_id": "uuid",
  "code_promo": "CODE2025",
  "collecte": {
    "adresse": "123 Rue...",
    "latitude": "48.8566",
    "longitude": "2.3522",
    "telephone": "+33612345678",
    "date": "2025-12-30",
    "creneau_id": "uuid"  // ou "creneau_texte": "14h-16h"
  }
}

# Voir mes commandes
GET    /api/client/commandes/

# Voir détails
GET    /api/client/commandes/{uuid}/

# Annuler
POST   /api/client/commandes/{uuid}/annuler/
```

---

### Admin Endpoints

```http
# Toutes les commandes
GET    /api/admin/commandes/
Query: ?statut_paiement=paye&statut_commande=nouvelle&user_id=uuid

# Créer pour un client
POST   /api/admin/commandes/checkout/
Body: {
  "user_id": "uuid",
  "produits": [...],
  "moyen_paiement_id": "uuid",
  "code_promo": "CODE",
  "collecte": {...}
}

# Modifier une commande (⚠️ envoie email au client)
PUT    /api/admin/commandes/{uuid}/
Body: {
  "statut_paiement": "paye",
  "statut_commande": "confirmee",
  "delivery_person_id": "uuid",
  "date_collecte": "2025-12-31",
  "creneau_id": "uuid",
  "adresse_collecte": "Nouvelle adresse",
  "telephone_collecte": "+33698765432"
}

# Assigner livreur collecte
POST   /api/admin/commandes/{uuid}/assign-delivery-person/
Body: {
  "delivery_person_id": "uuid"
}

# Assigner livreur livraison
POST   /api/admin/commandes/{uuid}/assign-delivery-livraison/
Body: {
  "delivery_person_id": "uuid",
  "date_livraison": "2025-12-30"
}

# Supprimer
DELETE /api/admin/commandes/{uuid}/
```

---

### Livreur Endpoints

```http
# Mes missions
GET    /api/delivery/commandes/
Query: ?date=2025-12-30&type=collecte|livraison

# Détails
GET    /api/delivery/commandes/{uuid}/

# Confirmer collecte
POST   /api/delivery/commandes/{uuid}/confirm-collecte/

# Générer code
POST   /api/delivery/codes-collecte/generate/
Body: { "nombre": 1 }
Response: { "code": "ABC123" }

# Scanner code
POST   /api/delivery/codes-collecte/scan/
Body: {
  "code": "ABC123",
  "commande_produit_id": "uuid"
}

# Confirmer livraison
POST   /api/delivery/commandes/{uuid}/confirm-livraison/
```

---

## 🎬 Exemple complet (Timeline)

```
📅 23/12/2025 15:30 - CLIENT crée commande
  └─ Statut: nouvelle
  └─ Email: Confirmation client + notification admin

📅 23/12/2025 16:00 - ADMIN valide et assigne livreur
  └─ Statut: confirmee
  └─ Email: Assignation livreur

📅 25/12/2025 08:30 - LIVREUR confirme départ
  └─ Statut: en_collecte

📅 25/12/2025 09:00 - Rappel automatique 1h avant
  └─ Email: Rappel collecte client

📅 25/12/2025 10:00 - LIVREUR collecte + scanne codes
  └─ Statut: collectee
  └─ Email: Collecte effectuée

📅 25/12/2025 11:00 - ADMIN met en atelier
  └─ Statut: en_cours
  └─ Email: Arrivée atelier

📅 27/12/2025 14:00 - ADMIN termine réparation
  └─ Statut: prete
  └─ Email: Chaussures prêtes

📅 27/12/2025 14:30 - ADMIN assigne livreur livraison
  └─ Statut: en_livraison
  └─ Email: Assignation livreur livraison

📅 28/12/2025 15:00 - LIVREUR livre chez client
  └─ Statut: terminee
  └─ Email: Livraison effectuée

✅ COMMANDE TERMINÉE
```

---

## 📝 Notes importantes

### Codes de collecte
- Un code unique par paire de chaussures
- Format: 6 caractères alphanumériques majuscules
- Généré par le livreur sur place
- Traçabilité complète avec horodatage

### Créneaux horaires
- Système optionnel (activé/désactivé via `CreneauxConfig`)
- Si activé : client choisit un créneau, capacité limitée
- Si désactivé : client saisit texte libre (ex: "14h-16h")
- Auto-décrémentation si annulation/modification

### Paiements
- Statuts: `en_attente`, `paye`, `echec`, `rembourse`
- Moyens: Wave, Orange Money, PayPal, etc.
- Prix calculés côté serveur (sécurité)

### Emails
- Tous asynchrones via Celery
- Loggés dans `EmailLog`
- Templates HTML responsive
- Retry automatique en cas d'échec (max 3 fois)

---

## 🚀 Démarrage rapide

### Créer une commande (Client)
```bash
curl -X POST http://localhost:8000/api/client/commandes/ \
  -H "Authorization: Bearer <token>" \
  -F "produits[0][description]=Baskets Nike" \
  -F "produits[0][marque]=Nike" \
  -F "produits[0][modele]=Air Max" \
  -F "produits[0][couleur]=Blanc" \
  -F "produits[0][photo]=@photo.jpg" \
  -F "produits[0][services_ids]=[uuid1,uuid2]" \
  -F "moyen_paiement_id=uuid" \
  -F "collecte[adresse]=123 Rue..." \
  -F "collecte[telephone]=+33612345678" \
  -F "collecte[date]=2025-12-30" \
  -F "collecte[creneau_id]=uuid"
```

### Modifier une commande (Admin)
```bash
curl -X PUT http://localhost:8000/api/admin/commandes/{uuid}/ \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "statut_commande": "confirmee",
    "delivery_person_id": "uuid"
  }'
```

---

## 📞 Support

Pour toute question sur le workflow :
- 📧 Email : support@myshoemaker.com
- 📚 Documentation complète : `/Documentations/WORKFLOW-COMMANDE-COMPLET.md`
- 🐛 Issues : GitHub Issues

---

**Dernière mise à jour :** 30 Décembre 2025
