# Module Commande - Système de gestion des commandes

## Vue d'ensemble

Le module `commande` gère l'ensemble du processus de commande dans l'application Shoemaker. Il permet aux clients de créer des commandes en uploadant des photos de leurs chaussures, en sélectionnant des services, et en finalisant le processus de paiement (checkout). Les administrateurs peuvent gérer toutes les commandes, les moyens de paiement et les codes promo.

## Architecture

Le module suit l'architecture DDD (Domain-Driven Design) avec la structure suivante :

```
apps/commande/
├── __init__.py
├── apps.py
├── models.py                           # Modèles de données
├── admin.py                            # Configuration Django Admin
├── application/
│   └── __init__.py
├── domain/
│   └── __init__.py
├── infrastructure/
│   └── __init__.py
├── presentation/
│   ├── __init__.py
│   ├── admin/                          # Endpoints administrateur
│   │   ├── __init__.py
│   │   ├── permissions.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── views.py
│   └── commandes/                      # Endpoints client
│       ├── __init__.py
│       ├── permissions.py
│       ├── serializers.py
│       ├── urls.py
│       └── views.py
└── migrations/
    └── 0001_initial.py
```

## Modèles de données

### 1. MoyenPaiement

Table des moyens de paiement gérée par l'administrateur.

**Champs :**
- `nom` (CharField) : Nom du moyen de paiement (ex: "Carte Bancaire")
- `code` (CharField, unique) : Code unique pour identifier le moyen (ex: "CB", "ESPECES")
- `description` (TextField) : Description détaillée (optionnel)
- `actif` (BooleanField) : Statut d'activation
- `icone` (CharField) : URL ou nom de l'icône à afficher (optionnel)
- `created_at`, `updated_at` : Timestamps automatiques

**Exemple :**
```json
{
  "nom": "Carte Bancaire",
  "code": "CB",
  "description": "Paiement par carte bancaire",
  "actif": true,
  "icone": "credit-card"
}
```

### 2. CodePromo

Table des codes promotionnels avec réduction en pourcentage ou montant fixe.

**Champs :**
- `code` (CharField, unique) : Code promo unique (ex: "NOEL2023")
- `type_reduction` (CharField) : Type de réduction
  - `"pourcentage"` : Réduction en pourcentage
  - `"montant_fixe"` : Réduction en montant fixe
- `valeur` (DecimalField) : Valeur de la réduction (ex: 20 pour 20% ou 20 pour 20FCFA)
- `date_debut` (DateTimeField) : Date de début de validité
- `date_fin` (DateTimeField) : Date de fin de validité
- `actif` (BooleanField) : Statut d'activation
- `created_at`, `updated_at` : Timestamps automatiques

**Méthode :**
- `est_valide()` : Vérifie si le code promo est actuellement valide (actif + dans la période)

**Exemple :**
```json
{
  "code": "NOEL2023",
  "type_reduction": "pourcentage",
  "valeur": 15.00,
  "date_debut": "2023-12-01T00:00:00Z",
  "date_fin": "2023-12-31T23:59:59Z",
  "actif": true
}
```

### 3. Commande

Modèle principal de la commande créée uniquement au moment du checkout.

**Champs :**

**Identification :**
- `code_unique` (CharField, unique) : Code généré automatiquement (format: CMD-YYYY-XXXXXX)
- `user` (ForeignKey) : Utilisateur ayant passé la commande

**Montants financiers (calculés côté serveur) :**
- `montant_ht` (DecimalField) : Montant total hors taxes
- `montant_tva` (DecimalField) : Montant total de la TVA
- `montant_ttc` (DecimalField) : Montant total toutes taxes comprises
- `montant_reduction` (DecimalField) : Montant de la réduction appliquée
- `montant_final` (DecimalField) : Montant final après réduction

**Paiement et statuts :**
- `statut_paiement` (CharField) : Statut du paiement
  - `"en_attente"` : En attente de paiement (défaut)
  - `"paye"` : Payé
  - `"annule"` : Annulé
  - `"rembourse"` : Remboursé
