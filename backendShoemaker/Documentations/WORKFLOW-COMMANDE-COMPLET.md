# WORKFLOW COMPLET DE COMMANDE - MY SHOEMAKER APP

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Acteurs du système](#acteurs-du-système)
3. [Modèles impliqués](#modèles-impliqués)
4. [Cycle de vie d'une commande](#cycle-de-vie-dune-commande)
5. [Statuts de commande](#statuts-de-commande)
6. [Scénarios détaillés](#scénarios-détaillés)
7. [Système de créneaux horaires](#système-de-créneaux-horaires)
8. [Codes de collecte](#codes-de-collecte)
9. [Système de paiement](#système-de-paiement)
10. [Codes promotionnels](#codes-promotionnels)
11. [Emails automatiques](#emails-automatiques)
12. [Cas d'erreurs et exceptions](#cas-derreurs-et-exceptions)
13. [API Endpoints](#api-endpoints)
14. [Timeline complète (exemple)](#timeline-complète-exemple)

---

## 🎯 VUE D'ENSEMBLE

Le système de commande de **My Shoemaker App** permet aux clients de commander des services de réparation de chaussures avec **collecte et livraison à domicile**.

### Principe général

1. **Client** : Commande des services de réparation pour ses chaussures
2. **Collecte** : Un livreur vient récupérer les chaussures chez le client
3. **Atelier** : Les chaussures sont réparées dans l'atelier
4. **Livraison** : Un livreur rapporte les chaussures réparées au client

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

## 👥 ACTEURS DU SYSTÈME

### 1. CLIENT
**Rôle** : Utilisateur qui commande les services de réparation

**Permissions** :
- ✅ Créer une commande
- ✅ Consulter ses commandes
- ✅ Suivre le statut de ses commandes (tracking)
- ✅ Annuler une commande (si non payée et statut le permet)
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

## 📦 MODÈLES IMPLIQUÉS

### 1. `Commande` (Commande principale)

```python
class Commande:
    # Identification
    code_unique = "CMD-2025-XXXXXX"  # Auto-généré
    user = ForeignKey(User)  # Client

    # Montants (calculés côté serveur)
    montant_ht = Decimal  # Total HT
    montant_tva = Decimal  # Total TVA
    montant_ttc = Decimal  # Total TTC
    montant_reduction = Decimal  # Réduction du code promo
    montant_final = Decimal  # TTC - réduction

    # Paiement
    statut_paiement = "en_attente" | "paye" | "echec" | "rembourse"
    moyen_paiement = ForeignKey(MoyenPaiement)
    code_promo = ForeignKey(CodePromo, nullable)

    # Statut commande
    statut_commande = "nouvelle" | "confirmee" | "en_collecte" |
                      "collectee" | "en_cours" | "prete" |
                      "en_livraison" | "terminee" | "annulee"

    # COLLECTE
    delivery_person = ForeignKey(DeliveryPerson, nullable)  # Livreur collecte
    adresse_collecte = CharField
    latitude = DecimalField
    longitude = DecimalField
    telephone_collecte = CharField
    date_collecte = DateField  # Date prévue
    creneau = ForeignKey(Creneaux, nullable)  # Créneau sélectionné
    creneau_horaire = CharField  # Texte du créneau (cache ou saisie libre)
    note_collecte = TextField
    rappel_envoye = Boolean  # Rappel 1h avant envoyé ?

    # LIVRAISON
    delivery_person_livraison = ForeignKey(DeliveryPerson, nullable)
    date_livraison = DateField  # Date prévue
    date_livraison_effective = DateTimeField  # Date réelle

    # Timestamps
    created_at = DateTimeField(auto)
    updated_at = DateTimeField(auto)
```

### 2. `CommandeProduit` (Chaussures dans la commande)

```python
class CommandeProduit:
    commande = ForeignKey(Commande)

    # Snapshot des infos uploadées (figé au moment de la commande)
    description = TextField
    marque = CharField
    modele = CharField
    couleur = CharField
    photo = ImageField
    note_utilisateur = TextField

    # Collecte (rempli par le livreur)
    code_collecte = CharField  # Code unique collé sur la paire
    date_collecte_effective = DateTimeField  # Horodatage de la collecte

    # Prix du produit (somme des services)
    prix_ht = Decimal
    tva = Decimal (20.00%)
    prix_ttc = Decimal
```

### 3. `CommandeProduitService` (Services appliqués à une paire)

```python
class CommandeProduitService:
    commande_produit = ForeignKey(CommandeProduit)
    service = ForeignKey(Service)

    # Snapshot des infos du service (figé)
    nom_service = CharField
    description_service = TextField
    prix_ht = Decimal
    tva = Decimal
    montant_tva = Decimal
    prix_ttc = Decimal
```

### 4. `CodeCollecte` (Codes uniques générés)

```python
class CodeCollecte:
    code = CharField(unique=True)  # Ex: "COL-2025-123456"
    genere_par = ForeignKey(User)  # Admin qui a généré
    utilise = Boolean
    date_utilisation = DateTimeField
    commande_produit = ForeignKey(CommandeProduit, nullable)
```

### 5. `MoyenPaiement` (Moyens de paiement disponibles)

```python
class MoyenPaiement:
    nom = CharField  # Ex: "Carte bancaire", "Espèces"
    code = CharField(unique=True)  # Ex: "CB", "CASH"
    description = TextField
    actif = Boolean
    icone = CharField  # Nom de l'icône
```

### 6. `CodePromo` (Codes promotionnels)

```python
class CodePromo:
    code = CharField(unique=True)  # Ex: "NOEL2025"
    description = TextField
    type_reduction = "pourcentage" | "montant_fixe"
    valeur = Decimal  # 10.00 (10%) ou 5.00 (5FCFA)
    date_debut = DateTimeField
    date_fin = DateTimeField
    actif = Boolean

    # Méthode
    def est_valide():
        # Vérifie actif + dates
```

### 7. `Creneaux` (Créneaux horaires)

```python
class Creneaux:
    date = DateField
    heure_debut = TimeField
    heure_fin = TimeField
    duree_limite_minutes = Integer  # Deadline avant début
    capacite_max = Integer
    reservations_actuelles = Integer
    actif = Boolean

    # Méthodes
    def est_disponible():
        # actif + places + deadline

    def incrementer_reservations()
    def decrementer_reservations()
```

### 8. `CreneauxConfig` (Configuration système - Singleton)

```python
class CreneauxConfig:
    actif = Boolean  # Système activé/désactivé
    message_desactivation = TextField
```

### 9. `EmailLog` (Logs de tous les emails envoyés)

```python
class EmailLog:
    type_email = "nouvelle_commande_admin" | "confirmation_commande_client" | ...
    destinataire = EmailField
    sujet = CharField
    contenu_html = TextField
    contenu_text = TextField
    statut = "envoye" | "echec" | "en_attente"
    erreur = TextField
    commande = ForeignKey(Commande, nullable)
    date_envoi = DateTimeField
```

---

## 🔄 CYCLE DE VIE D'UNE COMMANDE

### Vue schématique complète

```
CLIENT                    SYSTÈME                      LIVREUR                 ADMIN
  |                          |                            |                       |
  |--- Checkout ------------>|                            |                       |
  |                          |--- Créer commande          |                       |
  |                          |--- Vérifier créneau        |                       |
  |                          |--- Calculer prix           |                       |
  |                          |--- Appliquer promo         |                       |
  |                          |--- Incrémenter créneau     |                       |
  |                          |                            |                       |
  |<--- Confirmation --------|                            |                       |
  |                          |                            |                       |
  |                          |--- Email client ---------->|                       |
  |                          |--- Email admins ---------------------------------->|
  |                          |                            |                       |
  |                          |                            |                       |<-- Validation
  |                          |                            |                       |
  |                          |                            |                       |--- Assigner livreur
  |                          |                            |<--- Email assignation |
  |                          |                            |                       |
  |                          |<--- Rappel auto 1h avant --|                       |
  |<--- SMS/Email rappel ----|                            |                       |
  |                          |                            |                       |
  |                          |                            |--- Confirme collecte  |
  |                          |                            |                       |
  |                          |                            |--- Arrive chez client |
  |                          |                            |                       |
  |--- Donne chaussures ---->|                            |--- Collecte paires    |
  |                          |                            |                       |
  |                          |                            |--- Génère codes       |
  |                          |                            |--- Colle étiquettes   |
  |                          |                            |--- Scanne codes       |
  |                          |                            |                       |
  |                          |<--- Codes + timestamps ----|                       |
  |                          |                            |                       |
  |<--- Email collectée -----|                            |                       |
  |                          |--- Email admin ------------------------------------->|
  |                          |                            |                       |
  |                          |                            |--- Dépose à atelier   |
  |                          |                            |                       |
  |<--- Email "En atelier" --|                            |                       |
  |                          |                            |                       |
  |                          |                            |                       |--- Réparation
  |                          |                            |                       |
  |                          |                            |                       |--- Statut "prête"
  |                          |                            |                       |
  |                          |                            |                       |--- Assigner livreur
  |                          |                            |<--- Email assignation |
  |                          |                            |                       |
  |                          |                            |--- Récupère à atelier |
  |                          |                            |--- Livre chez client  |
  |                          |                            |                       |
  |<--- Reçoit chaussures ---|                            |--- Confirme livraison |
  |                          |                            |                       |
  |<--- Email terminé -------|                            |                       |
  |                          |--- Email admin ------------------------------------->|
  |                          |                            |                       |
```

---

## 📊 STATUTS DE COMMANDE

### Liste des 9 statuts

| Statut | Description | Qui peut le changer | Actions possibles |
|--------|-------------|---------------------|-------------------|
| `nouvelle` | Commande créée par le client | Système (auto) | Admin : valider, annuler |
| `confirmee` | Admin a validé et assigné un livreur | Admin | Livreur : confirmer collecte |
| `en_collecte` | Livreur se rend chez le client | Livreur | Livreur : confirmer collecte effective |
| `collectee` | Chaussures collectées et codes scannés | Livreur/Système | Admin : changer en "en_cours" |
| `en_cours` | Chaussures à l'atelier, en réparation | Admin | Admin : changer en "prete" |
| `prete` | Réparation terminée, prêt à livrer | Admin | Admin : assigner livreur livraison |
| `en_livraison` | Livreur livre chez le client | Livreur | Livreur : confirmer livraison |
| `terminee` | Chaussures livrées au client | Livreur | (Final) |
| `annulee` | Commande annulée | Client/Admin | (Final) |

### Diagramme de transition

```
                    ┌──────────┐
                    │ nouvelle │
                    └────┬─────┘
                         │ Admin valide + assigne livreur
                         ↓
                    ┌──────────┐
                    │confirmee │
                    └────┬─────┘
                         │ Livreur confirme départ
                         ↓
                  ┌─────────────┐
                  │ en_collecte │
                  └──────┬──────┘
                         │ Livreur scanne codes
                         ↓
                    ┌──────────┐
                    │collectee │
                    └────┬─────┘
                         │ Admin met en atelier
                         ↓
                    ┌──────────┐
                    │ en_cours │
                    └────┬─────┘
                         │ Admin termine réparation
                         ↓
                    ┌──────────┐
                    │   prete  │
                    └────┬─────┘
                         │ Admin assigne livreur livraison
                         ↓
                  ┌─────────────┐
                  │en_livraison │
                  └──────┬──────┘
                         │ Livreur livre et confirme
                         ↓
                    ┌──────────┐
                    │ terminee │
                    └──────────┘

        Annulation possible depuis n'importe quel état (sauf terminee)
                         ↓
                    ┌──────────┐
                    │ annulee  │
                    └──────────┘
```

### Transitions détaillées

#### `nouvelle` → `confirmee`
- **Déclencheur** : Admin valide la commande
- **Actions** :
  - Admin assigne un livreur pour la collecte
  - Email envoyé au livreur
  - Email de confirmation à l'admin

#### `confirmee` → `en_collecte`
- **Déclencheur** : Livreur confirme qu'il se rend chez le client
- **Actions** :
  - Statut mis à jour
  - Email/SMS de rappel au client (si 1h avant le créneau)

#### `en_collecte` → `collectee`
- **Déclencheur** : Livreur scanne le dernier code de collecte
- **Actions** :
  - Tous les codes de collecte sont assignés
  - Toutes les `date_collecte_effective` sont remplies
  - Email de confirmation au client
  - Email d'information à l'admin

#### `collectee` → `en_cours`
- **Déclencheur** : Admin confirme l'arrivée à l'atelier
- **Actions** :
  - Email au client "Vos chaussures sont arrivées à l'atelier"
  - Début du suivi de réparation

#### `en_cours` → `prete`
- **Déclencheur** : Admin termine les réparations
- **Actions** :
  - Email au client "Vos chaussures sont prêtes"
  - Préparation pour la livraison

#### `prete` → `en_livraison`
- **Déclencheur** : Admin assigne un livreur pour la livraison
- **Actions** :
  - Email au livreur avec détails
  - Email au client avec estimation

#### `en_livraison` → `terminee`
- **Déclencheur** : Livreur confirme la livraison
- **Actions** :
  - `date_livraison_effective` remplie
  - Email de satisfaction au client
  - Email de confirmation à l'admin
  - Demande d'avis/témoignage

#### Tout statut → `annulee`
- **Déclencheur** : Client ou Admin annule
- **Conditions** :
  - Client : statut avant "en_cours" + non payé
  - Admin : tous les statuts sauf "terminee"
- **Actions** :
  - Si créneau utilisé : décrémenter les réservations
  - Si paiement effectué : processus de remboursement
  - Email de confirmation d'annulation
  - Libération des ressources (livreur, codes)

---

## 🎬 SCÉNARIOS DÉTAILLÉS

### SCÉNARIO 1 : Commande normale complète (Flux idéal)

#### Contexte
- **Client** : Marie Dubois
- **Email** : marie.dubois@email.com
- **Date** : 23/12/2025 à 15:30
- **Produits** : 2 paires de chaussures
- **Système de créneaux** : ACTIVÉ

#### ÉTAPE 1 : Le client crée sa commande

**1.1 - Marie consulte les services disponibles**
```http
GET /api/client/services/
```

**Réponse :**
```json
{
  "results": [
    {
      "id": 1,
      "nom": "Ressemelage complet",
      "description": "Remplacement complet de la semelle",
      "prix_minimum_ht": "25.00",
      "prix_minimum_ttc": "30.00",
      "actif": true
    },
    {
      "id": 2,
      "nom": "Nettoyage premium",
      "description": "Nettoyage en profondeur",
      "prix_minimum_ht": "15.00",
      "prix_minimum_ttc": "18.00",
      "actif": true
    },
    {
      "id": 3,
      "nom": "Réparation talon",
      "description": "Réparation du talon usé",
      "prix_minimum_ht": "12.00",
      "prix_minimum_ttc": "14.40",
      "actif": true
    }
  ]
}
```

**1.2 - Marie vérifie la configuration des créneaux**
```http
GET /api/client/creneaux/config/
```

**Réponse :**
```json
{
  "actif": true,
  "message_desactivation": null
}
```
→ Marie sait qu'elle doit choisir un créneau dans une liste.

**1.3 - Marie consulte les créneaux disponibles pour le 25/12**
```http
GET /api/client/creneaux/?date=2025-12-25
```

**Réponse :**
```json
{
  "count": 3,
  "results": [
    {
      "id": 10,
      "date": "2025-12-25",
      "heure_debut": "10:00",
      "heure_fin": "12:00",
      "places_restantes": 7,
      "taux_occupation": 30.0,
      "est_disponible": true
    },
    {
      "id": 11,
      "date": "2025-12-25",
      "heure_debut": "14:00",
      "heure_fin": "16:00",
      "places_restantes": 10,
      "taux_occupation": 0.0,
      "est_disponible": true
    },
    {
      "id": 12,
      "date": "2025-12-25",
      "heure_debut": "16:00",
      "heure_fin": "18:00",
      "places_restantes": 2,
      "taux_occupation": 80.0,
      "est_disponible": true
    }
  ]
}
```

**1.4 - Marie vérifie un code promo**
```http
POST /api/client/codespromo/verify/
{
  "code": "NOEL2025"
}
```

**Réponse :**
```json
{
  "valid": true,
  "code_promo": {
    "code": "NOEL2025",
    "type_reduction": "pourcentage",
    "valeur": "10.00",
    "description": "Réduction de Noël 10%"
  },
  "message": "Code promo valide"
}
```

**1.5 - Marie crée sa commande (checkout)**
```http
POST /api/client/commandes/
Content-Type: multipart/form-data

{
  "produits": [
    {
      "description": "Baskets de running blanches",
      "marque": "Nike",
      "modele": "Air Max 90",
      "couleur": "Blanc cassé",
      "photo": <file: nike_air_max.jpg>,
      "services": [1, 2],  // Ressemelage + Nettoyage
      "note_utilisateur": "Petite tache sur le côté gauche"
    },
    {
      "description": "Chaussures de ville en cuir",
      "marque": "Clarks",
      "modele": "Desert Boot",
      "couleur": "Marron",
      "photo": <file: clarks_boot.jpg>,
      "services": [3],  // Réparation talon
      "note_utilisateur": "Le talon gauche est très usé"
    }
  ],
  "moyen_paiement_id": 1,  // Carte bancaire
  "code_promo": "NOEL2025",
  "collecte": {
    "adresse": "123 Rue de Paris, 75001 Paris",
    "latitude": 48.8566,
    "longitude": 2.3522,
    "telephone": "0612345678",
    "date": "2025-12-25",
    "creneau_id": 10,  // Créneau 10:00-12:00
    "note": "Interphone code 1234, 3ème étage gauche"
  }
}
```

**1.6 - Traitement côté serveur (apps/commande/presentation/commandes/views.py)**

```python
# Vérification de la configuration des créneaux
config = CreneauxConfig.get_config()
# → config.actif = True

# Récupération du créneau
creneau = Creneaux.objects.get(id=10)

# Vérification de disponibilité
if not creneau.est_disponible():
    return Response({'error': 'Créneau indisponible'}, 400)

# Vérification cohérence date
if creneau.date != collecte['date']:
    return Response({'error': 'Date incohérente'}, 400)

# Calcul des prix (côté serveur pour sécurité)
# Produit 1 : Ressemelage (25FCFA HT) + Nettoyage (15FCFA HT) = 40FCFA HT
# Produit 2 : Réparation talon (12FCFA HT) = 12FCFA HT
# Total HT : 52FCFA
# TVA (20%) : 10.40FCFA
# Total TTC : 62.40FCFA

# Application code promo (10%)
# Réduction : 6.24FCFA
# Montant final : 56.16FCFA

# Création de la commande
commande = Commande.objects.create(
    user=request.user,  # Marie
    code_unique="CMD-2025-876543",  # Auto-généré
    montant_ht=Decimal("52.00"),
    montant_tva=Decimal("10.40"),
    montant_ttc=Decimal("62.40"),
    montant_reduction=Decimal("6.24"),
    montant_final=Decimal("56.16"),
    statut_paiement="en_attente",
    moyen_paiement=moyen_paiement,
    code_promo=code_promo,
    statut_commande="nouvelle",
    adresse_collecte="123 Rue de Paris, 75001 Paris",
    latitude=48.8566,
    longitude=2.3522,
    telephone_collecte="0612345678",
    date_collecte="2025-12-25",
    creneau=creneau,  # ForeignKey
    creneau_horaire=None,  # Sera rempli par save()
    note_collecte="Interphone code 1234, 3ème étage gauche"
)

# La méthode save() remplit automatiquement creneau_horaire
# → creneau_horaire = "10:00 - 12:00"

# Incrémentation du créneau
creneau.incrementer_reservations()
# → reservations_actuelles passe de 3 à 4

# Création des produits
produit1 = CommandeProduit.objects.create(
    commande=commande,
    description="Baskets de running blanches",
    marque="Nike",
    modele="Air Max 90",
    couleur="Blanc cassé",
    photo="commandes/produits/2025/12/nike_air_max.jpg",
    note_utilisateur="Petite tache sur le côté gauche",
    prix_ht=Decimal("40.00"),
    tva=Decimal("20.00"),
    prix_ttc=Decimal("48.00")
)

produit2 = CommandeProduit.objects.create(
    commande=commande,
    description="Chaussures de ville en cuir",
    marque="Clarks",
    modele="Desert Boot",
    couleur="Marron",
    photo="commandes/produits/2025/12/clarks_boot.jpg",
    note_utilisateur="Le talon gauche est très usé",
    prix_ht=Decimal("12.00"),
    tva=Decimal("20.00"),
    prix_ttc=Decimal("14.40")
)

# Création des services pour produit1
CommandeProduitService.objects.create(
    commande_produit=produit1,
    service=service_ressemelage,
    nom_service="Ressemelage complet",
    description_service="Remplacement complet de la semelle",
    prix_ht=Decimal("25.00"),
    tva=Decimal("20.00"),
    montant_tva=Decimal("5.00"),
    prix_ttc=Decimal("30.00")
)

CommandeProduitService.objects.create(
    commande_produit=produit1,
    service=service_nettoyage,
    nom_service="Nettoyage premium",
    description_service="Nettoyage en profondeur",
    prix_ht=Decimal("15.00"),
    tva=Decimal("20.00"),
    montant_tva=Decimal("3.00"),
    prix_ttc=Decimal("18.00")
)

# Création du service pour produit2
CommandeProduitService.objects.create(
    commande_produit=produit2,
    service=service_talon,
    nom_service="Réparation talon",
    description_service="Réparation du talon usé",
    prix_ht=Decimal("12.00"),
    tva=Decimal("20.00"),
    montant_tva=Decimal("2.40"),
    prix_ttc=Decimal("14.40")
)

# Envoi des emails (asynchrone via Celery)
send_new_commande_notification_to_admins.delay(commande.id)
send_commande_confirmation_to_client.delay(commande.id)
```

**1.7 - Réponse au client**
```json
{
  "id": 42,
  "code_unique": "CMD-2025-876543",
  "statut_commande": "nouvelle",
  "statut_paiement": "en_attente",
  "montant_ht": "52.00",
  "montant_tva": "10.40",
  "montant_ttc": "62.40",
  "montant_reduction": "6.24",
  "montant_final": "56.16",
  "moyen_paiement": {
    "id": 1,
    "nom": "Carte bancaire",
    "code": "CB"
  },
  "code_promo": {
    "code": "NOEL2025",
    "type_reduction": "pourcentage",
    "valeur": "10.00"
  },
  "date_collecte": "2025-12-25",
  "creneau_horaire": "10:00 - 12:00",
  "adresse_collecte": "123 Rue de Paris, 75001 Paris",
  "produits": [
    {
      "id": 101,
      "marque": "Nike",
      "modele": "Air Max 90",
      "couleur": "Blanc cassé",
      "photo": "/media/commandes/produits/2025/12/nike_air_max.jpg",
      "prix_ttc": "48.00",
      "services": [
        {
          "nom_service": "Ressemelage complet",
          "prix_ttc": "30.00"
        },
        {
          "nom_service": "Nettoyage premium",
          "prix_ttc": "18.00"
        }
      ]
    },
    {
      "id": 102,
      "marque": "Clarks",
      "modele": "Desert Boot",
      "couleur": "Marron",
      "photo": "/media/commandes/produits/2025/12/clarks_boot.jpg",
      "prix_ttc": "14.40",
      "services": [
        {
          "nom_service": "Réparation talon",
          "prix_ttc": "14.40"
        }
      ]
    }
  ],
  "created_at": "2025-12-23T15:30:45.123456Z"
}
```

**1.8 - Emails envoyés automatiquement (Celery)**

**Email à Marie (client) :**
```
Objet : ✅ Confirmation de votre commande CMD-2025-876543

Bonjour Marie,

Votre commande a bien été enregistrée !

📦 Numéro de commande : CMD-2025-876543
💰 Montant total : 56.16FCFA (réduction de 6.24FCFA appliquée)
📅 Collecte prévue : 25/12/2025 entre 10:00 et 12:00
📍 Adresse : 123 Rue de Paris, 75001 Paris

Vos chaussures :
1. Nike Air Max 90 (Blanc cassé)
   - Ressemelage complet : 30.00FCFA
   - Nettoyage premium : 18.00FCFA

2. Clarks Desert Boot (Marron)
   - Réparation talon : 14.40FCFA

Un livreur viendra récupérer vos chaussures le 25 décembre.
Vous recevrez un rappel 1h avant.

Suivez votre commande : https://myshoemaker.com/tracking/CMD-2025-876543

Merci de votre confiance !
```

**Email aux admins :**
```
Objet : 🔔 Nouvelle commande CMD-2025-876543

Une nouvelle commande a été créée.

Client : Marie Dubois (marie.dubois@email.com)
Téléphone : 0612345678
Montant : 56.16FCFA
Collecte : 25/12/2025 10:00-12:00
Adresse : 123 Rue de Paris, 75001 Paris

Produits : 2 paires
Services : Ressemelage, Nettoyage, Réparation talon

Action requise : Valider la commande et assigner un livreur

Voir la commande : https://admin.myshoemaker.com/commandes/42
```

**1.9 - État en base de données après création**

**Table `commandes` :**
```
id: 42
code_unique: "CMD-2025-876543"
user_id: 5 (Marie)
montant_final: 56.16
statut_paiement: "en_attente"
statut_commande: "nouvelle"
creneau_id: 10
creneau_horaire: "10:00 - 12:00"
date_collecte: "2025-12-25"
delivery_person_id: NULL
created_at: "2025-12-23 15:30:45"
```

**Table `creneaux` :**
```
id: 10
date: "2025-12-25"
heure_debut: "10:00"
heure_fin: "12:00"
capacite_max: 10
reservations_actuelles: 4  ← +1 (était 3)
actif: true
```

**Table `commande_produit` :**
```
id: 101
commande_id: 42
marque: "Nike"
modele: "Air Max 90"
code_collecte: NULL  ← Sera rempli par le livreur
date_collecte_effective: NULL  ← Sera rempli par le livreur

id: 102
commande_id: 42
marque: "Clarks"
modele: "Desert Boot"
code_collecte: NULL
date_collecte_effective: NULL
```

---

#### ÉTAPE 2 : L'admin valide et assigne un livreur

**Date : 24/12/2025 à 09:00**

**2.1 - L'admin se connecte**
```http
POST /api/login/
{
  "email": "admin@myshoemaker.com",
  "password": "********"
}
```

**2.2 - L'admin consulte les nouvelles commandes**
```http
GET /api/admin/commandes/?statut_commande=nouvelle
```

**Réponse :**
```json
{
  "results": [
    {
      "id": 42,
      "code_unique": "CMD-2025-876543",
      "user": {
        "email": "marie.dubois@email.com",
        "first_name": "Marie",
        "last_name": "Dubois"
      },
      "montant_final": "56.16",
      "statut_commande": "nouvelle",
      "date_collecte": "2025-12-25",
      "creneau_horaire": "10:00 - 12:00",
      "adresse_collecte": "123 Rue de Paris, 75001 Paris"
    }
  ]
}
```

**2.3 - L'admin consulte les livreurs disponibles**
```http
GET /api/admin/delivery-persons/?is_available=true
```

**Réponse :**
```json
{
  "results": [
    {
      "id": 7,
      "user": {
        "first_name": "Jean",
        "last_name": "Martin",
        "email": "jean.martin@delivery.com",
        "phone": "0623456789"
      },
      "is_available": true
    }
  ]
}
```

**2.4 - L'admin assigne Jean et change le statut**
```http
PATCH /api/admin/commandes/42/
{
  "delivery_person_id": 7,
  "statut_commande": "confirmee"
}
```

**2.5 - Actions automatiques du système**

```python
# Mise à jour de la commande
commande.delivery_person = delivery_person_7  # Jean
commande.statut_commande = "confirmee"
commande.save()

# Envoi email au livreur
send_assignation_livreur_notification.delay(commande.id)
```

**2.6 - Email à Jean (livreur) :**
```
Objet : 📦 Nouvelle mission de collecte - CMD-2025-876543

Bonjour Jean,

Vous avez une nouvelle mission de collecte.

📅 Date : 25/12/2025
🕐 Créneau : 10:00 - 12:00
📍 Adresse : 123 Rue de Paris, 75001 Paris
📞 Contact : Marie Dubois - 0612345678

Détails :
- 2 paires à collecter
- Note : Interphone code 1234, 3ème étage gauche

Produits :
1. Nike Air Max 90 (Blanc cassé)
2. Clarks Desert Boot (Marron)

⚠️ N'oubliez pas de :
- Générer un code pour chaque paire
- Coller les étiquettes
- Scanner les codes pour traçabilité

Voir la mission : https://delivery.myshoemaker.com/missions/42
```

**2.7 - État en base après assignation**
```
Table commandes:
  statut_commande: "confirmee"  ← Changé
  delivery_person_id: 7  ← Jean assigné
```

---

#### ÉTAPE 3 : Rappel automatique avant le créneau

**Date : 25/12/2025 à 09:00 (1h avant le créneau 10:00)**

**3.1 - Tâche Celery Beat (automatique toutes les 15 minutes)**

```python
# apps/commande/tasks.py
@periodic_task(run_every=timedelta(minutes=15))
def check_and_send_pickup_reminders():
    """
    Vérifie toutes les commandes avec collecte dans 1h
    et envoie un rappel si pas déjà envoyé.
    """
    now = timezone.now()
    one_hour_later = now + timedelta(hours=1)

    # Commandes confirmées avec collecte dans ~1h et rappel non envoyé
    commandes = Commande.objects.filter(
        statut_commande__in=['confirmee', 'en_collecte'],
        rappel_envoye=False,
        date_collecte=one_hour_later.date()
    )

    for commande in commandes:
        if commande.creneau:
            # Vérifier si dans 1h
            creneau_debut = datetime.combine(
                commande.date_collecte,
                commande.creneau.heure_debut
            )

            if abs((creneau_debut - now).total_seconds()) <= 3600:
                # Envoyer rappel
                send_rappel_collecte.delay(commande.id)

                # Marquer comme envoyé
                commande.rappel_envoye = True
                commande.save()
```

**3.2 - Email/SMS à Marie :**
```
Objet : ⏰ Rappel : Collecte dans 1h

Bonjour Marie,

Rappel : Votre collecte est prévue dans 1 heure.

📦 Commande : CMD-2025-876543
🕐 Créneau : 10:00 - 12:00
📍 Adresse : 123 Rue de Paris, 75001 Paris
👤 Livreur : Jean Martin - 0623456789

Préparez vos chaussures :
1. Nike Air Max 90 (Blanc cassé)
2. Clarks Desert Boot (Marron)

Le livreur vous contactera à son arrivée.

À tout de suite !
```

**3.3 - État en base**
```
Table commandes:
  rappel_envoye: true  ← Changé
```

---

#### ÉTAPE 4 : Le livreur se rend chez le client

**Date : 25/12/2025 à 09:45**

**4.1 - Jean confirme qu'il part en mission**
```http
PATCH /api/delivery/commandes/42/
{
  "statut_commande": "en_collecte"
}
```

**4.2 - Notification au client (optionnel)**
```
SMS à Marie :
Jean est en route pour la collecte.
Arrivée estimée : 10:00
Commande CMD-2025-876543
```

---

#### ÉTAPE 5 : Collecte effective des chaussures

**Date : 25/12/2025 à 10:15 (Jean arrive avec 15 min de retard)**

**5.1 - Jean arrive chez Marie**
- Sonne à l'interphone (code 1234)
- Monte au 3ème étage gauche
- Marie lui donne les 2 paires de chaussures

**5.2 - Jean génère les codes de collecte**

Sur son app mobile, Jean :

1. Scan la commande CMD-2025-876543
2. Voit qu'il y a 2 paires à collecter
3. Pour chaque paire :

**Paire 1 (Nike Air Max) :**
```http
POST /api/delivery/codes-collecte/generate/
{
  "commande_id": 42,
  "produit_id": 101,
  "nombre": 1
}
```

**Réponse :**
```json
{
  "codes": [
    {
      "code": "COL-2025-ABC123",
      "qr_code_url": "/media/qrcodes/COL-2025-ABC123.png"
    }
  ]
}
```

Jean :
- Colle l'étiquette avec QR code sur la paire Nike
- Scanne le code avec son app

```http
POST /api/delivery/codes-collecte/scan/
{
  "code": "COL-2025-ABC123",
  "produit_id": 101
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Code assigné à Nike Air Max 90",
  "produit": {
    "id": 101,
    "marque": "Nike",
    "modele": "Air Max 90",
    "code_collecte": "COL-2025-ABC123",
    "date_collecte_effective": "2025-12-25T10:17:32.456789Z"
  }
}
```

**Côté serveur :**
```python
# apps/commande/presentation/delivery/views.py
produit = CommandeProduit.objects.get(id=101)
produit.code_collecte = "COL-2025-ABC123"
produit.date_collecte_effective = timezone.now()  # 10:17:32
produit.save()

# Marquer le code comme utilisé
code = CodeCollecte.objects.get(code="COL-2025-ABC123")
code.utilise = True
code.date_utilisation = timezone.now()
code.commande_produit = produit
code.save()
```

**Paire 2 (Clarks Desert Boot) - 2 minutes plus tard :**

Jean répète l'opération :
```http
POST /api/delivery/codes-collecte/generate/
{
  "commande_id": 42,
  "produit_id": 102,
  "nombre": 1
}
```

Code généré : `COL-2025-XYZ789`

```http
POST /api/delivery/codes-collecte/scan/
{
  "code": "COL-2025-XYZ789",
  "produit_id": 102
}
```

Horodatage : `2025-12-25T10:19:15.123456Z`

**5.3 - Vérification automatique**

```python
# Le système vérifie si toutes les paires sont collectées
commande = Commande.objects.get(id=42)
produits = commande.produits.all()

all_collected = all(p.code_collecte is not None for p in produits)

if all_collected:
    # Passer au statut "collectee"
    commande.statut_commande = "collectee"
    commande.save()

    # Envoyer emails
    send_collecte_effectuee_to_client.delay(commande.id)
    send_collecte_effectuee_to_admin.delay(commande.id)
```

**5.4 - Email à Marie :**
```
Objet : ✅ Vos chaussures ont été collectées

Bonjour Marie,

Jean a bien collecté vos chaussures.

📦 Commande : CMD-2025-876543
🕐 Collectée le : 25/12/2025 à 10:19
👤 Livreur : Jean Martin

Paires collectées :
1. Nike Air Max 90 - Code : COL-2025-ABC123 (10:17)
2. Clarks Desert Boot - Code : COL-2025-XYZ789 (10:19)

Vos chaussures arrivent à l'atelier.
Vous serez informée dès le début des réparations.

Suivre ma commande : https://myshoemaker.com/tracking/CMD-2025-876543
```

**5.5 - Email à l'admin :**
```
Objet : ✅ Collecte effectuée - CMD-2025-876543

Collecte terminée par Jean Martin.

Commande : CMD-2025-876543
Client : Marie Dubois
Collectée le : 25/12/2025 à 10:19

Codes assignés :
- COL-2025-ABC123 → Nike Air Max 90
- COL-2025-XYZ789 → Clarks Desert Boot

Prochaine étape : Réception à l'atelier

Voir la commande : https://admin.myshoemaker.com/commandes/42
```

**5.6 - État en base après collecte**

**Table `commande_produit` :**
```
id: 101
code_collecte: "COL-2025-ABC123"  ← Rempli
date_collecte_effective: "2025-12-25 10:17:32"  ← Horodatage précis

id: 102
code_collecte: "COL-2025-XYZ789"  ← Rempli
date_collecte_effective: "2025-12-25 10:19:15"  ← Horodatage précis
```

**Table `codes_collecte` :**
```
code: "COL-2025-ABC123"
utilise: true
date_utilisation: "2025-12-25 10:17:32"
commande_produit_id: 101

code: "COL-2025-XYZ789"
utilise: true
date_utilisation: "2025-12-25 10:19:15"
commande_produit_id: 102
```

**Table `commandes` :**
```
statut_commande: "collectee"  ← Changé automatiquement
```

---

#### ÉTAPE 6 : Arrivée à l'atelier

**Date : 25/12/2025 à 14:00**

**6.1 - Jean dépose les chaussures à l'atelier**

L'admin scanne les codes ou change manuellement le statut :

```http
PATCH /api/admin/commandes/42/
{
  "statut_commande": "en_cours"
}
```

**6.2 - Email à Marie :**
```
Objet : 🔧 Vos chaussures sont arrivées à l'atelier

Bonjour Marie,

Vos chaussures sont bien arrivées à notre atelier.

📦 Commande : CMD-2025-876543
🔧 En cours de réparation

Nos artisans vont procéder aux réparations :
1. Nike Air Max 90 → Ressemelage + Nettoyage
2. Clarks Desert Boot → Réparation talon

Vous serez informée dès que vos chaussures seront prêtes.

Temps estimé : 2-3 jours ouvrés
```

**6.3 - État en base**
```
Table commandes:
  statut_commande: "en_cours"  ← En atelier
```

---

#### ÉTAPE 7 : Réparation terminée

**Date : 27/12/2025 à 16:00 (2 jours plus tard)**

**7.1 - L'artisan termine les réparations**

L'admin change le statut :

```http
PATCH /api/admin/commandes/42/
{
  "statut_commande": "prete"
}
```

**7.2 - Email à Marie :**
```
Objet : ✨ Vos chaussures sont prêtes !

Bonjour Marie,

Bonne nouvelle ! Vos chaussures sont prêtes.

📦 Commande : CMD-2025-876543
✅ Réparations terminées le : 27/12/2025

Paires réparées :
1. Nike Air Max 90 → Ressemelage + Nettoyage ✓
2. Clarks Desert Boot → Réparation talon ✓

Un livreur vous contactera prochainement pour convenir
d'un créneau de livraison.

Vous retrouverez vos chaussures comme neuves !
```

**7.3 - État en base**
```
Table commandes:
  statut_commande: "prete"  ← Prêt pour livraison
```

---

#### ÉTAPE 8 : Assignation livreur pour la livraison

**Date : 28/12/2025 à 09:00**

**8.1 - L'admin assigne un livreur pour la livraison**

```http
PATCH /api/admin/commandes/42/
{
  "delivery_person_livraison_id": 7,  // Jean à nouveau
  "date_livraison": "2025-12-29",
  "statut_commande": "en_livraison"
}
```

**8.2 - Email à Jean (livreur) :**
```
Objet : 📦 Nouvelle mission de livraison - CMD-2025-876543

Bonjour Jean,

Vous avez une nouvelle mission de livraison.

📅 Date prévue : 29/12/2025
📍 Adresse : 123 Rue de Paris, 75001 Paris
📞 Contact : Marie Dubois - 0612345678

Produits à livrer :
- 2 paires réparées (codes : COL-2025-ABC123, COL-2025-XYZ789)

⚠️ À récupérer à l'atelier avant livraison

Coordonnez avec le client pour l'heure précise.

Voir la mission : https://delivery.myshoemaker.com/missions/42
```

**8.3 - Email à Marie :**
```
Objet : 🚚 Livraison programmée

Bonjour Marie,

Votre livraison est programmée !

📦 Commande : CMD-2025-876543
📅 Date : 29/12/2025
👤 Livreur : Jean Martin - 0623456789

Jean vous contactera pour convenir de l'heure exacte.

Vos chaussures réparées arrivent bientôt !
```

**8.4 - État en base**
```
Table commandes:
  statut_commande: "en_livraison"  ← En cours de livraison
  delivery_person_livraison_id: 7  ← Jean assigné
  date_livraison: "2025-12-29"
```

---

#### ÉTAPE 9 : Livraison finale

**Date : 29/12/2025 à 15:30**

**9.1 - Jean livre les chaussures chez Marie**

Jean :
- Récupère les chaussures à l'atelier
- Se rend chez Marie
- Remet les chaussures réparées
- Demande confirmation de satisfaction

**9.2 - Jean confirme la livraison**

```http
POST /api/delivery/commandes/42/confirm-delivery/
{
  "notes": "Livraison effectuée. Cliente très satisfaite.",
  "signature": <photo de signature/bon de livraison>
}
```

**Côté serveur :**
```python
commande = Commande.objects.get(id=42)
commande.statut_commande = "terminee"
commande.date_livraison_effective = timezone.now()  # 29/12/2025 15:30
commande.save()

# Envoyer emails
send_livraison_effectuee_to_client.delay(commande.id)
send_livraison_effectuee_to_admin.delay(commande.id)
```

**9.3 - Email à Marie :**
```
Objet : 🎉 Livraison effectuée - Donnez-nous votre avis !

Bonjour Marie,

Vos chaussures ont été livrées avec succès !

📦 Commande : CMD-2025-876543
✅ Livrée le : 29/12/2025 à 15:30
👤 Livreur : Jean Martin

Nous espérons que vous êtes satisfaite de nos services.

🌟 Donnez-nous votre avis :
https://myshoemaker.com/avis/CMD-2025-876543

Votre avis nous aide à nous améliorer !

Merci de votre confiance et à bientôt !

---
My Shoemaker App
L'expert de vos chaussures
```

**9.4 - Email à l'admin :**
```
Objet : ✅ Livraison terminée - CMD-2025-876543

La commande CMD-2025-876543 est terminée.

Client : Marie Dubois
Montant : 56.16FCFA
Livrée le : 29/12/2025 à 15:30
Livreur : Jean Martin

Notes du livreur : Livraison effectuée. Cliente très satisfaite.

Durée totale du processus : 6 jours
(Du 23/12 au 29/12)

Voir la commande : https://admin.myshoemaker.com/commandes/42
```

**9.5 - État final en base**

**Table `commandes` :**
```
id: 42
code_unique: "CMD-2025-876543"
statut_commande: "terminee"  ← FINAL
statut_paiement: "paye"
montant_final: 56.16
date_collecte: "2025-12-25"
date_livraison: "2025-12-29"
date_livraison_effective: "2025-12-29 15:30:00"  ← Horodatage précis
created_at: "2025-12-23 15:30:45"
updated_at: "2025-12-29 15:30:15"
```

**Durée totale :** 6 jours (du 23/12 au 29/12)

---

### SCÉNARIO 2 : Collecte partielle (toutes les paires pas disponibles)

#### Contexte
- Client : Paul Durand
- Commande : 3 paires
- Problème : Le client ne trouve que 2 paires lors de la collecte

#### Workflow

**Étape 1-4 :** Identiques au scénario 1

**Étape 5 : Collecte partielle**

**Date : 25/12/2025 à 10:30**

Jean arrive chez Paul et :
- Collecte paire 1 (Nike) → Code `COL-2025-111111` assigné à 10:32
- Collecte paire 2 (Adidas) → Code `COL-2025-222222` assigné à 10:34
- Paire 3 (Puma) → **Paul ne la trouve pas**

**État en base :**
```
Paire 1: code_collecte = "COL-2025-111111", date_collecte_effective = "2025-12-25 10:32"
Paire 2: code_collecte = "COL-2025-222222", date_collecte_effective = "2025-12-25 10:34"
Paire 3: code_collecte = NULL, date_collecte_effective = NULL
```

**Statut de la commande :**
```
statut_commande: "en_collecte"  ← Reste en collecte (pas toutes collectées)
```

**Email à Paul :**
```
Objet : ⚠️ Collecte partielle - CMD-2025-123456

Bonjour Paul,

Le livreur a collecté 2 paires sur 3.

✅ Nike Air Max - COL-2025-111111
✅ Adidas Superstar - COL-2025-222222
❌ Puma Suede - Non collectée

Le livreur repassera pour la 3ème paire.
Merci de la préparer pour la prochaine visite.

Contact livreur : Jean Martin - 0623456789
```

**Le lendemain : 26/12/2025 à 14:00**

Paul a retrouvé les Puma.
Jean repasse :

```http
POST /api/delivery/codes-collecte/scan/
{
  "code": "COL-2025-333333",
  "produit_id": 103
}
```

**État en base :**
```
Paire 3: code_collecte = "COL-2025-333333", date_collecte_effective = "2025-12-26 14:12"
```

Maintenant toutes les paires sont collectées :
```
statut_commande: "collectee"  ← Passe à collectée
```

**Email de confirmation :**
```
Objet : ✅ Collecte complète - CMD-2025-123456

Bonjour Paul,

Toutes vos chaussures ont été collectées !

✅ Nike Air Max - 25/12 à 10:32
✅ Adidas Superstar - 25/12 à 10:34
✅ Puma Suede - 26/12 à 14:12

Direction l'atelier pour les réparations.
```

---

### SCÉNARIO 3 : Annulation par le client

#### Contexte
- Client : Sophie Martin
- Statut actuel : `confirmee`
- Raison : La cliente a changé d'avis

#### Workflow

**Sophie annule sa commande :**

```http
POST /api/client/commandes/45/cancel/
```

**Vérifications côté serveur :**
```python
commande = Commande.objects.get(id=45)

# Vérifier si annulation possible
if commande.statut_commande in ['terminee', 'annulee']:
    return Response({'error': 'Impossible d\'annuler'}, 400)

if commande.statut_paiement == 'paye':
    return Response({
        'error': 'Commande payée. Contactez le support pour remboursement.'
    }, 400)

# OK, on peut annuler
commande.statut_commande = 'annulee'
commande.save()

# Décrémenter le créneau
if commande.creneau:
    commande.creneau.decrementer_reservations()
    # reservations_actuelles : 5 → 4
```

**Email à Sophie :**
```
Objet : ❌ Commande annulée - CMD-2025-789012

Bonjour Sophie,

Votre commande a été annulée avec succès.

📦 Commande : CMD-2025-789012
❌ Annulée le : 24/12/2025 à 11:30

Vous ne serez pas facturée.

Si vous changez d'avis, n'hésitez pas à créer une nouvelle commande.

À bientôt !
```

**Email à l'admin :**
```
Objet : ⚠️ Commande annulée - CMD-2025-789012

Client : Sophie Martin
Raison : Annulation client
Statut avant annulation : confirmee
Livreur assigné : Jean Martin (à informer)
```

**État en base :**
```
statut_commande: "annulee"
```

**Table `creneaux` :**
```
reservations_actuelles: 4  ← Décrémenté (-1)
```

---

### SCÉNARIO 4 : Système de créneaux DÉSACTIVÉ

#### Contexte
- Admin a désactivé le système de créneaux
- Client : Thomas Blanc

#### Workflow

**1. L'admin désactive le système :**

```http
PATCH /api/admin/creneaux/config/
{
  "actif": false
}
```

**2. Thomas consulte la config :**

```http
GET /api/client/creneaux/config/
```

**Réponse :**
```json
{
  "actif": false,
  "message_desactivation": null
}
```

→ Thomas sait qu'il peut saisir du texte libre.

**3. Thomas crée sa commande :**

```http
POST /api/client/commandes/
{
  "produits": [...],
  "moyen_paiement_id": 1,
  "collecte": {
    "adresse": "456 Avenue Foch, 75016 Paris",
    "telephone": "0654321098",
    "date": "2025-12-27",
    "creneau_texte": "Entre 14h et 16h si possible",  ← Texte libre
    "note": "Appeler avant de venir"
  }
}
```

**Traitement serveur :**

```python
config = CreneauxConfig.get_config()
# config.actif = False

# Pas de vérification de créneau
# Pas d'incrémentation

commande = Commande.objects.create(
    # ...
    creneau=None,  # NULL
    creneau_horaire="Entre 14h et 16h si possible",  # Texte libre
    # ...
)

# PAS d'incrémentation !
```

**État en base :**
```
creneau_id: NULL
creneau_horaire: "Entre 14h et 16h si possible"
```

**Processus identique ensuite** (assignation livreur, collecte, etc.)

---

### SCÉNARIO 5 : Code promo invalide

#### Contexte
- Client : Lisa Moreau
- Code promo : "EXPIRED2024" (expiré)

#### Workflow

**Lisa vérifie le code :**

```http
POST /api/client/codespromo/verify/
{
  "code": "EXPIRED2024"
}
```

**Réponse :**
```json
{
  "valid": false,
  "message": "Ce code promo a expiré le 31/12/2024"
}
```

**Lisa essaie quand même de l'utiliser au checkout :**

```http
POST /api/client/commandes/
{
  "produits": [...],
  "code_promo": "EXPIRED2024",
  "collecte": {...}
}
```

**Réponse d'erreur :**
```json
{
  "error": "Code promo invalide ou expiré",
  "code_promo": ["Le code 'EXPIRED2024' a expiré le 31/12/2024"]
}
```

**La commande n'est PAS créée.**

Lisa doit :
- Soit utiliser un code valide
- Soit ne pas utiliser de code promo

---

### SCÉNARIO 6 : Créneau complet

#### Contexte
- Client : Marc Petit
- Créneau choisi : 10:00-12:00 le 30/12
- Problème : Le créneau atteint sa capacité max pendant le checkout

#### Workflow

**État initial du créneau :**
```
Créneau id=15:
  capacite_max: 10
  reservations_actuelles: 9
  est_disponible(): true  ← 1 place restante
```

**Marc voit le créneau disponible :**

```http
GET /api/client/creneaux/?date=2025-12-30
```

**Réponse :**
```json
{
  "results": [
    {
      "id": 15,
      "date": "2025-12-30",
      "heure_debut": "10:00",
      "heure_fin": "12:00",
      "places_restantes": 1,  ← 1 place !
      "est_disponible": true
    }
  ]
}
```

**Pendant que Marc remplit le formulaire, un autre client (Julie) réserve :**

```python
# Julie crée sa commande en premier
creneau_15.incrementer_reservations()
# reservations_actuelles: 9 → 10 (COMPLET)
```

**Marc essaie de créer sa commande 30 secondes plus tard :**

```http
POST /api/client/commandes/
{
  "produits": [...],
  "collecte": {
    "date": "2025-12-30",
    "creneau_id": 15  ← Créneau maintenant complet
  }
}
```

**Vérification serveur :**
```python
creneau = Creneaux.objects.get(id=15)

if not creneau.est_disponible():
    # reservations_actuelles (10) >= capacite_max (10)
    return Response({
        'error': 'Ce créneau est complet. Veuillez choisir un autre créneau.'
    }, 400)
```

**Réponse d'erreur :**
```json
{
  "error": "Ce créneau est complet. Veuillez choisir un autre créneau.",
  "creneau_id": ["Le créneau sélectionné n'a plus de places disponibles"]
}
```

**La commande n'est PAS créée.**

Marc doit :
1. Recharger la liste des créneaux
2. Choisir un autre créneau disponible
3. Recommencer le checkout

---

### SCÉNARIO 7 : Deadline du créneau dépassée

#### Contexte
- Client : Emma Rousseau
- Créneau : 10:00-12:00 le 31/12
- Durée limite : 30 minutes
- Heure actuelle : 31/12 à 09:35

#### Workflow

**État du créneau :**
```
date: 2025-12-31
heure_debut: 10:00
duree_limite_minutes: 30
→ Heure limite = 10:00 - 30 min = 09:30
```

**Emma essaie de réserver à 09:35 :**

```http
POST /api/client/commandes/
{
  "collecte": {
    "date": "2025-12-31",
    "creneau_id": 20
  }
}
```

**Vérification serveur :**
```python
creneau = Creneaux.objects.get(id=20)

if creneau.est_delai_depasse():
    # now (09:35) >= heure_limite (09:30) → True
    return Response({
        'error': f'Le délai de réservation pour ce créneau est dépassé (limite: 30 minutes avant le début)'
    }, 400)
```

**Réponse d'erreur :**
```json
{
  "error": "Le délai de réservation pour ce créneau est dépassé (limite: 30 minutes avant le début)"
}
```

**Le créneau n'apparaît même plus dans la liste :**

```http
GET /api/client/creneaux/?date=2025-12-31
```

**Réponse :**
```json
{
  "results": []  ← Créneau filtré automatiquement
}
```

Emma doit choisir un autre jour ou un créneau plus tardif.

---

## 📨 EMAILS AUTOMATIQUES

### Liste complète des emails envoyés

| Type | Destinataire | Déclencheur | Contenu |
|------|--------------|-------------|---------|
| `nouvelle_commande_admin` | Tous les admins (avec préférence) | Commande créée | Nouvelle commande à valider |
| `confirmation_commande_client` | Client | Commande créée | Confirmation avec récapitulatif |
| `assignation_livreur` | Livreur assigné | Admin assigne collecte | Mission de collecte |
| `rappel_collecte` | Client | 1h avant créneau | Rappel du RDV |
| `collecte_effectuee_client` | Client | Toutes paires collectées | Confirmation collecte |
| `collecte_effectuee_admin` | Admins | Toutes paires collectées | Info collecte réussie |
| `arrivee_atelier` | Client | Statut → en_cours | Chaussures à l'atelier |
| `assignation_livreur_livraison` | Livreur livraison | Admin assigne livraison | Mission de livraison |
| `livraison_effectuee_client` | Client | Livraison confirmée | Demande d'avis |
| `livraison_effectuee_admin` | Admins | Livraison confirmée | Commande terminée | 

### Configuration des emails

**Fichier : `apps/commande/tasks.py`**

Tous les emails sont envoyés via **Celery tasks** (asynchrone) :

```python
@shared_task(bind=True, max_retries=3)
def send_new_commande_notification_to_admins(self, commande_id):
    """Envoie notification aux admins qui ont activé les notifications."""
    try:
        commande = Commande.objects.get(id=commande_id)

        # Filtrer les admins avec préférence email
        admins = User.objects.filter(
            roles__code='ADMIN',
            recevoir_emails_notifications=True
        )

        for admin in admins:
            # Template HTML + texte
            html_content = render_to_string(
                'emails/nouvelle_commande_admin.html',
                {'commande': commande, 'admin': admin}
            )
            text_content = strip_tags(html_content)

            # Envoi
            send_mail(
                subject=f'🔔 Nouvelle commande {commande.code_unique}',
                message=text_content,
                html_message=html_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[admin.email],
                fail_silently=False
            )

            # Log dans EmailLog
            EmailLog.objects.create(
                type_email='nouvelle_commande_admin',
                destinataire=admin.email,
                sujet=f'Nouvelle commande {commande.code_unique}',
                contenu_html=html_content,
                contenu_text=text_content,
                statut='envoye',
                commande=commande,
                date_envoi=timezone.now()
            )

    except Exception as e:
        # Retry si échec
        self.retry(exc=e, countdown=60)  # Réessayer dans 1 minute
```

### Templates d'emails

**Fichier : `templates/emails/nouvelle_commande_admin.html`**

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: #4CAF50; color: white; padding: 20px; }
        .content { padding: 20px; }
        .produit { border: 1px solid #ddd; padding: 10px; margin: 10px 0; }
        .footer { background: #f5f5f5; padding: 10px; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔔 Nouvelle commande</h1>
        </div>

        <div class="content">
            <h2>{{ commande.code_unique }}</h2>

            <p><strong>Client :</strong> {{ commande.user.get_full_name }}</p>
            <p><strong>Email :</strong> {{ commande.user.email }}</p>
            <p><strong>Téléphone :</strong> {{ commande.telephone_collecte }}</p>
            <p><strong>Montant :</strong> {{ commande.montant_final }}FCFA</p>

            <h3>Collecte</h3>
            <p><strong>Date :</strong> {{ commande.date_collecte }}</p>
            <p><strong>Créneau :</strong> {{ commande.creneau_horaire }}</p>
            <p><strong>Adresse :</strong> {{ commande.adresse_collecte }}</p>

            <h3>Produits ({{ commande.produits.count }} paires)</h3>
            {% for produit in commande.produits.all %}
            <div class="produit">
                <strong>{{ produit.marque }} {{ produit.modele }}</strong> ({{ produit.couleur }})<br>
                Services :
                <ul>
                    {% for service in produit.services.all %}
                    <li>{{ service.nom_service }} - {{ service.prix_ttc }}FCFA</li>
                    {% endfor %}
                </ul>
            </div>
            {% endfor %}

            <p>
                <a href="{{ settings.ADMIN_URL }}/commandes/{{ commande.id }}"
                   style="background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; margin-top: 20px;">
                    Voir la commande
                </a>
            </p>
        </div>

        <div class="footer">
            My Shoemaker App - Admin Panel
        </div>
    </div>
</body>
</html>
```

### Logs d'emails

Tous les emails sont loggés dans la table `email_log` :

```python
class EmailLog:
    type_email = "nouvelle_commande_admin"
    destinataire = "admin@myshoemaker.com"
    sujet = "🔔 Nouvelle commande CMD-2025-876543"
    contenu_html = "<html>...</html>"
    contenu_text = "Nouvelle commande..."
    statut = "envoye" | "echec" | "en_attente"
    erreur = NULL  # Ou message d'erreur
    commande = ForeignKey(Commande)
    date_envoi = "2025-12-23 15:30:50"
    created_at = "2025-12-23 15:30:45"
```

**Interface admin pour consulter les logs :**

`/admin/commande/emaillog/`

- Liste de tous les emails envoyés
- Filtres par type, statut, date
- Prévisualisation HTML
- Recherche par destinataire ou sujet
- Statistiques (taux d'envoi, échecs, etc.)

---

## 💳 SYSTÈME DE PAIEMENT

### Moyens de paiement

**Modèle : `MoyenPaiement`**

```python
class MoyenPaiement:
    nom = "Carte bancaire"
    code = "CB"  # Unique
    description = "Paiement par carte bancaire en ligne"
    actif = True
    icone = "credit-card"
```

**Endpoints :**

```http
# Client - Liste des moyens actifs
GET /api/client/moyens-paiement/

# Admin - CRUD complet
GET    /api/admin/moyens-paiement/
POST   /api/admin/moyens-paiement/
PUT    /api/admin/moyens-paiement/{id}/
DELETE /api/admin/moyens-paiement/{id}/
```

### Statuts de paiement

| Statut | Description |
|--------|-------------|
| `en_attente` | Paiement pas encore effectué |
| `paye` | Paiement confirmé |
| `echec` | Échec du paiement |
| `rembourse` | Commande remboursée |

### Workflow de paiement

**1. Client crée la commande :**
```
statut_paiement: "en_attente"
moyen_paiement: MoyenPaiement(CB)
```

**2. Client est redirigé vers la page de paiement** (externe ou interne)

**3. Webhook de confirmation de paiement :**

```http
POST /api/webhooks/payment-confirmation/
{
  "commande_id": 42,
  "transaction_id": "TXN-123456789",
  "amount": 56.16,
  "status": "success"
}
```

**Traitement :**
```python
commande = Commande.objects.get(id=42)

if webhook_data['status'] == 'success':
    commande.statut_paiement = 'paye'
    commande.save()

    # Email de confirmation
    send_paiement_confirme.delay(commande.id)
else:
    commande.statut_paiement = 'echec'
    commande.save()

    # Email d'échec
    send_paiement_echec.delay(commande.id)
```

**4. Annulation et remboursement :**

Si le client annule une commande payée :

```python
if commande.statut_paiement == 'paye':
    # Initier le remboursement
    payment_gateway.refund(transaction_id)

    commande.statut_paiement = 'rembourse'
    commande.statut_commande = 'annulee'
    commande.save()
```

---

## 🎁 CODES PROMOTIONNELS

### Modèle : `CodePromo`

```python
class CodePromo:
    code = "NOEL2025"  # Unique, case-insensitive
    description = "Réduction de Noël 10%"
    type_reduction = "pourcentage" | "montant_fixe"
    valeur = Decimal("10.00")  # 10% ou 10FCFA
    date_debut = "2025-12-01 00:00:00"
    date_fin = "2025-12-31 23:59:59"
    actif = True

    def est_valide(self):
        now = timezone.now()
        return (
            self.actif and
            self.date_debut <= now <= self.date_fin
        )
```

### Types de réduction

#### 1. Pourcentage

```python
code_promo = CodePromo(
    code="NOEL10",
    type_reduction="pourcentage",
    valeur=Decimal("10.00")  # 10%
)

# Calcul
montant_ttc = Decimal("100.00")
montant_reduction = montant_ttc * (code_promo.valeur / 100)
# → 100 * 0.10 = 10FCFA

montant_final = montant_ttc - montant_reduction
# → 100 - 10 = 90FCFA
```

#### 2. Montant fixe

```python
code_promo = CodePromo(
    code="BIENVENUE5",
    type_reduction="montant_fixe",
    valeur=Decimal("5.00")  # 5FCFA
)

# Calcul
montant_ttc = Decimal("30.00")
montant_reduction = code_promo.valeur
# → 5FCFA

montant_final = montant_ttc - montant_reduction
# → 30 - 5 = 25FCFA
```

### Vérification de validité

**Endpoint client :**

```http
POST /api/client/codespromo/verify/
{
  "code": "NOEL2025"
}
```

**Réponses possibles :**

**Cas 1 : Code valide**
```json
{
  "valid": true,
  "code_promo": {
    "code": "NOEL2025",
    "type_reduction": "pourcentage",
    "valeur": "10.00",
    "description": "Réduction de Noël 10%"
  },
  "message": "Code promo valide"
}
```

**Cas 2 : Code inexistant**
```json
{
  "valid": false,
  "message": "Code promo invalide"
}
```

**Cas 3 : Code expiré**
```json
{
  "valid": false,
  "message": "Ce code promo a expiré le 31/12/2024"
}
```

**Cas 4 : Code pas encore actif**
```json
{
  "valid": false,
  "message": "Ce code promo sera actif à partir du 01/12/2025"
}
```

**Cas 5 : Code désactivé**
```json
{
  "valid": false,
  "message": "Ce code promo n'est plus actif"
}
```

### Application lors du checkout

```python
# Dans la vue de checkout
if code_promo_str:
    try:
        code_promo = CodePromo.objects.get(code__iexact=code_promo_str)

        if not code_promo.est_valide():
            return Response({
                'error': 'Code promo invalide ou expiré'
            }, 400)

        # Calcul de la réduction
        if code_promo.type_reduction == 'pourcentage':
            montant_reduction = montant_ttc_total * (code_promo.valeur / 100)
        else:  # montant_fixe
            montant_reduction = code_promo.valeur

        # Vérifier que la réduction ne dépasse pas le montant
        if montant_reduction > montant_ttc_total:
            montant_reduction = montant_ttc_total

    except CodePromo.DoesNotExist:
        return Response({
            'error': 'Code promo invalide'
        }, 400)
else:
    montant_reduction = Decimal('0.00')

montant_final = montant_ttc_total - montant_reduction
```

### Gestion admin

```http
# Liste des codes promo
GET /api/admin/codes-promo/

# Créer un code promo
POST /api/admin/codes-promo/
{
  "code": "PRINTEMPS25",
  "description": "Réduction printemps 25%",
  "type_reduction": "pourcentage",
  "valeur": "25.00",
  "date_debut": "2025-03-20T00:00:00Z",
  "date_fin": "2025-06-21T23:59:59Z",
  "actif": true
}

# Modifier un code promo
PUT /api/admin/codes-promo/5/
{
  "actif": false  # Désactiver
}

# Supprimer un code promo
DELETE /api/admin/codes-promo/5/
```

---

## 🔖 CODES DE COLLECTE

### Principe

Chaque **paire de chaussures** reçoit un **code unique** lors de la collecte pour :
- ✅ Traçabilité individuelle
- ✅ Éviter les erreurs de manipulation
- ✅ Preuve de prise en charge
- ✅ Suivi en temps réel

### Modèle : `CodeCollecte`

```python
class CodeCollecte:
    code = "COL-2025-ABC123"  # Unique
    genere_par = ForeignKey(User)  # Admin qui a généré
    utilise = False  # Devient True quand assigné
    date_utilisation = NULL  # Timestamp d'assignation
    commande_produit = NULL  # Paire associée (quand utilisé)
    created_at = "2025-12-20 10:00:00"
```

### Génération des codes

**Option 1 : Génération en masse par admin**

```http
POST /api/admin/codes-collecte/generate-bulk/
{
  "nombre": 100
}
```

**Réponse :**
```json
{
  "message": "100 codes générés avec succès",
  "codes": [
    "COL-2025-ABC123",
    "COL-2025-ABC124",
    "COL-2025-ABC125",
    ...
  ]
}
```

**Option 2 : Génération à la demande par livreur**

```http
POST /api/delivery/codes-collecte/generate/
{
  "commande_id": 42,
  "produit_id": 101,
  "nombre": 1
}
```

**Réponse :**
```json
{
  "codes": [
    {
      "code": "COL-2025-XYZ789",
      "qr_code_url": "/media/qrcodes/COL-2025-XYZ789.png"
    }
  ]
}
```

### Format du code

```
COL-YYYY-XXXXXX

COL = Collecte
YYYY = Année
XXXXXX = 6 caractères alphanumériques aléatoires
```

**Génération :**
```python
import random
import string

def generer_code_collecte():
    year = timezone.now().year
    random_part = ''.join(
        random.choices(
            string.ascii_uppercase + string.digits,
            k=6
        )
    )
    return f"COL-{year}-{random_part}"
```

### QR Code

Chaque code a un **QR Code** associé :

```python
import qrcode
from io import BytesIO
from django.core.files import File

def generate_qr_code(code_text):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(code_text)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Sauvegarder dans media/qrcodes/
    buffer = BytesIO()
    img.save(buffer, format='PNG')

    return File(buffer, name=f'{code_text}.png')
```

### Workflow complet

**1. Génération (avant ou pendant la collecte) :**

```python
code = CodeCollecte.objects.create(
    code="COL-2025-ABC123",
    genere_par=request.user,  # Admin ou livreur
    utilise=False
)

# Générer le QR code
qr_file = generate_qr_code(code.code)
code.qr_code.save(f'{code.code}.png', qr_file)
```

**2. Attribution à une paire (pendant la collecte) :**

Le livreur scanne ou saisit le code :

```http
POST /api/delivery/codes-collecte/scan/
{
  "code": "COL-2025-ABC123",
  "produit_id": 101
}
```

**Traitement :**
```python
code = CodeCollecte.objects.get(code="COL-2025-ABC123")

if code.utilise:
    return Response({
        'error': 'Ce code a déjà été utilisé'
    }, 400)

produit = CommandeProduit.objects.get(id=101)

if produit.code_collecte:
    return Response({
        'error': 'Cette paire a déjà un code assigné'
    }, 400)

# Assigner le code
produit.code_collecte = code.code
produit.date_collecte_effective = timezone.now()
produit.save()

# Marquer le code comme utilisé
code.utilise = True
code.date_utilisation = timezone.now()
code.commande_produit = produit
code.save()

# Vérifier si toutes les paires de la commande sont collectées
commande = produit.commande
if all(p.code_collecte for p in commande.produits.all()):
    commande.statut_commande = 'collectee'
    commande.save()

    # Emails
    send_collecte_effectuee_to_client.delay(commande.id)
```

**3. Impression des étiquettes :**

Les livreurs peuvent imprimer des **étiquettes** avec :
- Le code (texte)
- Le QR code (pour scan rapide)
- Le numéro de commande
- Les infos de la paire

```http
GET /api/delivery/codes-collecte/COL-2025-ABC123/etiquette.pdf
```

**Génération PDF :**
```python
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

def generate_etiquette_pdf(code):
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=A4)

    # Code texte
    p.setFont("Helvetica-Bold", 16)
    p.drawString(100, 800, f"Code: {code.code}")

    # QR Code (image)
    p.drawImage(
        code.qr_code.path,
        100, 600,
        width=200,
        height=200
    )

    # Infos commande (si assigné)
    if code.commande_produit:
        p.setFont("Helvetica", 12)
        p.drawString(100, 550, f"Commande: {code.commande_produit.commande.code_unique}")
        p.drawString(100, 530, f"Paire: {code.commande_produit.marque} {code.commande_produit.modele}")

    p.showPage()
    p.save()

    return buffer.getvalue()
```

### Traçabilité

**Consulter l'historique d'un code :**

```http
GET /api/admin/codes-collecte/COL-2025-ABC123/
```

**Réponse :**
```json
{
  "code": "COL-2025-ABC123",
  "genere_par": {
    "id": 3,
    "email": "admin@myshoemaker.com",
    "first_name": "Admin",
    "last_name": "Principal"
  },
  "utilise": true,
  "date_utilisation": "2025-12-25T10:17:32.456789Z",
  "commande_produit": {
    "id": 101,
    "commande": "CMD-2025-876543",
    "marque": "Nike",
    "modele": "Air Max 90",
    "couleur": "Blanc cassé"
  },
  "created_at": "2025-12-24T09:00:00Z",
  "qr_code_url": "/media/qrcodes/COL-2025-ABC123.png"
}
```

**Voir tous les codes d'une commande :**

```http
GET /api/admin/commandes/42/codes-collecte/
```

**Réponse :**
```json
{
  "commande": "CMD-2025-876543",
  "codes": [
    {
      "code": "COL-2025-ABC123",
      "produit": "Nike Air Max 90",
      "date_assignation": "2025-12-25T10:17:32Z"
    },
    {
      "code": "COL-2025-XYZ789",
      "produit": "Clarks Desert Boot",
      "date_assignation": "2025-12-25T10:19:15Z"
    }
  ]
}
```

---

## 🔍 SYSTÈME DE CRÉNEAUX HORAIRES

*Voir la documentation dédiée au début du fichier pour les détails complets.*

### Résumé rapide

**Configuration :**
- Singleton `CreneauxConfig`
- `actif` = True/False

**Quand ACTIVÉ :**
- Client DOIT choisir un créneau prédéfini
- Validation stricte (disponibilité, capacité, deadline)
- Incrémentation/décrémentation automatique

**Quand DÉSACTIVÉ :**
- Client saisit texte libre
- Pas de validation
- Pas de compteurs

**Champs dans Commande :**
- `creneau` (ForeignKey) → NULL si désactivé
- `creneau_horaire` (CharField) → Cache ou texte libre

---

## 📍 API ENDPOINTS

### Client

#### Authentification
```
POST   /api/login/                    # Login
POST   /api/token/refresh/            # Refresh JWT
POST   /api/client/register/          # Inscription
POST   /api/client/verify-otp/        # Vérifier OTP
POST   /api/client/resend-otp/        # Renvoyer OTP
POST   /api/client/logout/            # Déconnexion
```

#### Profil
```
GET    /api/client/profile/           # Mon profil
PUT    /api/client/profile/           # Modifier profil
PATCH  /api/client/profile/           # Modifier partiel
```

#### Services
```
GET    /api/client/services/          # Liste services actifs
GET    /api/client/services/{id}/     # Détails service
```

#### Créneaux
```
GET    /api/client/creneaux/          # Liste créneaux disponibles
GET    /api/client/creneaux/{id}/     # Détails créneau
GET    /api/client/creneaux/config/   # Config système créneaux
```

#### Codes promo
```
GET    /api/client/codespromo/        # Liste codes actifs
POST   /api/client/codespromo/verify/ # Vérifier validité
```

#### Moyens de paiement
```
GET    /api/client/moyens-paiement/   # Liste moyens actifs
```

#### Commandes
```
GET    /api/client/commandes/         # Mes commandes
POST   /api/client/commandes/         # Créer (checkout)
GET    /api/client/commandes/{id}/    # Détails
GET    /api/client/commandes/{id}/tracking/  # Suivi
POST   /api/client/commandes/{id}/cancel/    # Annuler
```

### Livreur (Delivery)

#### Authentification
```
POST   /api/delivery/register/        # Inscription
POST   /api/delivery/verify-otp/      # Vérifier OTP
POST   /api/delivery/logout/          # Déconnexion
```

#### Profil
```
GET    /api/delivery/profile/         # Mon profil
PUT    /api/delivery/profile/         # Modifier profil
```

#### Missions
```
GET    /api/delivery/commandes/       # Mes missions
GET    /api/delivery/commandes/{id}/  # Détails mission
PATCH  /api/delivery/commandes/{id}/  # Mettre à jour statut
```

#### Codes de collecte
```
POST   /api/delivery/codes-collecte/generate/  # Générer codes
POST   /api/delivery/codes-collecte/scan/      # Scanner code
GET    /api/delivery/codes-collecte/{code}/etiquette.pdf  # Étiquette PDF
```

#### Livraison
```
POST   /api/delivery/commandes/{id}/confirm-delivery/  # Confirmer livraison
```

### Admin

#### Utilisateurs
```
GET    /api/admin/users/              # Liste users
POST   /api/admin/users/              # Créer user
GET    /api/admin/users/{id}/         # Détails
PUT    /api/admin/users/{id}/         # Modifier
DELETE /api/admin/users/{id}/         # Supprimer
```

#### Livreurs
```
GET    /api/admin/delivery-persons/   # Liste livreurs
POST   /api/admin/delivery-persons/   # Créer
GET    /api/admin/delivery-persons/{id}/
PUT    /api/admin/delivery-persons/{id}/
DELETE /api/admin/delivery-persons/{id}/
```

#### Services
```
GET    /api/admin/services/           # Liste tous
POST   /api/admin/services/           # Créer
GET    /api/admin/services/{id}/
PUT    /api/admin/services/{id}/
DELETE /api/admin/services/{id}/
```

#### Créneaux
```
GET    /api/admin/creneaux/           # Liste tous
POST   /api/admin/creneaux/           # Créer
GET    /api/admin/creneaux/{id}/
PUT    /api/admin/creneaux/{id}/
DELETE /api/admin/creneaux/{id}/
GET    /api/admin/creneaux/statistics/        # Stats
POST   /api/admin/creneaux/{id}/toggle_actif/ # Activer/désactiver
```

#### Configuration créneaux
```
GET    /api/admin/creneaux/config/    # Config
PATCH  /api/admin/creneaux/config/    # Modifier partiel
PUT    /api/admin/creneaux/config/    # Remplacer
```

#### Commandes
```
GET    /api/admin/commandes/          # Liste toutes
POST   /api/admin/commandes/          # Créer
GET    /api/admin/commandes/{id}/
PUT    /api/admin/commandes/{id}/
PATCH  /api/admin/commandes/{id}/     # Modifier (assigner livreur, changer statut)
DELETE /api/admin/commandes/{id}/
```

#### Moyens de paiement
```
GET    /api/admin/moyens-paiement/
POST   /api/admin/moyens-paiement/
GET    /api/admin/moyens-paiement/{id}/
PUT    /api/admin/moyens-paiement/{id}/
DELETE /api/admin/moyens-paiement/{id}/
```

#### Codes promo
```
GET    /api/admin/codes-promo/
POST   /api/admin/codes-promo/
GET    /api/admin/codes-promo/{id}/
PUT    /api/admin/codes-promo/{id}/
DELETE /api/admin/codes-promo/{id}/
```

#### Codes de collecte
```
GET    /api/admin/codes-collecte/
POST   /api/admin/codes-collecte/generate-bulk/  # Génération masse
GET    /api/admin/codes-collecte/{code}/
```

---

## ⏱️ TIMELINE COMPLÈTE (EXEMPLE)

### Commande CMD-2025-876543

```
📅 23/12/2025

15:30:00 → CLIENT crée la commande
           - Upload photos des chaussures
           - Sélectionne services
           - Choisit créneau 10:00-12:00 le 25/12
           - Applique code promo NOEL2025
           - Statut: nouvelle

15:30:05 → SYSTÈME calcule le prix
           - HT: 52FCFA
           - TVA: 10.40FCFA
           - TTC: 62.40FCFA
           - Réduction: -6.24FCFA
           - Final: 56.16FCFA

15:30:10 → SYSTÈME incrémente le créneau
           - Réservations: 3 → 4

15:30:15 → CELERY envoie emails
           - Email à Marie (client)
           - Email aux admins

📅 24/12/2025

09:00:00 → ADMIN consulte les nouvelles commandes
           - Voit CMD-2025-876543

09:05:00 → ADMIN assigne Jean (livreur)
           - Statut: nouvelle → confirmee

09:05:10 → CELERY envoie email à Jean
           - Mission de collecte

📅 25/12/2025

09:00:00 → CELERY BEAT vérifie les rappels
           - Détecte collecte dans 1h

09:00:05 → CELERY envoie rappel à Marie
           - SMS + Email

09:45:00 → JEAN confirme départ
           - Statut: confirmee → en_collecte

10:15:00 → JEAN arrive chez Marie
           - Récupère les 2 paires

10:17:00 → JEAN génère code pour paire 1 (Nike)
           - Code: COL-2025-ABC123

10:17:32 → JEAN scanne le code
           - Code assigné à paire 1
           - date_collecte_effective = 10:17:32

10:19:00 → JEAN génère code pour paire 2 (Clarks)
           - Code: COL-2025-XYZ789

10:19:15 → JEAN scanne le code
           - Code assigné à paire 2
           - date_collecte_effective = 10:19:15

10:19:20 → SYSTÈME détecte collecte complète
           - Statut: en_collecte → collectee

10:19:25 → CELERY envoie emails
           - Email à Marie (collecte OK)
           - Email à l'admin

14:00:00 → JEAN dépose à l'atelier
           - Admin scanne les codes

14:00:05 → ADMIN change le statut
           - Statut: collectee → en_cours

14:00:10 → CELERY envoie email à Marie
           - "Vos chaussures à l'atelier"

📅 27/12/2025

16:00:00 → ARTISAN termine les réparations
           - Admin change le statut

16:00:05 → ADMIN met le statut "prête"
           - Statut: en_cours → prete

16:00:10 → CELERY envoie email à Marie
           - "Vos chaussures sont prêtes"

📅 28/12/2025

09:00:00 → ADMIN assigne Jean pour livraison
           - Statut: prete → en_livraison
           - Date livraison: 29/12

09:00:05 → CELERY envoie emails
           - Email à Jean (mission livraison)
           - Email à Marie (livraison programmée)

📅 29/12/2025

15:30:00 → JEAN livre les chaussures chez Marie
           - Marie vérifie et signe

15:30:15 → JEAN confirme la livraison
           - Statut: en_livraison → terminee
           - date_livraison_effective = 15:30:15

15:30:20 → CELERY envoie emails
           - Email à Marie (demande d'avis)
           - Email à l'admin (commande terminée)

═══════════════════════════════════════════════════════════

DURÉE TOTALE: 6 jours (23/12 → 29/12)

STATUTS PARCOURUS:
  nouvelle (23/12 15:30)
    ↓
  confirmee (24/12 09:05)
    ↓
  en_collecte (25/12 09:45)
    ↓
  collectee (25/12 10:19)
    ↓
  en_cours (25/12 14:00)
    ↓
  prete (27/12 16:00)
    ↓
  en_livraison (28/12 09:00)
    ↓
  terminee (29/12 15:30) ✅

EMAILS ENVOYÉS: 10
  - 3 à Marie (client)
  - 4 aux admins
  - 3 à Jean (livreur)

CODES GÉNÉRÉS: 2
  - COL-2025-ABC123 (Nike)
  - COL-2025-XYZ789 (Clarks)
```

---

## ❌ CAS D'ERREURS ET EXCEPTIONS

### 1. Créneau complet pendant le checkout

**Erreur :**
```json
{
  "error": "Ce créneau est complet. Veuillez choisir un autre créneau.",
  "code": "CRENEAU_COMPLET"
}
```

**Solution :** Recharger les créneaux et choisir un autre

### 2. Deadline du créneau dépassée

**Erreur :**
```json
{
  "error": "Le délai de réservation pour ce créneau est dépassé (limite: 30 minutes avant le début)",
  "code": "DEADLINE_DEPASSEE"
}
```

**Solution :** Choisir un créneau ultérieur

### 3. Code promo invalide

**Erreur :**
```json
{
  "error": "Code promo invalide ou expiré",
  "code_promo": ["Le code 'EXPIRED2024' a expiré le 31/12/2024"]
}
```

**Solution :** Utiliser un code valide ou continuer sans code

### 4. Service inexistant ou inactif

**Erreur :**
```json
{
  "error": "Service invalide",
  "services": ["Le service avec l'ID 999 n'existe pas ou est inactif"]
}
```

**Solution :** Recharger la liste des services

### 5. Annulation impossible

**Erreur :**
```json
{
  "error": "Cette commande ne peut pas être annulée",
  "raison": "Statut 'terminee' ou commande déjà payée"
}
```

**Solution :** Contacter le support

### 6. Code de collecte déjà utilisé

**Erreur :**
```json
{
  "error": "Ce code a déjà été utilisé",
  "code": "COL-2025-ABC123",
  "utilise_pour": {
    "commande": "CMD-2025-111111",
    "produit": "Nike Air Jordan"
  }
}
```

**Solution :** Générer un nouveau code

### 7. Paire déjà collectée

**Erreur :**
```json
{
  "error": "Cette paire a déjà un code assigné",
  "produit_id": 101,
  "code_existant": "COL-2025-ABC123"
}
```

**Solution :** Vérifier ou réassigner si nécessaire

### 8. Système de créneaux mal configuré

**Erreur :**
```json
{
  "error": "Le choix d'un créneau horaire est requis",
  "creneau_id": ["Ce champ est obligatoire lorsque le système de créneaux est activé"]
}
```

**Solution :** Vérifier la config et choisir un créneau

### 9. Montant final négatif

**Erreur :**
```json
{
  "error": "Montant invalide",
  "detail": "La réduction ne peut pas dépasser le montant total"
}
```

**Solution :** Le système limite automatiquement la réduction au montant TTC

### 10. Échec d'envoi email

**Logged dans EmailLog :**
```python
EmailLog:
  statut = "echec"
  erreur = "SMTPException: Connection refused"
  date_envoi = NULL
```

**Action :** Celery retry automatique (max 3 fois)

---

## 📚 RÉSUMÉ

### Points clés du système

✅ **Workflow complet** : 9 statuts de "nouvelle" à "terminee"
✅ **Double livraison** : Collecte + Livraison finale
✅ **Traçabilité** : Codes uniques par paire avec horodatage
✅ **Système de créneaux** : Optionnel, avec capacité limitée
✅ **Codes promotionnels** : Pourcentage ou montant fixe
✅ **Emails automatiques** : 10 types d'emails via Celery
✅ **Sécurité** : Calcul prix côté serveur
✅ **Flexibilité** : Collecte partielle possible
✅ **Logs complets** : Tous les emails loggés
✅ **Multi-acteurs** : Client, Livreur, Admin

### Technologies utilisées

- **Backend** : Django 4.x + Django REST Framework
- **BDD** : PostgreSQL
- **Cache** : Redis
- **Queue** : Celery + Celery Beat
- **Email** : SMTP + Templates HTML
- **Auth** : JWT (SimpleJWT)
- **Upload** : Photos chaussures (ImageField)
- **QR Codes** : python-qrcode
- **PDF** : ReportLab

---

## 🎯 PROCHAINES ÉTAPES

Pour aller plus loin, consultez :

1. **README_ADMIN_API.md** - Documentation complète API Admin
2. **ARCHITECTURE.md** - Architecture technique du projet
3. **CELERY_GUIDE_DEBUTANT.md** - Guide Celery et tâches asynchrones
4. **JWT_BLACKLIST_README.md** - Système d'authentification JWT

---

**Document créé le : 24/12/2025**
**Version : 1.0**
**Auteur : My Shoemaker App - Backend Team**
