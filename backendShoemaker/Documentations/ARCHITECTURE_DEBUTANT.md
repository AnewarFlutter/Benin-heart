# 🎓 Guide Débutant - Architecture du Backend Shoemaker

## 📚 Table des matières
1. [Introduction](#introduction)
2. [Architecture Globale](#architecture-globale)
3. [Structure des Dossiers](#structure-des-dossiers)
4. [Le Flux d'une Requête HTTP](#le-flux-dune-requête-http)
5. [Exemple Concret: Inscription Client](#exemple-concret-inscription-client)
6. [Les Couches en Détail](#les-couches-en-détail)
7. [Comment Ajouter une Nouvelle Fonctionnalité](#comment-ajouter-une-nouvelle-fonctionnalité)

---

## 🎯 Introduction

Ce projet utilise une architecture appelée **Clean Architecture** (Architecture Propre).

### Pourquoi cette architecture ?
- **Séparation des responsabilités**: Chaque partie du code a un rôle précis
- **Facile à tester**: On peut tester chaque partie indépendamment
- **Facile à maintenir**: Changer une partie n'affecte pas les autres
- **Facile à comprendre**: Le code suit toujours le même pattern

---

## 🏗️ Architecture Globale

Notre application est organisée en **couches** (layers), comme un gâteau à étages:

```
┌─────────────────────────────────────┐
│   PRÉSENTATION (API/Views)          │  ← Interface avec le monde extérieur
├─────────────────────────────────────┤
│   APPLICATION (Use Cases)           │  ← Logique métier de l'application
├─────────────────────────────────────┤
│   DOMAIN (Entités, Services)        │  ← Règles métier pures
├─────────────────────────────────────┤
│   INFRASTRUCTURE (Base de données)  │  ← Accès aux données
└─────────────────────────────────────┘
```

### Les 4 couches expliquées simplement:

1. **PRÉSENTATION** (`presentation/`)
   - **Rôle**: Reçoit les requêtes HTTP et renvoie les réponses
   - **Exemple**: Un utilisateur envoie son email/mot de passe → La présentation reçoit ces données
   - **Fichiers**: `views.py`, `serializers.py`, `urls.py`

2. **APPLICATION** (`application/`)
   - **Rôle**: Orchestre les actions (use cases = cas d'utilisation)
   - **Exemple**: "Créer un utilisateur" est un use case
   - **Fichiers**: `use_cases.py`, `dtos.py`

3. **DOMAIN** (`domain/`)
   - **Rôle**: Contient les règles métier pures (indépendantes de Django)
   - **Exemple**: "Un email doit être valide", "Un OTP expire après 10 minutes"
   - **Fichiers**: `entities.py`, `services.py`, `repositories.py`

4. **INFRASTRUCTURE** (`infrastructure/`)
   - **Rôle**: Gère la base de données
   - **Exemple**: Sauvegarder un utilisateur en base de données
   - **Fichiers**: `repositories.py`

---

## 📁 Structure des Dossiers

```
apps/users/
├── presentation/           # COUCHE PRÉSENTATION
│   ├── users/             # Endpoints Client & Delivery
│   │   ├── views.py       # Les ViewSets (endpoints API)
│   │   ├── serializers.py # Validation des données
│   │   └── urls.py        # Routes URL
│   └── admin/             # Endpoints Admin
│       ├── views.py
│       ├── serializers.py
│       └── urls.py
│
├── application/           # COUCHE APPLICATION
│   ├── use_cases.py       # Les cas d'utilisation (actions)
│   └── dtos.py            # Data Transfer Objects
│
├── domain/                # COUCHE DOMAIN
│   ├── entities.py        # Entités métier (User, DeliveryPerson)
│   ├── services.py        # Services métier (OTPService, UserService)
│   └── repositories.py    # Interfaces (contrats) pour les repositories
│
├── infrastructure/        # COUCHE INFRASTRUCTURE
│   └── repositories.py    # Implémentation des repositories Django
│
└── models.py              # Modèles Django (base de données)
```

---

## 🔄 Le Flux d'une Requête HTTP

Voici ce qui se passe quand un utilisateur envoie une requête à votre API:

```
1. UTILISATEUR
   ↓ Envoie: POST /api/client/register/

2. URL ROUTING (urls.py)
   ↓ Trouve la route → ClientViewSet.register()

3. PRÉSENTATION (views.py)
   ↓ Valide les données avec RegisterSerializer
   ↓ Appelle la logique métier

4. DOMAIN (services.py)
   ↓ Génère un OTP
   ↓ Envoie un email

5. INFRASTRUCTURE (repositories.py)
   ↓ Sauvegarde dans la base de données

6. RETOUR À L'UTILISATEUR
   ↓ Réponse JSON avec succès/erreur
```

---

## 🎬 Exemple Concret: Inscription Client

### Scénario: Un client veut s'inscrire

**URL**: `POST /api/client/register/`
**Body**:
```json
{
  "email": "john@example.com",
  "password": "secret123",
  "password_confirm": "secret123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+33612345678",
  "role": "CLIENT"
}
```

### 📍 Étape 1: Le routeur URL reçoit la requête

**Fichier**: `apps/users/presentation/users/urls.py`

```python
# Le routeur Django cherche la route /api/client/register/
client_router = DefaultRouter()
client_router.register(r'', ClientViewSet, basename='client')
# Cela mappe: /api/client/register/ → ClientViewSet.register()
```

### 📍 Étape 2: Le ViewSet reçoit la requête

**Fichier**: `apps/users/presentation/users/views.py`

```python
class ClientViewSet(viewsets.ViewSet):

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        # 1. Valider les données avec le serializer
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # 2. Créer l'utilisateur (pas encore vérifié)
        user = serializer.save()
        user.role = 'CLIENT'  # Forcer le rôle CLIENT
        user.save()

        # 3. Générer et envoyer l'OTP
        otp_code = OTPService.generate_otp()
        user.otp_code = otp_code
        user.otp_created_at = timezone.now()
        user.save()

        OTPService.send_otp_email(
            email=user.email,
            otp_code=otp_code,
            user_name=user.first_name
        )

        # 4. Retourner la réponse
        return Response({
            'message': 'Registration successful. Please check your email.',
            'email': user.email
        }, status=status.HTTP_201_CREATED)
```

**Que se passe-t-il ici ?**

1. **Ligne 1-2**: On reçoit les données du client
2. **Ligne 3-4**: On valide avec `RegisterSerializer` (vérifie email, mot de passe, etc.)
3. **Ligne 5-8**: On crée l'utilisateur dans la base de données
4. **Ligne 9-13**: On génère un OTP et on l'enregistre
5. **Ligne 14-18**: On envoie l'OTP par email
6. **Ligne 19-23**: On retourne un message de succès

### 📍 Étape 3: Le Serializer valide les données

**Fichier**: `apps/users/presentation/users/serializers.py`

```python
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'password', 'password_confirm',
                  'first_name', 'last_name', 'phone', 'role']

    def validate(self, attrs):
        # Vérifier que les mots de passe correspondent
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                "password": "Passwords do not match"
            })
        attrs.pop('password_confirm')

        # Bloquer l'inscription en tant qu'ADMIN
        if attrs.get('role') == 'ADMIN':
            raise serializers.ValidationError({
                "role": "Cannot register as ADMIN via API"
            })

        return attrs

    def create(self, validated_data):
        # Créer l'utilisateur avec mot de passe hashé
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)  # Hash le mot de passe
        user.is_active = False  # Désactivé jusqu'à vérification OTP
        user.save()
        return user
```

**Que fait ce serializer ?**

1. **Validation automatique**: Django vérifie que l'email est valide, que le téléphone est unique, etc.
2. **Validation personnalisée** (`validate()`): Vérifie que les 2 mots de passe correspondent
3. **Création sécurisée** (`create()`): Hash le mot de passe avant de le sauvegarder

### 📍 Étape 4: Le Service OTP génère et envoie le code

**Fichier**: `apps/users/domain/services.py`

```python
class OTPService:
    OTP_EXPIRY_MINUTES = 10

    @staticmethod
    def generate_otp() -> str:
        """Génère un code à 6 chiffres aléatoires"""
        return ''.join(random.choices(string.digits, k=6))
        # Retourne par exemple: "123456"

    @staticmethod
    def send_otp_email(email: str, otp_code: str, user_name: str = ""):
        """Envoie l'OTP par email avec un template HTML"""
        html_content = render_to_string('emails/otp_verification.html', {
            'user_name': user_name,
            'otp_code': otp_code,
            'expiry_minutes': 10,
        })

        email_message = EmailMultiAlternatives(
            subject='Code de vérification - Shoemaker',
            body=f"Votre code: {otp_code}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email]
        )
        email_message.attach_alternative(html_content, "text/html")
        email_message.send(fail_silently=False)
```

**Que fait ce service ?**

1. **`generate_otp()`**: Crée un code aléatoire de 6 chiffres
2. **`send_otp_email()`**: Envoie un email professionnel avec le code OTP

### 📍 Étape 5: La base de données sauvegarde tout

**Fichier**: `apps/users/models.py`

```python
class User(AbstractUser, TimeStampedModel):
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    # Champs OTP
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)
```

Django enregistre automatiquement toutes ces données dans PostgreSQL.

---

## 📦 Les Couches en Détail

### 1️⃣ PRÉSENTATION - L'Interface avec le Monde

**Responsabilités**:
- Recevoir les requêtes HTTP
- Valider les données reçues
- Appeler la logique métier
- Retourner les réponses HTTP

**Fichiers importants**:

#### `views.py` - Les Endpoints API
```python
class ClientViewSet(viewsets.ViewSet):
    """Contient tous les endpoints pour les clients"""

    @action(detail=False, methods=['post'])
    def register(self, request):
        """Endpoint: POST /api/client/register/"""
        pass

    @action(detail=False, methods=['post'])
    def verify_otp(self, request):
        """Endpoint: POST /api/client/verify_otp/"""
        pass
```

#### `serializers.py` - Validation des Données
```python
class RegisterSerializer(serializers.ModelSerializer):
    """Valide les données d'inscription"""

    def validate(self, attrs):
        # Règles de validation personnalisées
        pass

    def create(self, validated_data):
        # Comment créer l'objet
        pass
```

#### `urls.py` - Les Routes
```python
client_router = DefaultRouter()
client_router.register(r'', ClientViewSet, basename='client')

urlpatterns = [
    path('client/', include(client_router.urls)),
]
```

### 2️⃣ DOMAIN - Les Règles Métier

**Responsabilités**:
- Définir les règles métier (business logic)
- Indépendant de Django (peut être réutilisé)
- Validation métier pure

**Fichiers importants**:

#### `services.py` - Services Métier
```python
class OTPService:
    """Service pour gérer les OTP"""

    @staticmethod
    def generate_otp() -> str:
        """Génère un code OTP"""
        return ''.join(random.choices(string.digits, k=6))

    @staticmethod
    def is_otp_valid(otp_created_at) -> bool:
        """Vérifie si l'OTP est encore valide"""
        expiry_time = otp_created_at + timedelta(minutes=10)
        return timezone.now() < expiry_time

class UserService:
    """Service pour gérer les utilisateurs"""

    def validate_email_format(self, email: str) -> None:
        """Valide le format de l'email"""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            raise ValidationException(f"Invalid email: {email}")
```

**Pourquoi ces services ?**
- **Réutilisables**: On peut utiliser `OTPService` partout
- **Testables**: On peut tester `generate_otp()` facilement
- **Indépendants**: Pas de dépendance à Django

### 3️⃣ INFRASTRUCTURE - Accès aux Données

**Responsabilités**:
- Communiquer avec la base de données
- Implémenter les repositories

**Fichier**: `infrastructure/repositories.py`

```python
class DjangoUserRepository:
    """Repository pour gérer les Users dans Django ORM"""

    def save(self, user: User) -> User:
        """Sauvegarde un utilisateur"""
        user.save()
        return user

    def get_by_email(self, email: str) -> Optional[User]:
        """Trouve un utilisateur par email"""
        try:
            return User.objects.get(email=email)
        except User.DoesNotExist:
            return None
```

---

## 🎓 Comment Ajouter une Nouvelle Fonctionnalité

### Exemple: Ajouter "Changer le numéro de téléphone"

#### Étape 1: Créer le Serializer

**Fichier**: `apps/users/presentation/users/serializers.py`

```python
class UpdatePhoneSerializer(serializers.Serializer):
    """Serializer pour changer le téléphone"""

    phone = serializers.CharField(max_length=20)

    def validate_phone(self, value):
        # Vérifier que le téléphone n'est pas déjà utilisé
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError(
                "This phone number is already in use"
            )
        return value
```

#### Étape 2: Créer l'Endpoint dans le ViewSet

**Fichier**: `apps/users/presentation/users/views.py`

```python
class ClientViewSet(viewsets.ViewSet):

    @extend_schema(
        tags=['Client - Profile'],
        summary='Update phone number',
        description='Update the client phone number',
        request=UpdatePhoneSerializer
    )
    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_phone(self, request):
        """
        Update client phone number.
        PATCH /api/client/update_phone/
        """
        # Vérifier que c'est un client
        if request.user.role != 'CLIENT':
            return Response(
                {'error': 'This endpoint is for clients only'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Valider les données
        serializer = UpdatePhoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Mettre à jour le téléphone
        user = request.user
        user.phone = serializer.validated_data['phone']
        user.save()

        # Retourner la réponse
        return Response({
            'message': 'Phone number updated successfully',
            'phone': user.phone
        }, status=status.HTTP_200_OK)
```

#### Étape 3: Tester

```bash
# 1. D'abord se connecter pour avoir un token
POST /api/login/
{
  "identifier": "john@example.com",
  "password": "secret123"
}

# Réponse:
# {
#   "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
#   "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
# }

# 2. Utiliser le token pour changer le téléphone
PATCH /api/client/update_phone/
Headers: Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
{
  "phone": "+33687654321"
}

# Réponse:
# {
#   "message": "Phone number updated successfully",
#   "phone": "+33687654321"
# }
```

---

## 🔍 Diagramme de Flux Complet - Inscription

```
┌──────────────────────────────────────────────────────────────────┐
│ UTILISATEUR                                                       │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
    POST /api/client/register/
    {
      "email": "john@example.com",
      "password": "secret123",
      ...
    }
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ URLS (urls.py)                                                    │
│ Trouve la route: /api/client/register/                          │
│ → ClientViewSet.register()                                       │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ VIEWS (views.py) - ClientViewSet.register()                     │
│                                                                   │
│ 1. Reçoit request.data                                           │
│ 2. serializer = RegisterSerializer(data=request.data)           │
│ 3. serializer.is_valid(raise_exception=True)                    │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ SERIALIZERS (serializers.py) - RegisterSerializer               │
│                                                                   │
│ 1. Valide: email, password, phone, etc.                         │
│ 2. validate(): Vérifie password == password_confirm             │
│ 3. validate(): Bloque role == ADMIN                             │
│ 4. create(): Crée l'utilisateur                                 │
│    - Hash le password                                            │
│    - is_active = False                                           │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ MODELS (models.py) - User.objects.create()                      │
│                                                                   │
│ Django ORM sauvegarde dans PostgreSQL:                           │
│ - email: john@example.com                                        │
│ - password: $pbkdf2-sha256$... (hashé)                          │
│ - role: CLIENT                                                   │
│ - is_active: False                                               │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ VIEWS (views.py) - Suite de register()                          │
│                                                                   │
│ 4. user = serializer.save()                                      │
│ 5. user.role = 'CLIENT'                                          │
│ 6. user.save()                                                   │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ SERVICES (services.py) - OTPService                             │
│                                                                   │
│ 7. otp_code = OTPService.generate_otp()                         │
│    → Génère: "123456"                                            │
│ 8. user.otp_code = "123456"                                      │
│ 9. user.otp_created_at = now()                                   │
│ 10. user.save()                                                  │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ SERVICES (services.py) - OTPService.send_otp_email()            │
│                                                                   │
│ 11. Charge le template HTML: emails/otp_verification.html       │
│ 12. Remplace {user_name}, {otp_code}, {expiry_minutes}          │
│ 13. Envoie l'email via SMTP                                      │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ VIEWS (views.py) - Retour de register()                         │
│                                                                   │
│ return Response({                                                 │
│   'message': 'Registration successful. Check your email.',      │
│   'email': 'john@example.com'                                    │
│ }, status=201)                                                   │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ UTILISATEUR REÇOIT LA RÉPONSE                                    │
│                                                                   │
│ {                                                                 │
│   "message": "Registration successful. Check your email.",       │
│   "email": "john@example.com"                                    │
│ }                                                                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📝 Récapitulatif - Qui fait quoi ?

| Fichier | Rôle | Exemple |
|---------|------|---------|
| **urls.py** | Mapper les URLs aux fonctions | `/api/client/register/` → `ClientViewSet.register()` |
| **views.py** | Recevoir requêtes, appeler logique, retourner réponses | `def register(self, request):` |
| **serializers.py** | Valider et transformer les données | Vérifier que password == password_confirm |
| **services.py** | Logique métier réutilisable | Générer OTP, envoyer email |
| **models.py** | Structure de la base de données | Définir les champs User |
| **repositories.py** | Accès à la base de données | `get_by_email()`, `save()` |

---

## 🎯 Points Clés à Retenir

1. **Le flux est toujours le même**:
   ```
   URL → View → Serializer → Service → Model → Database
   ```

2. **Chaque couche a une responsabilité**:
   - **Présentation**: Interface HTTP
   - **Application**: Orchestration
   - **Domain**: Règles métier
   - **Infrastructure**: Base de données

3. **Pour ajouter une fonctionnalité**:
   1. Créer le serializer (validation)
   2. Créer l'endpoint dans le ViewSet
   3. Ajouter la logique métier si nécessaire
   4. Tester avec Swagger

4. **Les serializers sont vos amis**:
   - Ils valident automatiquement
   - Ils transforment JSON ↔ Python
   - Ils protègent votre application

5. **Les services sont réutilisables**:
   - `OTPService` peut être utilisé partout
   - Pas de dépendance à Django
   - Facile à tester

---

## 📚 Pour Aller Plus Loin

### Documentation officielle:
- Django REST Framework: https://www.django-rest-framework.org/
- Clean Architecture: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- Django ORM: https://docs.djangoproject.com/en/4.2/topics/db/

### Prochaines étapes recommandées:
1. Lire le code de `ClientViewSet.verify_otp()` pour comprendre la vérification OTP
2. Regarder comment `forgot_password()` fonctionne
3. Essayer d'ajouter un nouveau endpoint simple (ex: update_phone)
4. Tester tous les endpoints dans Swagger UI

---

**Créé avec ❤️ pour les débutants**
*Si vous avez des questions, n'hésitez pas !*