- `moyen_paiement` (ForeignKey) : Moyen de paiement choisi
- `statut_commande` (CharField) : Statut de la commande
  - `"nouvelle"` : Nouvelle commande (défaut)
  - `"confirmee"` : Confirmée
  - `"en_collecte"` : En cours de collecte
  - `"en_cours"` : En cours de traitement
  - `"prete"` : Prête pour livraison
  - `"en_livraison"` : En livraison
  - `"terminee"` : Terminée
  - `"annulee"` : Annulée
- `code_promo` (ForeignKey, nullable) : Code promo appliqué

**Informations de collecte (intégrées dans Commande) :**
- `adresse_collecte` (TextField) : Adresse complète de collecte
- `latitude` (DecimalField, nullable) : Coordonnée GPS latitude
- `longitude` (DecimalField, nullable) : Coordonnée GPS longitude
- `telephone_collecte` (CharField) : Numéro de téléphone de contact
- `date_collecte` (DateField) : Date de collecte prévue
- `creneau_horaire` (CharField) : Créneau horaire (ex: "09h00-12h00")
- `note_collecte` (TextField, nullable) : Note ou instructions supplémentaires

**Timestamps :**
- `created_at`, `updated_at` : Timestamps automatiques

**Méthode :**
- `save()` : Génère automatiquement le `code_unique` si non présent

### 4. CommandeProduit

Snapshot des informations de la chaussure uploadée par l'utilisateur.

**Champs :**
- `commande` (ForeignKey) : Commande associée (related_name='produits')
- `description` (TextField) : Description de la chaussure
- `marque` (CharField) : Marque de la chaussure
- `modele` (CharField) : Modèle de la chaussure
- `couleur` (CharField) : Couleur de la chaussure
- `photo` (ImageField) : Photo uploadée par l'utilisateur (stockage: `commandes/produits/YYYY/MM/`)
- `note_utilisateur` (TextField, nullable) : Note ou commentaire de l'utilisateur
- `prix_ht` (DecimalField) : Prix HT du produit (somme des services)
- `tva` (DecimalField) : Taux de TVA (défaut: 20.00%)
- `prix_ttc` (DecimalField) : Prix TTC du produit
- `created_at`, `updated_at` : Timestamps automatiques

**Note :** Ce modèle représente UN produit (une chaussure) dans une commande. Une commande peut contenir plusieurs produits.

### 5. CommandeProduitService

Snapshot des services appliqués à un produit avec les prix figés au moment de la commande.

**Champs :**
- `commande_produit` (ForeignKey) : Produit associé (related_name='services')
- `service` (ForeignKey) : Référence au service original (pour traçabilité)
- `nom_service` (CharField) : Nom du service (snapshot)
- `prix_ht` (DecimalField) : Prix HT du service au moment de la commande
- `tva` (DecimalField) : Taux de TVA du service au moment de la commande
- `montant_tva` (DecimalField) : Montant de la TVA calculé
- `prix_ttc` (DecimalField) : Prix TTC du service
- `created_at`, `updated_at` : Timestamps automatiques

**Note :** Ce modèle fige les prix des services au moment de la commande pour préserver l'historique exact, même si les prix des services changent ultérieurement.

## Relations entre modèles

```
User (apps.users)
  └─── has many ──> Commande
                       ├─── has one ──> MoyenPaiement
                       ├─── has one (optional) ──> CodePromo
                       └─── has many ──> CommandeProduit
                                           └─── has many ──> CommandeProduitService
                                                                └─── references ──> Service (apps.service)
```

## Endpoints API

### Endpoints CLIENT

Base URL: `/api/client/`

#### 1. Moyens de paiement (lecture seule, accès public)

**Liste des moyens de paiement actifs**
```
GET /api/client/moyens-paiement/
```
- **Permission** : `AllowAny` (accès public)
- **Description** : Récupère tous les moyens de paiement actifs

**Détails d'un moyen de paiement**
```
GET /api/client/moyens-paiement/{id}/
```
- **Permission** : `AllowAny` (accès public)
- **Description** : Récupère les détails d'un moyen de paiement spécifique

**Réponse :**
```json
{
  "id": 1,
  "nom": "Carte Bancaire",
  "code": "CB",
  "description": "Paiement par carte bancaire",
  "icone": "credit-card"
}
```

