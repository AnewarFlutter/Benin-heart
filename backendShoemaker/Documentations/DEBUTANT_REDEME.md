# Documentation Complète du Module Users

## Table des Matières
1. [Introduction et Architecture](#introduction-et-architecture)
2. [Structure des Dossiers](#structure-des-dossiers)
3. [Explication Détaillée de Chaque Couche](#explication-détaillée-de-chaque-couche)
4. [Guide Étape par Étape pour Créer un Nouveau Service](#guide-étape-par-étape-pour-créer-un-nouveau-service)
5. [Exemples de Flux Complets](#exemples-de-flux-complets)

---

## Introduction et Architecture

Ce module utilise une **Architecture en Couches** (Clean Architecture / DDD - Domain-Driven Design). Cette architecture sépare le code en différentes couches, chacune ayant une responsabilité spécifique.

### Pourquoi cette architecture ?

- **Séparation des responsabilités** : Chaque couche a un rôle précis
- **Testabilité** : On peut tester chaque couche indépendamment
- **Maintenabilité** : Facile à modifier et à faire évoluer
- **Indépendance des frameworks** : La logique métier ne dépend pas de Django

### Les 4 Couches Principales

```
┌─────────────────────────────────────────────┐
│         PRESENTATION (Views, API)           │  ← Interface avec l'extérieur (HTTP)
├─────────────────────────────────────────────┤
│      APPLICATION (Use Cases, DTOs)          │  ← Orchestration des actions
├─────────────────────────────────────────────┤
│   DOMAIN (Entities, Services, Interfaces)   │  ← Règles métier (le cœur)
├─────────────────────────────────────────────┤
│  INFRASTRUCTURE (Models, Repositories)      │  ← Accès aux données (BDD)
└─────────────────────────────────────────────┘
```

**Règle d'or** : Les dépendances vont toujours **de haut en bas**. La couche Domain ne connaît aucune autre couche.

---

## Structure des Dossiers

```
apps/users/
├── domain/                    # COUCHE DOMAINE (Règles métier)
│   ├── entities.py           # Objets métier purs (User, DeliveryPerson)
│   ├── repositories.py       # Interfaces (contrats) pour l'accès aux données
│   └── services.py           # Services métier (logique complexe)
│
├── application/              # COUCHE APPLICATION (Cas d'usage)
│   ├── dtos.py              # Data Transfer Objects (transport de données)
│   ├── validators.py        # Validations des données
│   └── use_cases.py         # Cas d'usage (actions complètes)
│
├── infrastructure/          # COUCHE INFRASTRUCTURE (Technique)
│   ├── models.py           # Modèles Django (tables BDD)
│   ├── repositories.py     # Implémentation concrète des repositories
│   └── admin.py            # Configuration admin Django
│
├── presentation/           # COUCHE PRESENTATION (API)
│   ├── views.py           # ViewSets Django REST Framework
│   ├── serializers.py     # Sérialiseurs (validation + transformation JSON)
│   ├── urls.py            # Configuration des routes API
│   └── permissions.py     # Permissions d'accès
│
├── migrations/            # Migrations de base de données
└── apps.py               # Configuration de l'app Django
```

---

## Explication Détaillée de Chaque Couche

### 1. COUCHE DOMAIN (Le Cœur du Système)

C'est la couche la plus importante. Elle contient **TOUTE la logique métier** et ne dépend d'aucun framework.

#### 📄 `domain/entities.py` - Les Entités

**Qu'est-ce qu'une entité ?**
Une entité est un objet qui représente un concept métier. Elle contient des **données** et des **comportements**.

```python
@dataclass
class UserEntity:
    """Un utilisateur du système"""
    id: Optional[int]           # ID en base de données (None si pas encore créé)
    email: str                   # Email unique
    first_name: str              # Prénom
    last_name: str               # Nom
    phone: Optional[str]         # Téléphone (optionnel)
    role: str                    # Rôle: CLIENT, DELIVERY, ADMIN
    is_active: bool = True       # Actif oeu non
    created_at: Optional[datetime] = None  # Date de création
    updated_at: Optional[datetime] = None  # Date de modification

    def get_full_name(self) -> str:
        """Méthode pour obtenir le nom complet"""
        return f"{self.first_name} {self.last_name}".strip()

    def is_client(self) -> bool:
        """Vérifie si c'est un client"""
        return self.role == 'CLIENT'
```

**Points clés** :
- `@dataclass` : Décorateur Python qui génère automatiquement `__init__`, `__repr__`, etc.
- **Pas de dépendance** à Django ou autre framework
- Contient des **méthodes métier** comme `is_client()`, `get_full_name()`

**DeliveryPersonEntity** :
```python
@dataclass
class DeliveryPersonEntity:
    """Un livreur avec des informations supplémentaires"""
    user: UserEntity                      # Référence vers l'utilisateur
    vehicle_type: Optional[str] = None    # Type de véhicule
    license_number: Optional[str] = None  # Numéro de permis
    is_available: bool = True             # Disponible pour livrer ?
    current_location_lat: Optional[float] = None  # Latitude GPS
    current_location_lon: Optional[float] = None  # Longitude GPS

    def mark_available(self) -> None:
        """Marquer comme disponible"""
        self.is_available = True

    def update_location(self, lat: float, lon: float) -> None:
        """Mettre à jour la position GPS"""
        self.current_location_lat = lat
        self.current_location_lon = lon
```

#### 📄 `domain/repositories.py` - Les Interfaces

**Qu'est-ce qu'une interface ?**
C'est un **contrat** qui définit quelles méthodes doivent exister, mais **sans implémenter le code**. L'implémentation sera faite dans la couche Infrastructure.

```python
class IUserRepository(ABC):  # ABC = Abstract Base Class (classe abstraite)
    """Interface pour accéder aux utilisateurs"""

    @abstractmethod  # Cette méthode DOIT être implémentée ailleurs
    def get_by_id(self, user_id: int) -> Optional[UserEntity]:
        """Récupérer un utilisateur par son ID"""
        pass  # Pas d'implémentation ici, juste la signature

    @abstractmethod
    def create(self, user_entity: UserEntity, password: str) -> UserEntity:
        """Créer un nouvel utilisateur"""
        pass

    # ... autres méthodes
```

**Pourquoi des interfaces ?**
- **Indépendance** : La logique métier ne sait pas comment les données sont stockées (BDD, fichier, API, etc.)
- **Testabilité** : On peut créer des "fausses" implémentations pour les tests
- **Flexibilité** : On peut changer de base de données sans modifier la logique métier

#### 📄 `domain/services.py` - Les Services Métier

**Qu'est-ce qu'un service métier ?**
C'est une classe qui contient de la **logique métier complexe** qui ne peut pas être mise dans une seule entité.

```python
class UserService:
    """Service pour la logique utilisateur"""

    def __init__(self, user_repository: IUserRepository):
        # On reçoit une interface, pas une implémentation concrète
        self.user_repository = user_repository

    def validate_user_creation(self, email: str) -> None:
        """Vérifie qu'un email n'est pas déjà utilisé"""
        if self.user_repository.exists_by_email(email):
            # Lève une exception si l'email existe déjà
            raise AlreadyExistsException("User", f"email '{email}'")

    def validate_email_format(self, email: str) -> None:
        """Valide le format d'un email avec une regex"""
        import re
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            raise ValidationException(f"Invalid email format: {email}")
```

**Service pour les livreurs** :
```python
class DeliveryPersonService:
    """Service pour la logique livreur"""

    def find_best_delivery_person(self, pickup_lat: float, pickup_lon: float) -> Optional[DeliveryPersonEntity]:
        """Trouve le meilleur livreur pour une livraison"""
        # Récupère les 5 livreurs les plus proches
        available_persons = self.delivery_repository.find_nearest(
            pickup_lat, pickup_lon, limit=5
        )

        if not available_persons:
            return None

        # Pour l'instant, on retourne le plus proche
        # On pourrait ajouter d'autres critères : note, nombre de livraisons en cours, etc.
        return available_persons[0]
```

---

### 2. COUCHE APPLICATION (Orchestration)

Cette couche **orchestre** les actions en utilisant les services et repositories du domaine.

#### 📄 `application/dtos.py` - Les DTOs

**Qu'est-ce qu'un DTO ?**
Un **Data Transfer Object** est un objet simple qui sert uniquement à **transporter des données** entre les couches. Il n'a pas de logique métier.

```python
@dataclass
class CreateUserDTO:
    """DTO pour créer un utilisateur"""
    email: str
    password: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role: str = 'CLIENT'

@dataclass
class UpdateUserDTO:
    """DTO pour mettre à jour un utilisateur"""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
```

**Différence Entity vs DTO** :
- **Entity** : Contient des méthodes métier, représente un concept du domaine
- **DTO** : Simple conteneur de données, pas de méthodes métier

#### 📄 `application/validators.py` - Les Validateurs

**Rôle** : Valider les données avant de les traiter.

```python
class UserValidator:
    """Validateur pour les données utilisateur"""

    @staticmethod  # Méthode statique = pas besoin d'instancier la classe
    def validate_email(email: str) -> None:
        """Valide le format d'un email"""
        if not email:
            raise ValidationException("Email is required")

        # Expression régulière pour valider l'email
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            raise ValidationException(f"Invalid email format: {email}")

    @staticmethod
    def validate_password(password: str) -> None:
        """Valide la force du mot de passe"""
        if len(password) < 8:
            raise ValidationException("Password must be at least 8 characters long")

        if not re.search(r'[A-Z]', password):
            raise ValidationException("Password must contain at least one uppercase letter")

        if not re.search(r'[a-z]', password):
            raise ValidationException("Password must contain at least one lowercase letter")

        if not re.search(r'\d', password):
            raise ValidationException("Password must contain at least one digit")
```

#### 📄 `application/use_cases.py` - Les Cas d'Usage

**Qu'est-ce qu'un Use Case ?**
C'est une **action complète** du système, vue du point de vue de l'utilisateur. Exemple : "Créer un compte", "Mettre à jour son profil", etc.

**Structure d'un Use Case** :
1. **Validation** des données d'entrée
2. **Vérification** des règles métier
3. **Exécution** de l'action
4. **Retour** du résultat

```python
class RegisterUserUseCase:
    """Cas d'usage : Inscription d'un nouvel utilisateur"""

    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository
        self.user_service = UserService(user_repository)

    def execute(self, dto: CreateUserDTO) -> UserDTO:
        """Exécute l'inscription"""

        # ÉTAPE 1 : Validation des données
        UserValidator.validate_email(dto.email)
        UserValidator.validate_password(dto.password)
        UserValidator.validate_name(dto.first_name, "First name")
        UserValidator.validate_name(dto.last_name, "Last name")
        UserValidator.validate_phone(dto.phone)
        UserValidator.validate_role(dto.role)

        # ÉTAPE 2 : Vérification des règles métier
        # Vérifie que l'email n'existe pas déjà
        self.user_service.validate_user_creation(dto.email)

        # ÉTAPE 3 : Création de l'entité
        user_entity = UserEntity(
            id=None,  # Sera généré par la BDD
            email=dto.email,
            first_name=dto.first_name,
            last_name=dto.last_name,
            phone=dto.phone,
            role=dto.role,
            is_active=True
        )

        # ÉTAPE 4 : Sauvegarde en base de données
        created_user = self.user_repository.create(user_entity, dto.password)

        # ÉTAPE 5 : Conversion en DTO et retour
        return self._entity_to_dto(created_user)

    @staticmethod
    def _entity_to_dto(entity: UserEntity) -> UserDTO:
        """Convertit une entité en DTO"""
        return UserDTO(
            id=entity.id,
            email=entity.email,
            first_name=entity.first_name,
            last_name=entity.last_name,
            phone=entity.phone,
            role=entity.role,
            is_active=entity.is_active,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )
```

---

### 3. COUCHE INFRASTRUCTURE (Technique)

Cette couche gère **l'accès aux données** et les détails techniques (base de données, fichiers, API externes, etc.).

#### 📄 `infrastructure/models.py` - Les Modèles Django

**Qu'est-ce qu'un modèle Django ?**
C'est une classe qui représente une **table de base de données**. Django génère automatiquement le SQL.

```python
class User(AbstractUser, TimeStampedModel):
    """Modèle utilisateur (table 'users' en BDD)"""

    # Choix possibles pour le champ 'role'
    ROLE_CHOICES = [
        ('CLIENT', 'Client'),
        ('DELIVERY', 'Delivery Person'),
        ('ADMIN', 'Administrator'),
    ]

    # Champs de la table
    email = models.EmailField(unique=True)  # Email unique
    phone = models.CharField(max_length=20, blank=True, null=True)  # Optionnel
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CLIENT')

    # Configuration
    USERNAME_FIELD = 'email'  # Utilise l'email pour se connecter (au lieu du username)
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        db_table = 'users'  # Nom de la table en BDD
        ordering = ['-created_at']  # Trie par date de création (plus récent en premier)
```

**Modèle DeliveryPerson** :
```python
class DeliveryPerson(TimeStampedModel):
    """Profil livreur (table 'delivery_persons' en BDD)"""

    VEHICLE_CHOICES = [
        ('BIKE', 'Bike'),
        ('MOTORCYCLE', 'Motorcycle'),
        ('CAR', 'Car'),
        ('VAN', 'Van'),
    ]

    # Relation 1-à-1 avec User
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,  # Si on supprime le User, on supprime aussi le DeliveryPerson
        related_name='delivery_profile'  # Pour accéder depuis User : user.delivery_profile
    )

    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_CHOICES)
    license_number = models.CharField(max_length=50)
    is_available = models.BooleanField(default=True)
    current_location_lat = models.FloatField(null=True, blank=True)
    current_location_lon = models.FloatField(null=True, blank=True)
```

#### 📄 `infrastructure/repositories.py` - Implémentation des Repositories
 ORM.

**Rôle** : Implémenter les interfaces définies dans le domaine en utilisant Django
```python
class DjangoUserRepository(IUserRepository):
    """Implémentation Django de l'interface IUserRepository"""

    def get_by_id(self, user_id: int) -> Optional[UserEntity]:
        """Récupère un utilisateur par son ID"""
        try:
            # Requête SQL : SELECT * FROM users WHERE id = user_id
            user = User.objects.get(id=user_id)
            # Convertit le modèle Django en entité du domaine
            return self._model_to_entity(user)
        except User.DoesNotExist:
            return None  # Pas trouvé

    def create(self, user_entity: UserEntity, password: str) -> UserEntity:
        """Crée un nouvel utilisateur en BDD"""
        # INSERT INTO users VALUES (...)
        user = User.objects.create(
            email=user_entity.email,
            username=user_entity.email,
            password=make_password(password),  # Hash le mot de passe !
            first_name=user_entity.first_name,
            last_name=user_entity.last_name,
            phone=user_entity.phone,
            role=user_entity.role,
            is_active=user_entity.is_active
        )
        return self._model_to_entity(user)

    @staticmethod
    def _model_to_entity(user: User) -> UserEntity:
        """Convertit un modèle Django en entité du domaine"""
        return UserEntity(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            phone=user.phone,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at,
            updated_at=user.updated_at
        )
```

**Point important** : La méthode `_model_to_entity()` fait la **traduction** entre le monde Django (Model) et le monde du domaine (Entity).

---

### 4. COUCHE PRESENTATION (API)

Cette couche expose l'application au monde extérieur via des **endpoints HTTP**.

#### 📄 `presentation/serializers.py` - Les Sérialiseurs

**Qu'est-ce qu'un sérialiseur ?**
C'est un outil Django REST Framework qui :
1. **Valide** les données entrantes (JSON → Python)
2. **Transforme** les objets Python en JSON pour la réponse

```python
class UserSerializer(serializers.ModelSerializer):
    """Sérialiseur pour afficher un utilisateur"""

    full_name = serializers.ReadOnlyField()  # Champ calculé (lecture seule)

    class Meta:
        model = User  # Basé sur le modèle User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'role', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class RegisterSerializer(serializers.ModelSerializer):
    """Sérialiseur pour l'inscription"""

    password = serializers.CharField(
        write_only=True,  # Ne sera jamais retourné dans la réponse
        min_length=8,
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        """Validation personnalisée : les mots de passe doivent correspondre"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        attrs.pop('password_confirm')  # On enlève la confirmation, on ne la stocke pas
        return attrs
```

#### 📄 `presentation/views.py` - Les ViewSets

**Qu'est-ce qu'un ViewSet ?**
C'est une classe qui regroupe plusieurs **endpoints** liés à un même modèle.

```python
class UserViewSet(viewsets.ModelViewSet):
    """ViewSet pour les utilisateurs"""

    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        """Définit les permissions selon l'action"""
        if self.action == 'register':
            return [AllowAny()]  # Tout le monde peut s'inscrire
        return [IsAuthenticated()]  # Les autres actions nécessitent d'être connecté

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """
        Endpoint d'inscription
        POST /api/users/register/
        """
        # ÉTAPE 1 : Validation des données avec le sérialiseur
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)  # Lève une erreur si invalide

        try:
            # ÉTAPE 2 : Création du DTO
            dto = CreateUserDTO(
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password'],
                first_name=serializer.validated_data['first_name'],
                last_name=serializer.validated_data['last_name'],
                phone=serializer.validated_data.get('phone'),
                role=serializer.validated_data.get('role', 'CLIENT')
            )

            # ÉTAPE 3 : Exécution du use case
            user_repository = DjangoUserRepository()
            use_case = RegisterUserUseCase(user_repository)
            user_dto = use_case.execute(dto)

            # ÉTAPE 4 : Récupération et retour de la réponse
            user = User.objects.get(id=user_dto.id)
            response_serializer = UserSerializer(user)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except AlreadyExistsException as e:
            return Response({'error': str(e.message)}, status=status.HTTP_400_BAD_REQUEST)
```

**Custom Actions** :
```python
@action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
def me(self, request):
    """
    Récupère le profil de l'utilisateur connecté
    GET /api/users/me/
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
def update_profile(self, request):
    """
    Met à jour le profil de l'utilisateur connecté
    PATCH /api/users/update_profile/
    """
    # ... code de mise à jour
```

#### 📄 `presentation/urls.py` - Configuration des Routes

```python
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')
router.register(r'delivery-persons', DeliveryPersonViewSet, basename='delivery-person')

urlpatterns = [
    path('', include(router.urls)),
]
```

**Routes générées automatiquement** :
- `GET /api/users/` - Liste tous les utilisateurs
- `POST /api/users/` - Crée un utilisateur
- `GET /api/users/{id}/` - Détails d'un utilisateur
- `PUT /api/users/{id}/` - Mise à jour complète
- `PATCH /api/users/{id}/` - Mise à jour partielle
- `DELETE /api/users/{id}/` - Suppression
- `POST /api/users/register/` - Custom action d'inscription
- `GET /api/users/me/` - Custom action profil

---

## Guide Étape par Étape pour Créer un Nouveau Service

Imaginons que vous voulez créer un service **Products** (produits).

### Étape 1 : Créer la structure de dossiers

```bash
mkdir -p apps/products/domain
mkdir -p apps/products/application
mkdir -p apps/products/infrastructure
mkdir -p apps/products/presentation
mkdir -p apps/products/migrations
```

### Étape 2 : COUCHE DOMAIN

#### 2.1 Créer `domain/entities.py`

```python
from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class ProductEntity:
    """Entité produit"""
    id: Optional[int]
    name: str
    description: str
    price: float
    stock_quantity: int
    category: str
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    def is_in_stock(self) -> bool:
        """Vérifie si le produit est en stock"""
        return self.stock_quantity > 0

    def can_order(self, quantity: int) -> bool:
        """Vérifie si on peut commander une quantité"""
        return self.is_active and self.stock_quantity >= quantity
```

#### 2.2 Créer `domain/repositories.py`

```python
from abc import ABC, abstractmethod
from typing import Optional, List
from .entities import ProductEntity

class IProductRepository(ABC):
    """Interface pour accéder aux produits"""

    @abstractmethod
    def get_by_id(self, product_id: int) -> Optional[ProductEntity]:
        pass

    @abstractmethod
    def create(self, product: ProductEntity) -> ProductEntity:
        pass

    @abstractmethod
    def update(self, product: ProductEntity) -> ProductEntity:
        pass

    @abstractmethod
    def delete(self, product_id: int) -> bool:
        pass

    @abstractmethod
    def list_by_category(self, category: str) -> List[ProductEntity]:
        pass
```

#### 2.3 Créer `domain/services.py`

```python
from core.exceptions import ValidationException, NotFoundException
from .entities import ProductEntity
from .repositories import IProductRepository

class ProductService:
    """Service métier pour les produits"""

    def __init__(self, product_repository: IProductRepository):
        self.product_repository = product_repository

    def validate_price(self, price: float) -> None:
        """Valide qu'un prix est positif"""
        if price <= 0:
            raise ValidationException("Price must be greater than 0")

    def validate_stock(self, quantity: int) -> None:
        """Valide une quantité de stock"""
        if quantity < 0:
            raise ValidationException("Stock quantity cannot be negative")
```

### Étape 3 : COUCHE APPLICATION

#### 3.1 Créer `application/dtos.py`

```python
from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class ProductDTO:
    """DTO pour retourner un produit"""
    id: int
    name: str
    description: str
    price: float
    stock_quantity: int
    category: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

@dataclass
class CreateProductDTO:
    """DTO pour créer un produit"""
    name: str
    description: str
    price: float
    stock_quantity: int
    category: str
```

#### 3.2 Créer `application/validators.py`

```python
import re
from core.exceptions import ValidationException

class ProductValidator:
    """Validateur pour les produits"""

    @staticmethod
    def validate_name(name: str) -> None:
        if not name or len(name) < 3:
            raise ValidationException("Product name must be at least 3 characters")

    @staticmethod
    def validate_price(price: float) -> None:
        if price <= 0:
            raise ValidationException("Price must be positive")

    @staticmethod
    def validate_stock(quantity: int) -> None:
        if quantity < 0:
            raise ValidationException("Stock cannot be negative")
```

#### 3.3 Créer `application/use_cases.py`

```python
from core.exceptions import NotFoundException
from ..domain.entities import ProductEntity
from ..domain.repositories import IProductRepository
from ..domain.services import ProductService
from .dtos import CreateProductDTO, ProductDTO
from .validators import ProductValidator

class CreateProductUseCase:
    """Use case : Créer un produit"""

    def __init__(self, product_repository: IProductRepository):
        self.product_repository = product_repository
        self.product_service = ProductService(product_repository)

    def execute(self, dto: CreateProductDTO) -> ProductDTO:
        """Exécute la création"""
        # Validation
        ProductValidator.validate_name(dto.name)
        ProductValidator.validate_price(dto.price)
        ProductValidator.validate_stock(dto.stock_quantity)

        # Règles métier
        self.product_service.validate_price(dto.price)

        # Création de l'entité
        product = ProductEntity(
            id=None,
            name=dto.name,
            description=dto.description,
            price=dto.price,
            stock_quantity=dto.stock_quantity,
            category=dto.category,
            is_active=True
        )

        # Sauvegarde
        created = self.product_repository.create(product)

        # Retour DTO
        return self._entity_to_dto(created)

    @staticmethod
    def _entity_to_dto(entity: ProductEntity) -> ProductDTO:
        return ProductDTO(
            id=entity.id,
            name=entity.name,
            description=entity.description,
            price=entity.price,
            stock_quantity=entity.stock_quantity,
            category=entity.category,
            is_active=entity.is_active,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )
```

### Étape 4 : COUCHE INFRASTRUCTURE

#### 4.1 Créer `infrastructure/models.py`

```python
from django.db import models
from core.base_models import TimeStampedModel

class Product(TimeStampedModel):
    """Modèle produit"""

    CATEGORY_CHOICES = [
        ('SHOES', 'Shoes'),
        ('ACCESSORIES', 'Accessories'),
        ('CLOTHING', 'Clothing'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField(default=0)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.price}FCFA"
```

#### 4.2 Créer `infrastructure/repositories.py`

```python
from typing import Optional, List
from ..domain.entities import ProductEntity
from ..domain.repositories import IProductRepository
from .models import Product

class DjangoProductRepository(IProductRepository):
    """Implémentation Django du repository produit"""

    def get_by_id(self, product_id: int) -> Optional[ProductEntity]:
        try:
            product = Product.objects.get(id=product_id)
            return self._model_to_entity(product)
        except Product.DoesNotExist:
            return None

    def create(self, product: ProductEntity) -> ProductEntity:
        p = Product.objects.create(
            name=product.name,
            description=product.description,
            price=product.price,
            stock_quantity=product.stock_quantity,
            category=product.category,
            is_active=product.is_active
        )
        return self._model_to_entity(p)

    def update(self, product: ProductEntity) -> ProductEntity:
        p = Product.objects.get(id=product.id)
        p.name = product.name
        p.description = product.description
        p.price = product.price
        p.stock_quantity = product.stock_quantity
        p.category = product.category
        p.is_active = product.is_active
        p.save()
        return self._model_to_entity(p)

    @staticmethod
    def _model_to_entity(product: Product) -> ProductEntity:
        return ProductEntity(
            id=product.id,
            name=product.name,
            description=product.description,
            price=float(product.price),
            stock_quantity=product.stock_quantity,
            category=product.category,
            is_active=product.is_active,
            created_at=product.created_at,
            updated_at=product.updated_at
        )
```

### Étape 5 : COUCHE PRESENTATION

#### 5.1 Créer `presentation/serializers.py`

```python
from rest_framework import serializers
from ..infrastructure.models import Product

class ProductSerializer(serializers.ModelSerializer):
    """Sérialiseur pour les produits"""

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'stock_quantity',
            'category', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class CreateProductSerializer(serializers.ModelSerializer):
    """Sérialiseur pour créer un produit"""

    class Meta:
        model = Product
        fields = ['name', 'description', 'price', 'stock_quantity', 'category']
```

#### 5.2 Créer `presentation/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from core.exceptions import ValidationException
from ..infrastructure.models import Product
from ..infrastructure.repositories import DjangoProductRepository
from ..application.use_cases import CreateProductUseCase
from ..application.dtos import CreateProductDTO
from .serializers import ProductSerializer, CreateProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet pour les produits"""

    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request):
        """
        POST /api/products/
        """
        serializer = CreateProductSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            dto = CreateProductDTO(
                name=serializer.validated_data['name'],
                description=serializer.validated_data['description'],
                price=serializer.validated_data['price'],
                stock_quantity=serializer.validated_data['stock_quantity'],
                category=serializer.validated_data['category']
            )

            repository = DjangoProductRepository()
            use_case = CreateProductUseCase(repository)
            product_dto = use_case.execute(dto)

            product = Product.objects.get(id=product_dto.id)
            response_serializer = ProductSerializer(product)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        except ValidationException as e:
            return Response({'error': str(e.message)}, status=status.HTTP_400_BAD_REQUEST)
```

#### 5.3 Créer `presentation/urls.py`

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet

router = DefaultRouter()
router.register(r'', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
]
```

### Étape 6 : Configuration Django

#### 6.1 Créer `apps.py`

```python
from django.apps import AppConfig

class ProductsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.products'
    label = 'products'
    verbose_name = 'Products'
```

#### 6.2 Ajouter dans `settings.py`

```python
INSTALLED_APPS = [
    # ...
    'apps.products',
]
```

#### 6.3 Ajouter dans le fichier `urls.py` principal

```python
urlpatterns = [
    # ...
    path('api/products/', include('apps.products.presentation.urls')),
]
```

### Étape 7 : Migrations

```bash
# Créer les migrations
python manage.py makemigrations products

# Appliquer les migrations
python manage.py migrate products
```

### Étape 8 : Tester

```bash
# Lancer le serveur
python manage.py runserver

# Test avec curl ou Postman
curl -X POST http://localhost:8000/api/products/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Nike Air Max",
    "description": "Comfortable running shoes",
    "price": 129.99,
    "stock_quantity": 50,
    "category": "SHOES"
  }'
```

---

## Exemples de Flux Complets

### Flux 1 : Inscription d'un utilisateur

```
CLIENT (JSON)
    ↓
1. POST /api/users/register/
   Body: {"email": "john@example.com", "password": "Pass1234", ...}
    ↓
2. UserViewSet.register()
   → Validation avec RegisterSerializer
    ↓
3. Création du CreateUserDTO
    ↓
4. RegisterUserUseCase.execute(dto)
   → UserValidator.validate_email()
   → UserValidator.validate_password()
   → UserService.validate_user_creation()
   → UserRepository.create()
    ↓
5. INSERT INTO users (email, password, ...)
    ↓
6. Retour UserDTO
    ↓
7. Conversion en JSON avec UserSerializer
    ↓
RESPONSE (JSON)
{
  "id": 1,
  "email": "john@example.com",
  "first_name": "John",
  ...
}
```



### Flux 2 : Mise à jour de la localisation d'un livreur

```
CLIENT
    ↓
1. POST /api/users/delivery-persons/update_location/
   Body: {"latitude": 48.8566, "longitude": 2.3522}
   Headers: Authorization: Bearer TOKEN
    ↓
2. DeliveryPersonViewSet.update_location()
   → request.user contient l'utilisateur connecté
    ↓
3. Validation avec UpdateLocationSerializer
    ↓
4. Création du UpdateLocationDTO
    ↓
5. UpdateDeliveryPersonLocationUseCase.execute(user_id, dto)
   → DeliveryPersonValidator.validate_location()
   → DeliveryPersonRepository.get_by_user_id()
   → DeliveryPersonEntity.update_location()
   → DeliveryPersonRepository.update()
    ↓
6. UPDATE delivery_persons SET current_location_lat = ..., current_location_lon = ...
    ↓
7. Retour DeliveryPersonDTO
    ↓
RESPONSE (JSON)
```

---

## Résumé des Concepts Clés pour Débutants

### 1. Les Classes Python

```python
# Classe simple
class MaClasse:
    def __init__(self, param):  # Constructeur
        self.param = param

    def ma_methode(self):       # Méthode
        return self.param

# Utilisation
obj = MaClasse("valeur")
print(obj.ma_methode())  # Affiche "valeur"
```

### 2. Les Dataclasses

```python
from dataclasses import dataclass

@dataclass
class Person:
    name: str
    age: int

# Génère automatiquement __init__, __repr__, etc.
p = Person("John", 30)
print(p)  # Person(name='John', age=30)
```

### 3. Les Interfaces (ABC)

```python
from abc import ABC, abstractmethod

class IAnimal(ABC):
    @abstractmethod
    def make_sound(self):
        pass  # Doit être implémenté par les sous-classes

class Dog(IAnimal):
    def make_sound(self):
        return "Woof!"

class Cat(IAnimal):
    def make_sound(self):
        return "Meow!"
```

### 4. Les Exceptions

```python
# Lever une exception
if age < 0:
    raise ValidationException("Age cannot be negative")

# Capturer une exception
try:
    result = risky_operation()
except NotFoundException:
    print("Not found!")
except ValidationException as e:
    print(f"Invalid: {e.message}")
```

### 5. Les Décorateurs

```python
@staticmethod  # Méthode qui n'a pas besoin de self
def my_function():
    pass

@action(detail=False, methods=['post'])  # Décorateur Django REST
def custom_action(self, request):
    pass
```

---

## Glossaire

- **Entity** : Objet métier avec identité unique
- **DTO** : Objet simple pour transporter des données
- **Repository** : Interface pour accéder aux données
- **Use Case** : Action complète du système
- **Validator** : Classe pour valider des données
- **Serializer** : Convertit JSON ↔ Python
- **ViewSet** : Regroupe plusieurs endpoints
- **ORM** : Object-Relational Mapping (Django ORM = manipulation de BDD avec des objets Python)

---

## Ressources

- [Documentation Django](https://docs.djangoproject.com/)
- [Documentation Django REST Framework](https://www.django-rest-framework.org/)
- [Clean Architecture (livre)](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)

---

**Auteur** : Documentation générée pour le projet Shoemaker
**Date** : 2025
**Version** : 1.0
