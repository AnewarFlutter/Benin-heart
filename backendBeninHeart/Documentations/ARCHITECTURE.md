# Architecture Clean du Projet Shoemaker

## Vue d'ensemble

Ce projet utilise une **Clean Architecture** (Architecture Hexagonale) pour séparer clairement les responsabilités et rendre le code maintenable, testable et évolutif.

## Structure des Apps

```
apps/
├── users/              # Gestion des utilisateurs et livreurs
├── services/           # Catalogue des services de réparation
└── shoes/              # Gestion des chaussures à réparer
```

## Couches de l'Architecture

### 1. Domain Layer (Couche Domaine)
**Fichiers**: `domain/entities.py`, `domain/repositories.py`, `domain/services.py`

**Responsabilités**:
- Définir les **entités métier** (dataclasses pures)
- Définir les **interfaces des repositories** (ABC)
- Contenir la **logique métier pure**
- **Aucune dépendance** vers Django ou frameworks externes

**Exemple (users/domain/entities.py)**:
```python
@dataclass
class UserEntity:
    id: Optional[int]
    email: str
    first_name: str
    last_name: str
    role: str

    def is_admin(self) -> bool:
        return self.role == 'ADMIN'
```

**Principe**: Le domaine est le cœur de l'application, indépendant de toute infrastructure.

---

### 2. Application Layer (Couche Application)
**Fichiers**: `application/dtos.py`, `application/use_cases.py`, `application/validators.py`

**Responsabilités**:
- Définir les **DTOs** (Data Transfer Objects)
- Implémenter les **Use Cases** (cas d'utilisation)
- Orchestrer la logique métier
- Valider les données métier

**Exemple (users/application/use_cases.py)**:
```python
class RegisterUserUseCase:
    def __init__(self, user_repository: IUserRepository):
        self.user_repository = user_repository

    def execute(self, dto: CreateUserDTO) -> UserDTO:
        # 1. Valider
        # 2. Créer entité
        # 3. Persister via repository
        # 4. Retourner DTO
```

**Principe**: Les use cases orchestrent la logique métier sans dépendre de l'infrastructure.

---

### 3. Infrastructure Layer (Couche Infrastructure)
**Fichiers**: `infrastructure/models.py`, `infrastructure/repositories.py`, `infrastructure/admin.py`

**Responsabilités**:
- Implémenter les **models Django ORM**
- Implémenter les **repositories** (interfaces définies dans domain)
- Gérer la persistance des données
- Configuration Django Admin

**Exemple (users/infrastructure/repositories.py)**:
```python
class DjangoUserRepository(IUserRepository):
    def get_by_id(self, user_id: int) -> Optional[UserEntity]:
        user = User.objects.get(id=user_id)
        return self._model_to_entity(user)
```

**Principe**: L'infrastructure implémente les interfaces du domaine en utilisant Django.

---

### 4. Presentation Layer (Couche Présentation)
**Fichiers**: `presentation/serializers.py`, `presentation/views.py`, `presentation/urls.py`, `presentation/permissions.py`

**Responsabilités**:
- Définir les **serializers DRF**
- Implémenter les **ViewSets** (API REST)
- Gérer le routing (URLs)
- Définir les permissions

**Exemple (users/presentation/views.py)**:
```python
class UserViewSet(viewsets.ModelViewSet):
    @action(detail=False, methods=['post'])
    def register(self, request):
        # 1. Valider avec serializer
        # 2. Créer DTO
        # 3. Exécuter use case
        # 4. Retourner response
```

**Principe**: La présentation expose l'API REST en utilisant les use cases.

---

## Flux de Données

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Frontend)                       │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP Request
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              PRESENTATION (API REST - DRF)                   │
│  • Serializers (validation)                                  │
│  • ViewSets (routing)                                        │
│  • Permissions                                               │
└────────────────────────────┬────────────────────────────────┘
                             │ DTO
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              APPLICATION (Use Cases)                         │
│  • RegisterUserUseCase                                       │
│  • UpdateProfileUseCase                                      │
│  • Validation métier                                         │
└──────────┬──────────────────────────┬───────────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────────┐    ┌──────────────────────┐
│   DOMAIN (Entities)  │    │  DOMAIN (Services)   │
│  • UserEntity        │    │  • UserService       │
│  • Business Logic    │    │  • Business Rules    │
└──────────────────────┘    └──────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│         INFRASTRUCTURE (Persistence)                         │
│  • Django ORM Models                                         │
│  • Repository Implementations                                │
│  • Database Access                                           │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
                       ┌───────────┐
                       │  Database │
                       └───────────┘