#### 2. Commandes (authentification requise)

**Liste de mes commandes**
```
GET /api/client/commandes/
```
- **Permission** : `IsAuthenticated` + `IsClient`
- **Description** : Récupère la liste de toutes mes commandes
- **Réponse** : Liste simplifiée avec résumé

**Détails d'une commande**
```
GET /api/client/commandes/{id}/
```
- **Permission** : `IsAuthenticated` + `IsOwnerOrAdmin`
- **Description** : Récupère les détails complets d'une commande
- **Réponse** : Détails complets avec produits et services

**Créer une commande (checkout)**
```
POST /api/client/commandes/checkout/
```
- **Permission** : `IsAuthenticated` + `IsClient`
- **Description** : Créer une nouvelle commande avec produits et services

**Body de la requête :**
```json
{
  "produits": [
    {
      "description": "Chaussure de sport en cuir",
      "marque": "Nike",
      "modele": "Air Max",
      "couleur": "Noir",
      "photo": "<fichier image>",
      "note_utilisateur": "Réparer la semelle gauche",
      "services_ids": [1, 3, 5]
    }
  ],
  "moyen_paiement_id": 1,
  "code_promo": "NOEL2023",
  "collecte": {
    "adresse": "123 Rue de la Paix, 75001 Paris",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "telephone": "+33612345678",
    "date": "2023-12-25",
    "creneau": "09h00-12h00",
    "note": "Sonner à l'interphone"
  }
}
```

**Réponse (201 Created) :**
```json
{
  "id": 42,
  "code_unique": "CMD-2023-123456",
  "montant_ht": 50.00,
  "montant_tva": 10.00,
  "montant_ttc": 60.00,
  "montant_reduction": 9.00,
  "montant_final": 51.00,
  "statut_paiement": "en_attente",
  "moyen_paiement_nom": "Carte Bancaire",
  "statut_commande": "nouvelle",
  "adresse_collecte": "123 Rue de la Paix, 75001 Paris",
  "telephone_collecte": "+33612345678",
  "date_collecte": "2023-12-25",
  "creneau_horaire": "09h00-12h00",
  "note_collecte": "Sonner à l'interphone",
  "produits": [
    {
      "id": 1,
      "description": "Chaussure de sport en cuir",
      "marque": "Nike",
      "modele": "Air Max",
      "couleur": "Noir",
      "photo": "/media/commandes/produits/2023/12/photo.jpg",
      "note_utilisateur": "Réparer la semelle gauche",
      "prix_ht": 50.00,
      "tva": 20.00,
      "prix_ttc": 60.00,
      "services": [
        {
          "id": 1,
          "nom_service": "Ressemelage complet",
          "prix_ht": 30.00,
          "tva": 20.00,
          "montant_tva": 6.00,
          "prix_ttc": 36.00
        }
      ]
    }
  ],
  "created_at": "2023-12-20T10:30:00Z"
}
```

**Annuler une commande**
```
POST /api/client/commandes/{id}/cancel/
```
- **Permission** : `IsAuthenticated` + `IsClient`
- **Description** : Annuler une commande (si le statut le permet)
- **Contraintes** :
  - Impossible si `statut_commande` = "terminee" ou "annulee"
  - Impossible si `statut_paiement` = "paye" (contacter le support)

### Endpoints ADMIN

Base URL: `/api/admin/`

#### 1. Moyens de paiement (CRUD complet)

**Liste des moyens de paiement**
```
GET /api/admin/moyens-paiement/
```

**Créer un moyen de paiement**
```
POST /api/admin/moyens-paiement/
```
**Body :**
```json
{
  "nom": "PayPal",
  "code": "PAYPAL",
  "description": "Paiement en ligne via PayPal",
  "actif": true,
  "icone": "paypal"
}
```

**Modifier un moyen de paiement**
```
PUT /api/admin/moyens-paiement/{id}/
```

**Supprimer un moyen de paiement**
```
DELETE /api/admin/moyens-paiement/{id}/
```

#### 2. Codes promo (CRUD complet)

**Liste des codes promo**
```
GET /api/admin/codes-promo/
```

