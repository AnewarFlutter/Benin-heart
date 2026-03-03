# 📚 Guide d'Architecture pour Débutants - Backend Shoemaker

## 🎯 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Structure du projet](#structure-du-projet)
3. [L'architecture en 4 couches](#larchitecture-en-4-couches)
4. [Le flux d'une requête HTTP](#le-flux-dune-requête-http)
5. [Comment créer un nouveau module](#comment-créer-un-nouveau-module)
6. [Exemples concrets](#exemples-concrets)
7. [Technologies utilisées](#technologies-utilisées)
8. [Commandes utiles](#commandes-utiles)

---

## 🌟 Vue d'ensemble

Ce projet est une **API REST** construite avec **Django** et **Django REST Framework**. Il suit une architecture **Clean Architecture** (Architecture Propre) qui sépare le code en 4 couches distinctes.

### Qu'est-ce que la Clean Architecture ?

C'est une manière d'organiser le code pour :
- ✅ Séparer la logique métier (business) du framework (Django)
- ✅ Rendre le code facile à tester
- ✅ Permettre de changer de technologie facilement (par exemple, passer de Django à FastAPI)
- ✅ Garder le code organisé et maintenable

### Analogie simple

Imaginez une pizzeria :

```
┌────────────────────────────────────────────────┐
│  SERVEUR (Presentation)                        │  ← Prend la commande du client
│  - Accueille le client                         │
│  - Vérifie que la commande est correcte       │
└────────────────┬───────────────────────────────┘
                 ↓
┌────────────────────────────────────────────────┐
│  CHEF (Application)                            │  ← Coordonne la préparation
│  - Décide de la recette à utiliser            │
│  - Vérifie qu'on a les ingrédients            │
└────────────────┬───────────────────────────────┘
                 ↓
┌────────────────────────────────────────────────┐
│  CUISINIER (Domain)                            │  ← Prépare la pizza
│  - Connaît les recettes                       │
│  - Applique les règles de cuisine             │
└────────────────┬───────────────────────────────┘
                 ↓
┌────────────────────────────────────────────────┐
│  GARDE-MANGER (Infrastructure)                 │  ← Stocke les ingrédients
│  - Stocke et récupère les ingrédients         │
│  - Interaction avec le frigo (base de données)│
└────────────────────────────────────────────────┘
```

---

## 📁 Structure du projet

```
backendShoemaker/
│
├── apps/                           # 📦 Vos modules métier (fonctionnalités)
│   ├── users/                      # Module utilisateurs et livreurs
│   ├── faq/                        # Module questions fréquentes
│   └── contact/                    # Module messages de contact
│
├── config/                         # ⚙️ Configuration Django
│   ├── settings/                   # Paramètres par environnement
│   │   ├── base.py                # Configuration commune
│   │   ├── development.py         # Configuration développement
│   │   └── production.py          # Configuration production
│   └── urls.py                    # Routes principales de l'API
│
├── core/                          # 🔧 Code partagé entre tous les modules
│   ├── base_models.py            # Modèles de base (timestamps, soft delete)
│   ├── exceptions.py             # Exceptions personnalisées
│   ├── permissions.py            # Permissions réutilisables
│   └── pagination.py             # Pagination
│
├── static/                        # 🖼️ Fichiers statiques (CSS, JS, images)
├── venv/                          # 🐍 Environnement virtuel Python
├── docker-compose.yml            # 🐳 Configuration Docker
├── requirements.txt              # 📋 Dépendances Python
├── manage.py                     # 🚀 Commandes Django
└── .env                          # 🔐 Variables d'environnement
```

---

## 🏗️ L'architecture en 4 couches

Chaque module dans `apps/` (users, faq, contact) est organisé en **4 couches** :

```
apps/<nom_du_module>/
│
├── 1️⃣ presentation/              # COUCHE PRÉSENTATION (API)
│   ├── views.py                  # Endpoints de l'API (URL handlers)
│   ├── serializers.py            # Conversion JSON ↔ Python
│   ├── urls.py                   # Routes du module
│   └── permissions.py            # Qui peut accéder à quoi ?
│
├── 2️⃣ application/               # COUCHE APPLICATION (Cas d'usage)
│   ├── use_cases.py              # Actions métier (Register, UpdateProfile, etc.)
│   ├── dtos.py                   # Objets pour transporter les données
│   └── validators.py             # Validation des règles métier
│
├── 3️⃣ domain/                    # COUCHE DOMAINE (Logique métier)
│   ├── entities.py               # Objets métier purs (sans Django)
│   ├── repositories.py           # Interfaces (contrats)
│   └── services.py               # Services métier (logique complexe)
│
├── 4️⃣ infrastructure/            # COUCHE INFRASTRUCTURE (Technique)
│   ├── repositories.py           # Implémentation avec Django ORM
│   └── signals.py                # Événements Django (ex: envoi email)
│
├── models.py                     # Modèles Django (tables de la base de données)
├── admin.py                      # Interface d'administration Django
└── migrations/                   # Versions de la base de données
```

### Rôle de chaque couche

| Couche | Rôle | Responsabilité | Dépend de |
|--------|------|----------------|-----------|
| **1. Presentation** | Interface avec le monde extérieur | - Recevoir les requêtes HTTP<br>- Valider le format JSON<br>- Vérifier les permissions<br>- Retourner les réponses | Application |
| **2. Application** | Orchestration | - Coordonner les actions<br>- Appeler les services domaine<br>- Transformer les données (DTOs) | Domain |
| **3. Domain** | Logique métier | - Règles métier<br>- Entités pures<br>- Services métier | Rien (indépendant) |
| **4. Infrastructure** | Accès aux données | - Sauvegarder en base de données<br>- Récupérer les données<br>- Envoyer des emails | Domain (interfaces) |

### Principe clé : Inversion des dépendances

```
   Couche HAUTE ────depends on───> Interface (abstraite)
                                         ↑
                                         │
                                    implements
                                         │
   Couche BASSE ─────────────────────────┘
```

**Exemple** :
- La couche **Application** dépend de l'interface `IUserRepository`
- La couche **Infrastructure** implémente `DjangoUserRepository` qui respecte cette interface
- Si demain vous voulez changer de base de données (ex: MongoDB), vous changez juste l'implémentation, pas la logique métier !

---

## 🚀 Le flux d'une requête HTTP

### Vue d'ensemble

```
CLIENT (navigateur, app mobile)
    │
    │ HTTP REQUEST
    │ POST /api/users/register/
    │ { "email": "john@example.com", "password": "Pass123!" }
    ↓
┌───────────────────────────────────────────────────────────┐
│ 1️⃣ PRESENTATION LAYER (views.py)                          │
│                                                            │
│  - ViewSet reçoit la requête                              │
│  - Serializer valide le format JSON                       │
│  - Vérifie les permissions                                │
└───────────────────┬────────────────────────────────────────┘
                    ↓
┌───────────────────────────────────────────────────────────┐
│ 2️⃣ APPLICATION LAYER (use_cases.py)                       │
│                                                            │
│  - Crée un DTO (Data Transfer Object)                     │
│  - Instancie le Use Case: RegisterUserUseCase             │
│  - Valide les règles métier (Validators)                  │
└───────────────────┬────────────────────────────────────────┘
                    ↓
┌───────────────────────────────────────────────────────────┐
│ 3️⃣ DOMAIN LAYER (services.py, entities.py)                │
│                                                            │
│  - Service métier vérifie la logique business             │
│  - Crée une Entity (objet métier)                         │
│  - Applique les règles métier                             │
└───────────────────┬────────────────────────────────────────┘
                    ↓
┌───────────────────────────────────────────────────────────┐
│ 4️⃣ INFRASTRUCTURE LAYER (repositories.py)                 │
│                                                            │
│  - Repository implémente l'interface                      │
│  - Convertit Entity → Django Model                        │
│  - Sauvegarde dans PostgreSQL (ORM)                       │
└───────────────────┬────────────────────────────────────────┘
                    ↓
                DATABASE
            (PostgreSQL + Docker)
                    │
                    │ Retour des données
                    ↓
        Response HTTP JSON au CLIENT
    { "id": 1, "email": "john@example.com", ... }
```

### Exemple concret : Créer un utilisateur

#### Étape 1 : Presentation Layer

**Fichier** : `apps/users/presentation/views.py:45`

```python
@action(detail=False, methods=['post'], permission_classes=[AllowAny])
def register(self, request):
    """
    Endpoint: POST /api/users/register/
    Rôle: Recevoir la requête HTTP et valider le format JSON
    """
    # 1. Valider le format JSON avec un Serializer
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    # 2. Créer un DTO pour transporter les données
    dto = CreateUserDTO(
        email=serializer.validated_data['email'],
        password=serializer.validated_data['password'],
        first_name=serializer.validated_data['first_name'],
        last_name=serializer.validated_data['last_name'],
        phone=serializer.validated_data.get('phone'),
        role=serializer.validated_data.get('role', 'CLIENT')
    )

    # 3. Appeler la couche Application (Use Case)
    user_repository = DjangoUserRepository()
    use_case = RegisterUserUseCase(user_repository)
    user_dto = use_case.execute(dto)

    # 4. Retourner la réponse JSON
    return Response(
        UserSerializer(user).data,
        status=status.HTTP_201_CREATED
    )
```

**Ce qui se passe** :
- ✅ Django reçoit la requête HTTP `POST /api/users/register/`
- ✅ Le `RegisterSerializer` vérifie que le JSON est valide (email, password, etc.)
- ✅ On crée un `CreateUserDTO` (Data Transfer Object) pour transporter les données
- ✅ On instancie le Use Case `RegisterUserUseCase` et on l'exécute
- ✅ On retourne la réponse JSON avec les données de l'utilisateur créé

---

#### Étape 2 : Application Layer

**Fichier** : `apps/users/application/use_cases.py:12`

```python
class RegisterUserUseCase:
    """
    Rôle: Orchestrer l'enregistrement d'un utilisateur
    """
    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository
        self.user_service = UserService(user_repository)

    def execute(self, dto: CreateUserDTO) -> UserDTO:
        """
        Étapes:
        1. Valider les données
        2. Vérifier les règles métier
        3. Créer l'utilisateur via le repository
        """
        # 1. Valider avec les Validators
        UserValidator.validate_email(dto.email)
        UserValidator.validate_password(dto.password)
        UserValidator.validate_phone(dto.phone)

        # 2. Vérifier les règles métier (domaine)
        self.user_service.validate_user_creation(dto.email)

        # 3. Créer l'entité
        user_entity = UserEntity(
            id=None,  # Sera généré par la BDD
            email=dto.email,
            first_name=dto.first_name,
            last_name=dto.last_name,
            phone=dto.phone,
            role=dto.role,
            is_active=True
        )

        # 4. Sauvegarder via le repository
        created_user = self.user_repository.create(user_entity, dto.password)

        # 5. Convertir en DTO pour la réponse
        return self._entity_to_dto(created_user)
```

**Ce qui se passe** :
- ✅ Le Use Case **orchestre** toutes les étapes
- ✅ On valide les données (format email, force du password)
- ✅ On vérifie les règles métier (email déjà utilisé ?)
- ✅ On crée une `UserEntity` (objet métier pur)
- ✅ On appelle le repository pour sauvegarder

---

#### Étape 3 : Domain Layer

**Fichier** : `apps/users/domain/services.py:8`

```python
class UserService:
    """
    Rôle: Logique métier sur les utilisateurs
    """
    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository

    def validate_user_creation(self, email: str) -> None:
        """
        Règle métier: Un email ne peut être utilisé qu'une seule fois
        """
        existing_user = self.user_repository.get_by_email(email)
        if existing_user:
            raise AlreadyExistsException(f"Un utilisateur avec l'email {email} existe déjà")

        # Autres règles métier possibles:
        # - L'email doit être d'un domaine autorisé
        # - Limite de X inscriptions par jour
        # - etc.
```

**Fichier** : `apps/users/domain/entities.py:5`

```python
@dataclass
class UserEntity:
    """
    Entité métier: Représente un utilisateur
    Cette classe est PURE PYTHON (pas de Django)
    """
    id: Optional[int]
    email: str
    first_name: str
    last_name: str
    phone: Optional[str]
    role: str
    is_active: bool
    created_at: Optional[datetime] = None

    def get_full_name(self) -> str:
        """Méthode métier"""
        return f"{self.first_name} {self.last_name}"

    def can_deliver(self) -> bool:
        """Règle métier: Seuls les DELIVERY peuvent livrer"""
        return self.role == 'DELIVERY' and self.is_active
```

**Ce qui se passe** :
- ✅ Le `UserService` vérifie les **règles métier** (email unique)
- ✅ `UserEntity` est un objet **pur Python** (pas de dépendance à Django)
- ✅ Les méthodes métier sont dans l'entité (`get_full_name`, `can_deliver`)

---

#### Étape 4 : Infrastructure Layer

**Fichier** : `apps/users/infrastructure/repositories.py:10`

```python
class DjangoUserRepository(IUserRepository):
    """
    Rôle: Implémentation du repository avec Django ORM
    Responsabilité: Interaction avec la base de données PostgreSQL
    """

    def create(self, user_entity: UserEntity, password: str) -> UserEntity:
        """
        Crée un utilisateur dans la base de données
        """
        # 1. Convertir Entity → Django Model
        user = User(
            email=user_entity.email,
            first_name=user_entity.first_name,
            last_name=user_entity.last_name,
            phone=user_entity.phone,
            role=user_entity.role,
            is_active=user_entity.is_active
        )

        # 2. Hasher le mot de passe
        user.set_password(password)

        # 3. Sauvegarder en base de données
        user.save()

        # 4. Convertir Django Model → Entity
        return self._model_to_entity(user)

    def get_by_email(self, email: str) -> Optional[UserEntity]:
        """Récupérer un utilisateur par email"""
        try:
            user = User.objects.get(email=email)
            return self._model_to_entity(user)
        except User.DoesNotExist:
            return None

    def _model_to_entity(self, user: User) -> UserEntity:
        """Convertir un Django Model en Entity"""
        return UserEntity(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            phone=user.phone,
            role=user.role,
            is_active=user.is_active,
            created_at=user.date_joined
        )
```

**Ce qui se passe** :
- ✅ Le repository convertit `UserEntity` → `User` (modèle Django)
- ✅ Il sauvegarde dans PostgreSQL via l'ORM Django
- ✅ Il convertit `User` → `UserEntity` pour le retour
- ✅ **Important** : La couche Domain ne connaît PAS Django !

---

### Résumé du flux

| Étape | Couche | Fichier | Ce qui se passe |
|-------|--------|---------|-----------------|
| 1 | Presentation | `views.py` | Reçoit la requête HTTP, valide le JSON |
| 2 | Application | `use_cases.py` | Orchestre l'action, valide les règles |
| 3 | Domain | `services.py`, `entities.py` | Applique la logique métier |
| 4 | Infrastructure | `repositories.py` | Sauvegarde dans PostgreSQL |
| 5 | Retour | ← | Convertit Entity → DTO → JSON |

---

## 🛠️ Comment créer un nouveau module

Vous voulez créer un module **orders** (commandes) ? Suivez ces étapes !

### Étape 1 : Créer la structure de dossiers

```bash
cd apps/
mkdir orders
cd orders
mkdir domain application infrastructure presentation
touch __init__.py models.py admin.py
touch domain/__init__.py domain/entities.py domain/repositories.py domain/services.py
touch application/__init__.py application/use_cases.py application/dtos.py application/validators.py
touch infrastructure/__init__.py infrastructure/repositories.py
touch presentation/__init__.py presentation/views.py presentation/serializers.py presentation/urls.py
```

### Étape 2 : Définir le modèle Django

**Fichier** : `apps/orders/models.py`

```python
from django.db import models
from django.conf import settings
from core.base_models import TimeStampedModel

class Order(TimeStampedModel):
    """Modèle Django pour les commandes"""

    STATUS_CHOICES = [
        ('PENDING', 'En attente'),
        ('CONFIRMED', 'Confirmée'),
        ('DELIVERED', 'Livrée'),
        ('CANCELLED', 'Annulée'),
    ]

    # Relations
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    delivery_person = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='deliveries'
    )

    # Champs
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_address = models.TextField()
    notes = models.TextField(blank=True)

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - {self.customer.email}"
```

### Étape 3 : Créer l'entité (Domain)

**Fichier** : `apps/orders/domain/entities.py`

```python
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Optional

@dataclass
class OrderEntity:
    """Entité métier pour une commande"""
    id: Optional[int]
    customer_id: int
    delivery_person_id: Optional[int]
    status: str
    total_amount: Decimal
    delivery_address: str
    notes: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def is_pending(self) -> bool:
        """Règle métier: La commande est en attente"""
        return self.status == 'PENDING'

    def can_be_cancelled(self) -> bool:
        """Règle métier: On peut annuler si pas encore livrée"""
        return self.status in ['PENDING', 'CONFIRMED']

    def assign_delivery_person(self, delivery_person_id: int):
        """Règle métier: Assigner un livreur"""
        if not self.is_pending():
            raise BusinessRuleException("Impossible d'assigner un livreur à une commande non en attente")
        self.delivery_person_id = delivery_person_id
        self.status = 'CONFIRMED'
```

### Étape 4 : Créer le repository (Domain Interface)

**Fichier** : `apps/orders/domain/repositories.py`

```python
from abc import ABC, abstractmethod
from typing import Optional, List
from .entities import OrderEntity

class IOrderRepository(ABC):
    """Interface (contrat) pour le repository des commandes"""

    @abstractmethod
    def create(self, order: OrderEntity) -> OrderEntity:
        """Créer une commande"""
        pass

    @abstractmethod
    def get_by_id(self, order_id: int) -> Optional[OrderEntity]:
        """Récupérer une commande par ID"""
        pass

    @abstractmethod
    def get_by_customer(self, customer_id: int) -> List[OrderEntity]:
        """Récupérer les commandes d'un client"""
        pass

    @abstractmethod
    def update(self, order: OrderEntity) -> OrderEntity:
        """Mettre à jour une commande"""
        pass
```

### Étape 5 : Implémenter le repository (Infrastructure)

**Fichier** : `apps/orders/infrastructure/repositories.py`

```python
from typing import Optional, List
from ..domain.repositories import IOrderRepository
from ..domain.entities import OrderEntity
from ..models import Order

class DjangoOrderRepository(IOrderRepository):
    """Implémentation du repository avec Django ORM"""

    def create(self, order: OrderEntity) -> OrderEntity:
        """Créer une commande dans la BDD"""
        order_model = Order(
            customer_id=order.customer_id,
            delivery_person_id=order.delivery_person_id,
            status=order.status,
            total_amount=order.total_amount,
            delivery_address=order.delivery_address,
            notes=order.notes
        )
        order_model.save()
        return self._model_to_entity(order_model)

    def get_by_id(self, order_id: int) -> Optional[OrderEntity]:
        """Récupérer par ID"""
        try:
            order = Order.objects.get(id=order_id)
            return self._model_to_entity(order)
        except Order.DoesNotExist:
            return None

    def get_by_customer(self, customer_id: int) -> List[OrderEntity]:
        """Récupérer les commandes d'un client"""
        orders = Order.objects.filter(customer_id=customer_id)
        return [self._model_to_entity(o) for o in orders]

    def update(self, order: OrderEntity) -> OrderEntity:
        """Mettre à jour"""
        order_model = Order.objects.get(id=order.id)
        order_model.status = order.status
        order_model.delivery_person_id = order.delivery_person_id
        order_model.notes = order.notes
        order_model.save()
        return self._model_to_entity(order_model)

    def _model_to_entity(self, order: Order) -> OrderEntity:
        """Convertir Model → Entity"""
        return OrderEntity(
            id=order.id,
            customer_id=order.customer_id,
            delivery_person_id=order.delivery_person_id,
            status=order.status,
            total_amount=order.total_amount,
            delivery_address=order.delivery_address,
            notes=order.notes,
            created_at=order.created_at,
            updated_at=order.updated_at
        )
```

### Étape 6 : Créer les DTOs (Application)

**Fichier** : `apps/orders/application/dtos.py`

```python
from dataclasses import dataclass
from decimal import Decimal
from typing import Optional

@dataclass
class CreateOrderDTO:
    """DTO pour créer une commande"""
    customer_id: int
    total_amount: Decimal
    delivery_address: str
    notes: Optional[str] = None

@dataclass
class OrderDTO:
    """DTO pour retourner une commande"""
    id: int
    customer_id: int
    delivery_person_id: Optional[int]
    status: str
    total_amount: Decimal
    delivery_address: str
    notes: str
    created_at: str
    updated_at: str
```

### Étape 7 : Créer le Use Case (Application)

**Fichier** : `apps/orders/application/use_cases.py`

```python
from ..domain.repositories import IOrderRepository
from ..domain.entities import OrderEntity
from .dtos import CreateOrderDTO, OrderDTO
from core.exceptions import ValidationException

class CreateOrderUseCase:
    """Use Case: Créer une commande"""

    def __init__(self, order_repository: IOrderRepository):
        self.order_repository = order_repository

    def execute(self, dto: CreateOrderDTO) -> OrderDTO:
        """
        Étapes:
        1. Valider les données
        2. Créer l'entité
        3. Sauvegarder via le repository
        """
        # 1. Validation
        if dto.total_amount <= 0:
            raise ValidationException("Le montant doit être positif")

        if not dto.delivery_address:
            raise ValidationException("L'adresse de livraison est requise")

        # 2. Créer l'entité
        order_entity = OrderEntity(
            id=None,
            customer_id=dto.customer_id,
            delivery_person_id=None,
            status='PENDING',
            total_amount=dto.total_amount,
            delivery_address=dto.delivery_address,
            notes=dto.notes or ''
        )

        # 3. Sauvegarder
        created_order = self.order_repository.create(order_entity)

        # 4. Retourner le DTO
        return self._entity_to_dto(created_order)

    def _entity_to_dto(self, entity: OrderEntity) -> OrderDTO:
        """Convertir Entity → DTO"""
        return OrderDTO(
            id=entity.id,
            customer_id=entity.customer_id,
            delivery_person_id=entity.delivery_person_id,
            status=entity.status,
            total_amount=entity.total_amount,
            delivery_address=entity.delivery_address,
            notes=entity.notes,
            created_at=entity.created_at.isoformat(),
            updated_at=entity.updated_at.isoformat()
        )
```

### Étape 8 : Créer les Serializers (Presentation)

**Fichier** : `apps/orders/presentation/serializers.py`

```python
from rest_framework import serializers

class CreateOrderSerializer(serializers.Serializer):
    """Serializer pour créer une commande"""
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    delivery_address = serializers.CharField(max_length=500)
    notes = serializers.CharField(max_length=1000, required=False, allow_blank=True)

class OrderSerializer(serializers.Serializer):
    """Serializer pour retourner une commande"""
    id = serializers.IntegerField()
    customer_id = serializers.IntegerField()
    delivery_person_id = serializers.IntegerField(allow_null=True)
    status = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    delivery_address = serializers.CharField()
    notes = serializers.CharField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()
```

### Étape 9 : Créer les Views (Presentation)

**Fichier** : `apps/orders/presentation/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import CreateOrderSerializer, OrderSerializer
from ..application.use_cases import CreateOrderUseCase
from ..application.dtos import CreateOrderDTO
from ..infrastructure.repositories import DjangoOrderRepository

class OrderViewSet(viewsets.ViewSet):
    """ViewSet pour les commandes"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def create_order(self, request):
        """
        Endpoint: POST /api/orders/create_order/
        Créer une nouvelle commande
        """
        # 1. Valider le JSON
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 2. Créer le DTO
        dto = CreateOrderDTO(
            customer_id=request.user.id,
            total_amount=serializer.validated_data['total_amount'],
            delivery_address=serializer.validated_data['delivery_address'],
            notes=serializer.validated_data.get('notes', '')
        )

        # 3. Exécuter le Use Case
        repository = DjangoOrderRepository()
        use_case = CreateOrderUseCase(repository)
        order_dto = use_case.execute(dto)

        # 4. Retourner la réponse
        return Response(
            OrderSerializer(order_dto).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        """
        Endpoint: GET /api/orders/my_orders/
        Récupérer les commandes du client connecté
        """
        repository = DjangoOrderRepository()
        orders = repository.get_by_customer(request.user.id)

        return Response(
            OrderSerializer(orders, many=True).data,
            status=status.HTTP_200_OK
        )
```

### Étape 10 : Configurer les URLs

**Fichier** : `apps/orders/presentation/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

router = DefaultRouter()
router.register(r'', OrderViewSet, basename='orders')

urlpatterns = [
    path('', include(router.urls)),
]
```

### Étape 11 : Enregistrer dans la configuration Django

**Fichier** : `config/settings/base.py`

```python
INSTALLED_APPS = [
    # ...
    'apps.users',
    'apps.faq',
    'apps.contact',
    'apps.orders',  # ← AJOUTER ICI
]
```

**Fichier** : `config/urls.py`

```python
urlpatterns = [
    # ...
    path('api/users/', include('apps.users.presentation.urls')),
    path('api/orders/', include('apps.orders.presentation.urls')),  # ← AJOUTER ICI
]
```

### Étape 12 : Créer et appliquer les migrations

```bash
python manage.py makemigrations orders
python manage.py migrate
```

### Étape 13 : Tester l'API

```bash
# Créer une commande
curl -X POST http://localhost:8000/api/orders/create_order/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "total_amount": 49.99,
    "delivery_address": "123 Rue Example, Paris",
    "notes": "Sonnez 2 fois"
  }'

# Récupérer mes commandes
curl -X GET http://localhost:8000/api/orders/my_orders/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📖 Exemples concrets

### Exemple 1 : Module Users - Enregistrement

**Flux complet** :

```
1. Client envoie : POST /api/users/register/
   {
     "email": "marie@example.com",
     "password": "SecurePass123!",
     "first_name": "Marie",
     "last_name": "Dupont"
   }

2. views.py (Presentation) → RegisterSerializer valide le format

3. use_cases.py (Application) → RegisterUserUseCase
   - Valide l'email (format correct ?)
   - Valide le password (assez fort ?)
   - Vérifie que l'email n'existe pas déjà

4. services.py (Domain) → UserService
   - Règle métier: email unique

5. repositories.py (Infrastructure) → DjangoUserRepository
   - Hashe le password
   - Sauvegarde dans PostgreSQL
   - Retourne l'entité

6. Response JSON :
   {
     "id": 42,
     "email": "marie@example.com",
     "first_name": "Marie",
     "last_name": "Dupont",
     "role": "CLIENT",
     "created_at": "2025-12-16T10:30:00Z"
   }
```

**Fichiers impliqués** :
- `apps/users/presentation/views.py:45` - Endpoint `register()`
- `apps/users/application/use_cases.py:12` - `RegisterUserUseCase`
- `apps/users/domain/services.py:8` - `UserService.validate_user_creation()`
- `apps/users/infrastructure/repositories.py:10` - `DjangoUserRepository.create()`

---

### Exemple 2 : Module Contact - Envoi de message

**Flux complet** :

```
1. Client envoie : POST /api/contacts/
   {
     "name": "Jean Martin",
     "email": "jean@example.com",
     "sujet": "Question sur la livraison",
     "message": "Combien de temps pour une livraison ?"
   }

2. views.py (Presentation) → ContactViewSet.create()
   - Valide le JSON avec ContactSerializer

3. use_cases.py (Application) → CreateContactUseCase
   - Valide le format email
   - Valide que le message n'est pas vide

4. repositories.py (Infrastructure) → DjangoContactRepository.create()
   - Sauvegarde dans PostgreSQL

5. ⚡ SIGNAL Django automatique (models.py:22)
   - send_contact_emails() s'exécute automatiquement
   - Envoie email au client (confirmation)
   - Envoie email à l'admin (notification)

6. Response JSON :
   {
     "id": 15,
     "name": "Jean Martin",
     "email": "jean@example.com",
     "sujet": "Question sur la livraison",
     "message": "Combien de temps pour une livraison ?",
     "created_at": "2025-12-16T11:00:00Z"
   }
```

**Fichiers impliqués** :
- `apps/contact/presentation/views.py:12` - Endpoint `create()`
- `apps/contact/application/use_cases.py:8` - `CreateContactUseCase`
- `apps/contact/infrastructure/repositories.py:5` - `DjangoContactRepository.create()`
- `apps/contact/models.py:22` - Signal `send_contact_emails()`

---

### Exemple 3 : Module Users - Trouver le livreur le plus proche

**Flux complet** :

```
1. Client envoie : GET /api/users/delivery-persons/available/?latitude=48.8566&longitude=2.3522

2. views.py (Presentation) → DeliveryPersonViewSet.available()
   - Récupère les paramètres latitude et longitude

3. use_cases.py (Application) → GetAvailableDeliveryPersonsUseCase
   - Valide les coordonnées GPS

4. services.py (Domain) → DeliveryPersonService.find_nearest()
   - Récupère tous les livreurs disponibles
   - Calcule la distance avec la formule Haversine
   - Trie par distance croissante

5. Response JSON :
   [
     {
       "id": 5,
       "user": {
         "first_name": "Paul",
         "last_name": "Delivery"
       },
       "vehicle_type": "BIKE",
       "is_available": true,
       "distance_km": 0.8
     },
     {
       "id": 12,
       "user": {...},
       "distance_km": 1.5
     }
   ]
```

**Fichiers impliqués** :
- `apps/users/presentation/views.py:120` - Endpoint `available()`
- `apps/users/domain/services.py:45` - `DeliveryPersonService.find_nearest()`
- `apps/users/domain/services.py:78` - Fonction `haversine_distance()`

---

## 🔧 Technologies utilisées

### Backend

| Technologie | Version | Rôle |
|------------|---------|------|
| **Python** | 3.11+ | Langage de programmation |
| **Django** | 4.2+ | Framework web |
| **Django REST Framework** | 3.14+ | API REST |
| **PostgreSQL** | 15+ | Base de données |
| **Redis** | 7+ | Cache et sessions |
| **JWT** | - | Authentification (tokens) |
| **Docker** | - | Conteneurisation |

### Librairies principales

```python
# API REST
djangorestframework          # Framework pour créer des APIs
drf-spectacular             # Documentation Swagger automatique
djangorestframework-simplejwt  # Authentification JWT

# Base de données
psycopg2-binary             # Driver PostgreSQL
django-redis                # Intégration Redis

# Sécurité
django-cors-headers         # CORS pour les requêtes cross-origin
python-decouple             # Variables d'environnement

# Développement
django-debug-toolbar        # Barre de debug
django-extensions           # Outils utiles (shell_plus, etc.)

# Production
gunicorn                    # Serveur WSGI
```

---

## 🚀 Commandes utiles

### Environnement

```bash
# Créer l'environnement virtuel
python -m venv venv

# Activer l'environnement virtuel
# Windows (Git Bash)
source venv/Scripts/activate
# Linux/Mac
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Créer le fichier .env
cp .env.example .env
```

### Base de données

```bash
# Créer les migrations
python manage.py makemigrations

# Appliquer les migrations
python manage.py migrate

# Créer un superutilisateur (admin)
python manage.py createsuperuser

# Réinitialiser la base de données
python manage.py flush
```

### Serveur

```bash
# Démarrer le serveur de développement
python manage.py runserver

# Démarrer avec Docker
docker-compose up -d

# Voir les logs Docker
docker-compose logs -f

# Arrêter Docker
docker-compose down
```

### Développement

```bash
# Shell Django interactif
python manage.py shell

# Shell amélioré (avec django-extensions)
python manage.py shell_plus

# Voir les URLs disponibles
python manage.py show_urls

# Créer une nouvelle app
python manage.py startapp nom_app

# Tests
python manage.py test

# Coverage (couverture de tests)
coverage run --source='.' manage.py test
coverage report
```

### Docker

```bash
# Build l'image
docker-compose build

# Démarrer les services
docker-compose up -d

# Voir les logs
docker-compose logs -f backend

# Exécuter des commandes dans le conteneur
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser

# Accéder au shell du conteneur
docker-compose exec backend bash

# Arrêter les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

### Git

```bash
# Voir le statut
git status

# Ajouter des fichiers
git add .

# Commit
git commit -m "feat: ajouter le module orders"

# Push
git push origin nom_branche

# Pull
git pull origin nom_branche
```

---

## 🎓 Concepts clés à retenir

### 1. Séparation des responsabilités

Chaque couche a **UN SEUL** rôle :

```
Presentation → Recevoir/Envoyer HTTP
Application  → Orchestrer les actions
Domain       → Logique métier
Infrastructure → Accès aux données
```

### 2. Inversion des dépendances

Les couches hautes ne dépendent PAS des couches basses :

```
Application dépend de IUserRepository (interface)
                ↓
Infrastructure implémente DjangoUserRepository
```

Si demain vous voulez MongoDB, vous changez juste `DjangoUserRepository` en `MongoUserRepository` !

### 3. Entities vs Models

```python
# Entity (Domain) - Pure Python
@dataclass
class UserEntity:
    id: int
    email: str

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

# Model (Infrastructure) - Django ORM
class User(AbstractUser):
    email = models.EmailField(unique=True)
```

**Pourquoi séparer ?**
- L'entité est **indépendante** de Django
- On peut tester la logique métier sans base de données
- On peut changer de framework facilement

### 4. DTOs (Data Transfer Objects)

Les DTOs servent à **transporter les données** entre les couches :

```python
# DTO pour créer un utilisateur (INPUT)
@dataclass
class CreateUserDTO:
    email: str
    password: str
    first_name: str

# DTO pour retourner un utilisateur (OUTPUT)
@dataclass
class UserDTO:
    id: int
    email: str
    first_name: str
    created_at: str
```

**Pourquoi ?**
- Éviter de passer des modèles Django partout
- Contrôler exactement quelles données sont envoyées
- Faciliter la validation

### 5. Use Cases

Un Use Case = **UNE action métier** :

```python
RegisterUserUseCase         # Enregistrer un utilisateur
UpdateUserProfileUseCase    # Mettre à jour le profil
CreateOrderUseCase          # Créer une commande
AssignDeliveryPersonUseCase # Assigner un livreur
```

Chaque Use Case a une méthode `execute()` qui fait **UNE SEULE CHOSE**.

### 6. Repositories

Le repository est une **abstraction** de l'accès aux données :

```python
# Interface (Domain)
class IUserRepository(ABC):
    @abstractmethod
    def create(self, user: UserEntity) -> UserEntity:
        pass

# Implémentation (Infrastructure)
class DjangoUserRepository(IUserRepository):
    def create(self, user: UserEntity) -> UserEntity:
        # Code Django ORM ici
        pass
```

**Pourquoi ?**
- Le domaine ne dépend PAS de Django
- On peut changer de BDD facilement
- On peut mocker les repositories dans les tests

---

## 📚 Ressources complémentaires

### Documentation officielle

- **Django** : https://docs.djangoproject.com/
- **Django REST Framework** : https://www.django-rest-framework.org/
- **PostgreSQL** : https://www.postgresql.org/docs/
- **Docker** : https://docs.docker.com/

### Concepts d'architecture

- **Clean Architecture** : https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- **Domain-Driven Design (DDD)** : https://martinfowler.com/bliki/DomainDrivenDesign.html
- **Repository Pattern** : https://martinfowler.com/eaaCatalog/repository.html
- **Use Case Pattern** : https://en.wikipedia.org/wiki/Use_case

### Tutoriels

- **Django REST Framework Tutorial** : https://www.django-rest-framework.org/tutorial/quickstart/
- **JWT Authentication** : https://django-rest-framework-simplejwt.readthedocs.io/
- **Docker + Django** : https://docs.docker.com/samples/django/

---

## ❓ FAQ

### Q1 : Pourquoi tant de couches ? C'est pas compliqué ?

**R** : Au début, ça peut sembler complexe. MAIS :
- Sur un gros projet, ça devient **indispensable**
- Chaque couche a une responsabilité claire
- C'est plus facile de maintenir et de tester
- Vous pouvez changer de technologie facilement

### Q2 : Je dois toujours créer les 4 couches ?

**R** : Pour les modules simples (FAQ, Contact), vous pouvez simplifier :
- Garder au minimum : Presentation + Infrastructure
- Ajouter Application si la logique métier est complexe
- Ajouter Domain si vous avez beaucoup de règles métier

**Module complexe** (Users) → 4 couches complètes
**Module simple** (FAQ) → 2-3 couches suffisent

### Q3 : C'est quoi la différence entre Service et Use Case ?

**R** :
- **Use Case** (Application) : Orchestre une action complète (ex: "Enregistrer un utilisateur")
- **Service** (Domain) : Contient la logique métier réutilisable (ex: "Valider que l'email est unique")

Un Use Case peut appeler plusieurs Services.

### Q4 : Pourquoi utiliser des DTOs et pas directement les Entities ?

**R** :
- Les **Entities** peuvent contenir des infos sensibles (ex: password hash)
- Les **DTOs** contrôlent exactement quoi envoyer au client
- Les DTOs sont facilement sérialisables en JSON

### Q5 : Comment tester mon code ?

**R** :
```python
# Test d'un Use Case (sans Django)
def test_register_user():
    # Mock repository
    mock_repo = MockUserRepository()
    use_case = RegisterUserUseCase(mock_repo)

    # DTO
    dto = CreateUserDTO(email="test@example.com", password="Pass123!")

    # Exécuter
    result = use_case.execute(dto)

    # Vérifier
    assert result.email == "test@example.com"
```

### Q6 : Dois-je créer des migrations à chaque fois ?

**R** : Oui, à chaque modification du `models.py` :
```bash
python manage.py makemigrations
python manage.py migrate
```

### Q7 : Comment débugger ?

**R** :
```python
# Ajouter des print
print(f"DEBUG: user_entity = {user_entity}")

# Utiliser le debugger Python
import pdb; pdb.set_trace()

# Utiliser Django Debug Toolbar (en dev)
# Voir les requêtes SQL, le temps d'exécution, etc.
```

### Q8 : Comment gérer les erreurs ?

**R** : Utiliser les exceptions custom de `core/exceptions.py` :
```python
from core.exceptions import NotFoundException, ValidationException

# Dans un Use Case
if not user:
    raise NotFoundException("Utilisateur introuvable")

# Django REST Framework va automatiquement convertir en réponse HTTP
# → HTTP 404 avec message JSON
```

---

## 🎉 Conclusion

Vous avez maintenant une compréhension complète de l'architecture de ce projet !

**Résumé en 3 points** :

1. **4 couches** : Presentation → Application → Domain → Infrastructure
2. **Flux HTTP** : Request → ViewSet → Use Case → Service → Repository → Database
3. **Créer un module** : Models → Entities → Repository → Use Case → ViewSet → URLs

**Prochaines étapes** :

1. ✅ Lire ce guide
2. ✅ Explorer le code du module `users` (le plus complet)
3. ✅ Créer votre premier module simple (ex: `products`, `categories`)
4. ✅ Tester avec Postman ou curl
5. ✅ Ajouter des tests unitaires

**Bon courage et bon développement !** 🚀