```

## Exemple Complet : Inscription d'un Utilisateur

### 1. Request HTTP
```http
POST /api/users/register/
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe"
}
```

### 2. Presentation Layer (views.py)
```python
@action(detail=False, methods=['post'])
def register(self, request):
    # Validation avec serializer
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    # Créer DTO
    dto = CreateUserDTO(
        email=serializer.validated_data['email'],
        password=serializer.validated_data['password'],
        first_name=serializer.validated_data['first_name'],
        last_name=serializer.validated_data['last_name']
    )

    # Exécuter use case
    use_case = RegisterUserUseCase(DjangoUserRepository())
    user_dto = use_case.execute(dto)

    # Retourner response
    return Response(UserSerializer(user_dto).data)
```

### 3. Application Layer (use_cases.py)
```python
class RegisterUserUseCase:
    def execute(self, dto: CreateUserDTO) -> UserDTO:
        # Validation métier
        UserValidator.validate_email(dto.email)
        UserValidator.validate_password(dto.password)

        # Vérifier règles métier
        if self.user_repository.exists_by_email(dto.email):
            raise AlreadyExistsException("User", "email")

        # Créer entité
        user_entity = UserEntity(
            id=None,
            email=dto.email,
            first_name=dto.first_name,
            last_name=dto.last_name,
            role='CLIENT'
        )

        # Persister
        created_user = self.user_repository.create(user_entity, dto.password)

        # Retourner DTO
        return self._entity_to_dto(created_user)
```

### 4. Infrastructure Layer (repositories.py)
```python
class DjangoUserRepository(IUserRepository):
    def create(self, user_entity: UserEntity, password: str) -> UserEntity:
        # Utiliser Django ORM
        user = User.objects.create(
            email=user_entity.email,
            password=make_password(password),
            first_name=user_entity.first_name,
            last_name=user_entity.last_name,
            role=user_entity.role
        )

        # Convertir model → entity
        return self._model_to_entity(user)
```

## Avantages de cette Architecture

### ✅ **Séparation des Responsabilités**
Chaque couche a un rôle clairement défini.

### ✅ **Testabilité**
- Le domaine peut être testé sans base de données
- Les use cases peuvent être testés avec des mocks de repositories
- Les views peuvent être testées avec des use cases mockés

### ✅ **Indépendance du Framework**
- La logique métier (domain) est indépendante de Django
- On peut changer Django pour FastAPI sans toucher au domaine

### ✅ **Maintenabilité**
- Code organisé et facile à comprendre
- Modifications localisées (changement d'ORM = seulement infrastructure)

### ✅ **Réutilisabilité**
- Les use cases peuvent être utilisés par différentes interfaces (API REST, CLI, GraphQL)
- Les entités du domaine peuvent être réutilisées dans d'autres contextes

## Règles Importantes

### Dépendances
```
Presentation → Application → Domain ← Infrastructure
```

- **Domain** ne dépend de RIEN
- **Application** ne dépend que de **Domain**
- **Infrastructure** implémente les interfaces de **Domain**
- **Presentation** utilise **Application** et **Infrastructure**

### Flux de Données
```
Request → Presentation → Application → Domain → Infrastructure → DB
                                                       ↓
Response ← Presentation ← Application ← Domain ← Infrastructure ← DB
```

### Ce qu'il NE FAUT PAS faire
❌ Utiliser Django ORM dans le domaine
❌ Appeler directement les repositories depuis la présentation
❌ Mettre la logique métier dans les serializers ou views
❌ Utiliser des models Django dans les use cases

### Ce qu'il FAUT faire
✅ Définir les entités comme dataclasses dans le domaine
✅ Utiliser les use cases pour orchestrer la logique
✅ Implémenter les interfaces de repositories dans l'infrastructure
✅ Séparer validation technique (serializers) et validation métier (validators)

## Apps Créées

### 1. **Users** (Complète avec Clean Architecture)
- ✅ Domain: entities, repositories, services
- ✅ Application: dtos, use_cases, validators
- ✅ Infrastructure: models, repositories, admin
- ✅ Presentation: serializers, views, urls, permissions

### 2. **Services** (Structure simplifiée)
- ✅ Models Django
- ✅ Admin
- ✅ Serializers
- ✅ ViewSets
- ✅ URLs

### 3. **Shoes** (Structure simplifiée)
- ✅ Models Django
- ✅ Admin
- ✅ Serializers
- ✅ ViewSets
- ✅ URLs

## Prochaines Étapes

Pour étendre l'application, suivez le même pattern :

1. **Créer l'app** : `python manage.py startapp nom_app`
2. **Créer la structure** : domain/, application/, infrastructure/, presentation/
3. **Domaine** : Définir entités et interfaces
4. **Application** : Créer use cases et DTOs
5. **Infrastructure** : Implémenter models et repositories
6. **Présentation** : Créer serializers et views

## Ressources

- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Django Best Practices](https://docs.djangoproject.com/en/stable/misc/design-philosophies/)