**Créer un code promo**
```
POST /api/admin/codes-promo/
```
**Body :**
```json
{
  "code": "HIVER2024",
  "type_reduction": "pourcentage",
  "valeur": 20.00,
  "date_debut": "2024-01-01T00:00:00Z",
  "date_fin": "2024-03-31T23:59:59Z",
  "actif": true
}
```

**Modifier un code promo**
```
PUT /api/admin/codes-promo/{id}/
```

**Supprimer un code promo**
```
DELETE /api/admin/codes-promo/{id}/
```

#### 3. Commandes (lecture, modification, statistiques)

**Liste des commandes**
```
GET /api/admin/commandes/
```
**Query parameters :**
- `statut_paiement` : Filtrer par statut de paiement
- `statut_commande` : Filtrer par statut de commande
- `user_id` : Filtrer par utilisateur

**Exemple :**
```
GET /api/admin/commandes/?statut_paiement=paye&statut_commande=en_cours
```

**Détails d'une commande**
```
GET /api/admin/commandes/{id}/
```

**Modifier une commande**
```
PUT /api/admin/commandes/{id}/
```

**Supprimer une commande**
```
DELETE /api/admin/commandes/{id}/
```

**Changer le statut d'une commande**
```
POST /api/admin/commandes/{id}/update_status/
```
**Body :**
```json
{
  "statut_paiement": "paye",
  "statut_commande": "en_cours"
}
```
**Note :** Les deux champs sont optionnels, vous pouvez mettre à jour l'un ou l'autre ou les deux.

**Statistiques des commandes**
```
GET /api/admin/commandes/statistics/
```
**Réponse :**
```json
{
  "total": 150,
  "by_payment_status": {
    "en_attente": 20,
    "paye": 100,
    "annule": 25,
    "rembourse": 5
  },
  "by_command_status": {
    "nouvelle": 15,
    "confirmee": 10,
    "en_collecte": 5,
    "en_cours": 30,
    "prete": 20,
    "en_livraison": 15,
    "terminee": 50,
    "annulee": 5
  },
  "total_revenue": 15500.50
}
```

## Permissions

### Permissions Client

**IsClient**
- Définition : `core.permissions.IsClient`
- Vérifie que l'utilisateur a le rôle `CLIENT`

**IsOwnerOrAdmin**
- Définition : `apps.commande.presentation.commandes.permissions.IsOwnerOrAdmin`
- Vérifie que l'utilisateur est :
  - Le propriétaire de la commande (`obj.user == request.user`), OU
  - Un administrateur (`is_staff` ou rôle `ADMIN`/`SUPERADMIN`)

### Permissions Admin

**IsAdminOrSuperAdmin**
- Définition : `apps.commande.presentation.admin.permissions.IsAdminOrSuperAdmin`
- Vérifie que l'utilisateur a le rôle `ADMIN` ou `SUPERADMIN`

## Logique métier importante

### 1. Calcul des prix (sécurité)

**Principe fondamental : Tous les prix sont calculés côté serveur.**

Le client envoie uniquement :
- Les IDs des services sélectionnés (`services_ids`)
- Les informations descriptives du produit (marque, modèle, etc.)
- La photo

Le serveur :
1. Récupère les services depuis la base de données
2. Vérifie que tous les services existent et sont actifs
3. Calcule le prix HT de chaque service (`service.prix_minimum_ht`)
4. Calcule la TVA de chaque service (`prix_ht * tva / 100`)
5. Calcule le prix TTC de chaque service (`prix_ht + montant_tva`)
6. Fait la somme pour le produit
7. Applique la réduction du code promo si présent
8. Calcule le montant final

**Code extrait (apps/commande/presentation/commandes/views.py:176-192) :**
```python
for service in services:
    service_ht = service.prix_minimum_ht
    service_tva_pct = service.tva
    service_montant_tva = service_ht * (service_tva_pct / 100)
    service_ttc = service_ht + service_montant_tva

    produit_montant_ht += service_ht
    produit_montant_tva += service_montant_tva

    services_data.append({
        'service': service,
        'nom_service': service.nom,
        'prix_ht': service_ht,
        'tva': service_tva_pct,
        'montant_tva': service_montant_tva,
        'prix_ttc': service_ttc
    })
```

### 2. Application du code promo

**Logique (apps/commande/presentation/commandes/views.py:207-213) :**
```python
if code_promo:
    if code_promo.type_reduction == 'pourcentage':
        montant_reduction = montant_ttc_total * (code_promo.valeur / 100)
    else:  # montant_fixe
        montant_reduction = code_promo.valeur

montant_final = montant_ttc_total - montant_reduction
```

**Validations :**
1. Le code promo existe
2. Le code promo est actif (`actif = True`)
3. La date actuelle est entre `date_debut` et `date_fin`

### 3. Snapshot des données

**Pourquoi les snapshots ?**

Les modèles `CommandeProduit` et `CommandeProduitService` enregistrent une copie complète des informations au moment de la commande :

- **Nom du service** : Si l'admin renomme le service "Ressemelage" en "Réparation semelle", l'historique des anciennes commandes conserve "Ressemelage"
- **Prix** : Si les prix des services augmentent, les anciennes commandes conservent les anciens prix
- **TVA** : Si le taux de TVA change, les anciennes commandes conservent l'ancien taux

**Protection des données historiques** : Garantit que les factures et historiques restent exacts et immuables.

### 4. Transaction atomique

**Code (apps/commande/presentation/commandes/views.py:102) :**
```python
@transaction.atomic
def checkout(self, request):
    # ... logique de création de commande
```

**Bénéfices :**
- Si une erreur survient pendant la création de la commande, TOUTES les opérations sont annulées
- Garantit la cohérence des données (pas de commande partielle)
- Évite les incohérences entre `Commande`, `CommandeProduit` et `CommandeProduitService`

### 5. Annulation de commande

**Règles métier (apps/commande/presentation/commandes/views.py:278-289) :**

1. **Impossible d'annuler si** :
   - `statut_commande` = "terminee"
   - `statut_commande` = "annulee"

2. **Impossible d'annuler si** :
   - `statut_paiement` = "paye" (le client doit contacter le support pour un remboursement)

3. **Si autorisé** :
   - Le `statut_commande` est changé en "annulee"
   - Le `statut_paiement` reste inchangé (pour traçabilité)

## Workflow typique

### Côté CLIENT

1. **Préparation du panier (client-side uniquement)**
   - L'utilisateur ajoute des chaussures à son panier (localStorage/Redux)
   - Pour chaque chaussure :
     - Upload de la photo
     - Saisie des informations (marque, modèle, couleur, description)
     - Sélection des services depuis `/api/client/services/`
     - Ajout de notes personnelles

2. **Consultation des moyens de paiement**
   - `GET /api/client/moyens-paiement/`
   - Affichage des moyens disponibles

3. **Application d'un code promo (optionnel)**
   - Le client saisit un code promo
   - Validation côté client (optionnel, pour UX)
   - Validation définitive côté serveur lors du checkout

4. **Checkout**
   - `POST /api/client/commandes/checkout/`
   - Body : tous les produits + moyen de paiement + code promo + informations de collecte
   - Le serveur valide, calcule les prix, et crée la commande
   - Réponse : commande créée avec `code_unique` et tous les détails

5. **Suivi de la commande**
   - `GET /api/client/commandes/` : liste de toutes mes commandes
   - `GET /api/client/commandes/{id}/` : détails d'une commande spécifique

6. **Annulation (si nécessaire)**
   - `POST /api/client/commandes/{id}/cancel/`

### Côté ADMIN

1. **Gestion des moyens de paiement**
   - Créer, modifier, désactiver les moyens de paiement
   - Exemple : ajouter "Chèque", "Virement bancaire"

2. **Gestion des codes promo**
   - Créer des campagnes promotionnelles
   - Définir les périodes de validité
   - Choisir le type de réduction (pourcentage ou montant fixe)

3. **Suivi des commandes**
   - `GET /api/admin/commandes/` : toutes les commandes
   - Filtrage par statut de paiement, statut de commande, ou utilisateur
   - `GET /api/admin/commandes/{id}/` : détails complets

4. **Gestion des statuts**
   - `POST /api/admin/commandes/{id}/update_status/`
   - Mise à jour du statut de paiement (en_attente → paye)
   - Mise à jour du statut de commande (nouvelle → confirmee → en_collecte → en_cours → prete → en_livraison → terminee)

5. **Consultation des statistiques**
   - `GET /api/admin/commandes/statistics/`
   - Vue d'ensemble : nombre total, répartition par statuts, revenu total

6. **Création manuelle de commandes**
   - L'admin peut créer des commandes pour des clients (ex: commandes téléphoniques)
   - `POST /api/admin/commandes/checkout/` (même endpoint que client, mais avec permissions admin)

## Configuration Django Admin

Le module est entièrement intégré dans l'interface Django Admin (`/admin/`).

**Modèles disponibles :**
- MoyenPaiement
- CodePromo
- Commande (avec inlines pour produits et services)
- CommandeProduit
- CommandeProduitService

**Fonctionnalités :**
- Vue en liste avec colonnes personnalisées
- Filtres par statut, date, utilisateur
- Recherche par code unique, nom d'utilisateur
- Édition inline des produits et services dans les détails de commande

## Tests et validation

### Tester le checkout

**1. Créer un moyen de paiement actif :**
```bash
POST /api/admin/moyens-paiement/
{
  "nom": "Carte Bancaire",
  "code": "CB",
  "actif": true
}
```

**2. Créer des services actifs :**
```bash
POST /api/admin/services/
{
  "nom": "Ressemelage complet",
  "prix_minimum_ht": 30.00,
  "tva": 20.00,
  "statut": "actif"
}
```

**3. (Optionnel) Créer un code promo :**
```bash
POST /api/admin/codes-promo/
{
  "code": "TEST10",
  "type_reduction": "pourcentage",
  "valeur": 10.00,
  "date_debut": "2023-01-01T00:00:00Z",
  "date_fin": "2025-12-31T23:59:59Z",
  "actif": true
}
```

**4. Se connecter en tant que CLIENT :**
```bash
POST /api/login/
{
  "username": "client@example.com",
  "password": "password123",
  "context": "CLIENT"
}
```

**5. Créer une commande :**
```bash
POST /api/client/commandes/checkout/
{
  "produits": [
    {
      "description": "Chaussure de sport",
      "marque": "Nike",
      "modele": "Air Max",
      "couleur": "Noir",
      "photo": <fichier>,
      "services_ids": [1]
    }
  ],
  "moyen_paiement_id": 1,
  "code_promo": "TEST10",
  "collecte": {
    "adresse": "123 Rue Test, Paris",
    "telephone": "+33612345678",
    "date": "2024-01-15",
    "creneau": "09h00-12h00"
  }
}
```

### Vérifications

**Vérifier les calculs :**
- `montant_ht` = somme des prix HT de tous les services
- `montant_tva` = somme des montants TVA de tous les services
- `montant_ttc` = `montant_ht` + `montant_tva`
- `montant_reduction` = réduction appliquée selon le code promo
- `montant_final` = `montant_ttc` - `montant_reduction`

**Vérifier les snapshots :**
- Les `CommandeProduitService` doivent avoir les mêmes prix que les `Service` au moment de la création
- Modifier les prix des `Service` ne doit PAS affecter les commandes existantes

## Dépendances

**Apps Django :**
- `core` : Modèle TimeStampedModel, permissions de base, pagination
- `apps.users` : Modèle User, système multi-rôles
- `apps.service` : Modèle Service pour la référence des services

**Packages Python :**
- `django` : Framework web
- `djangorestframework` : API REST
- `drf-spectacular` : Documentation OpenAPI/Swagger
- `Pillow` : Gestion des images (pour ImageField)

## Fichiers importants

| Fichier | Description |
|---------|-------------|
| `models.py` | Tous les modèles de données (MoyenPaiement, CodePromo, Commande, CommandeProduit, CommandeProduitService) |
| `admin.py` | Configuration Django Admin avec inlines |
| `presentation/admin/views.py` | ViewSets admin (CRUD complet + actions) |
| `presentation/admin/serializers.py` | Serializers admin (lecture/écriture complète) |
| `presentation/admin/permissions.py` | Permission IsAdminOrSuperAdmin |
| `presentation/commandes/views.py` | ViewSets client (checkout + liste + annulation) |
| `presentation/commandes/serializers.py` | Serializers client (CheckoutSerializer + output serializers) |
| `presentation/commandes/permissions.py` | Permission IsOwnerOrAdmin |

## URLs disponibles

### Client
```
GET    /api/client/moyens-paiement/
GET    /api/client/moyens-paiement/{id}/
GET    /api/client/commandes/
GET    /api/client/commandes/{id}/
POST   /api/client/commandes/checkout/
POST   /api/client/commandes/{id}/cancel/
```

### Admin
```
GET    /api/admin/moyens-paiement/
POST   /api/admin/moyens-paiement/
GET    /api/admin/moyens-paiement/{id}/
PUT    /api/admin/moyens-paiement/{id}/
DELETE /api/admin/moyens-paiement/{id}/

GET    /api/admin/codes-promo/
POST   /api/admin/codes-promo/
GET    /api/admin/codes-promo/{id}/
PUT    /api/admin/codes-promo/{id}/
DELETE /api/admin/codes-promo/{id}/

GET    /api/admin/commandes/
GET    /api/admin/commandes/{id}/
PUT    /api/admin/commandes/{id}/
DELETE /api/admin/commandes/{id}/
POST   /api/admin/commandes/{id}/update_status/
GET    /api/admin/commandes/statistics/
```

## Sécurité

**1. Calculs serveur uniquement**
- Tous les prix sont calculés côté serveur
- Le client ne peut pas manipuler les montants

**2. Validation stricte**
- Vérification que les services existent et sont actifs
- Vérification que le moyen de paiement existe et est actif
- Vérification que le code promo est valide (actif + dans la période)

**3. Permissions granulaires**
- Les clients ne peuvent voir que leurs propres commandes
- Seuls les admins peuvent voir toutes les commandes et modifier les statuts
- Protection par `IsOwnerOrAdmin` pour les détails de commande

**4. Transactions atomiques**
- Utilisation de `@transaction.atomic` pour garantir la cohérence
- Rollback automatique en cas d'erreur

**5. Protection CSRF**
- Django CSRF protection activée
- JWT pour l'authentification API

## Évolutions futures possibles

**1. Notifications**
- Email de confirmation de commande
- SMS pour rappel de collecte
- Notifications push pour changement de statut

**2. Paiement en ligne**
- Intégration Stripe / PayPal
- Paiement en plusieurs fois
- Remboursements automatiques

**3. Suivi en temps réel**
- Géolocalisation du livreur
- Estimation de l'heure d'arrivée
- Historique des déplacements

**4. Système de facturation**
- Génération PDF de factures
- Numérotation automatique
- Comptabilité intégrée

**5. Analytics avancés**
- Dashboard avec graphiques
- Prévisions de revenus
- Analyse des codes promo les plus utilisés
- Taux de conversion

**6. Programme de fidélité**
- Points de fidélité sur chaque commande
- Récompenses automatiques
- Offres personnalisées

## Support et maintenance

**Logs importants :**
- Créations de commandes : logs dans `checkout()`
- Calculs de prix : tous les calculs sont logués
- Erreurs de validation : exceptions Django REST Framework

**Commandes utiles :**
```bash
# Créer les migrations
python manage.py makemigrations commande

# Appliquer les migrations
python manage.py migrate commande

# Vérifier la structure
python manage.py showmigrations commande

# Créer un superuser pour tester
python manage.py createsuperuser

# Lancer le serveur de développement
python manage.py runserver
```

**En cas de problème :**
1. Vérifier les logs Django
2. Vérifier que tous les services sont actifs
3. Vérifier que le moyen de paiement est actif
4. Vérifier que l'utilisateur a le rôle CLIENT
5. Vérifier que le token JWT est valide

## Conclusion

Le module `commande` est le cœur du système de gestion des commandes de l'application Shoemaker. Il intègre :
- Gestion complète du processus de checkout
- Calculs serveur sécurisés
- Snapshots pour préserver l'historique
- Permissions granulaires
- Interface admin complète
- APIs REST bien documentées

Le système est prêt à être utilisé en production avec toutes les validations et sécurités nécessaires.
