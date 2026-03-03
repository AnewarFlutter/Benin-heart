# 🚀 Guide de Démarrage Rapide - Shoemaker API

## ✅ Ce qui a été créé

### 📁 Structure du Projet

```
backendRestauration/
├── 🐳 Docker
│   ├── Dockerfile                      # Image Docker
│   ├── docker-compose.yml              # Dev local
│   ├── docker-compose.prod.yml         # Production
│   ├── .dockerignore                   # Fichiers à ignorer
│   ├── entrypoint.sh                   # Script de démarrage
│   └── nginx/                          # Configuration Nginx
│       ├── nginx.conf
│       └── conf.d/shoemaker.conf
│
├── ⚙️ Configuration Django
│   └── config/
│       ├── settings/
│       │   ├── base.py                 # Settings communs
│       │   ├── development.py          # Settings dev
│       │   └── production.py           # Settings prod
│       ├── urls.py                     # URLs principales
│       ├── wsgi.py                     # WSGI
│       └── asgi.py                     # ASGI
│
├── 🎯 Core (Modules partagés)
│   └── core/
│       ├── exceptions.py               # Exceptions métier
│       ├── pagination.py               # Pagination DRF
│       ├── permissions.py              # Permissions DRF
│       ├── base_models.py              # Modèles abstraits
│       └── utils.py                    # Utilitaires
│
├── 📦 Applications
│   ├── apps/users/                     # Clean Architecture COMPLÈTE
│   │   ├── domain/                     # Entités pures
│   │   ├── application/                # Use cases
│   │   ├── infrastructure/             # ORM Django
│   │   └── presentation/               # API REST
│   │
│   └── apps/services/                  # Services de réparation
│       ├── infrastructure/             # Models, Admin
│       └── presentation/               # Serializers, Views
│
├── 📝 Documentation
│   ├── README.md                       # Documentation principale
│   ├── DOCKER.md                       # Guide Docker complet
│   ├── ARCHITECTURE.md                 # Architecture Clean
│   └── QUICKSTART.md                   # Ce fichier
│
├── 🛠️ Fichiers de config
│   ├── manage.py                       # Django CLI
│   ├── requirements.txt                # Dépendances Python
│   ├── Makefile                        # Commandes simplifiées
│   ├── .env.example                    # Variables d'env (exemple)
│   ├── .env.prod                       # Variables pour Docker prod
│   └── .gitignore                      # Git ignore
│
└── 🧪 Tests
    └── tests/
        ├── users/
        └── services/
```

---

## 🎯 Option 1 : Démarrage avec Docker (RECOMMANDÉ)

### Prérequis
- Docker Desktop installé ([Télécharger](https://www.docker.com/products/docker-desktop))

### Démarrage en 3 commandes

```bash
# 1. Cloner/Naviguer vers le projet
cd backendRestauration

# 2. Démarrer tous les services
docker compose up -d

# 3. C'est tout ! 🎉
```

### Accès

- **API** : http://localhost:8000
- **Admin Django** : http://localhost:8000/admin
  - Email : `admin@admin.com`
  - Password : `admin123`
- **pgAdmin** : http://localhost:5050
  - Email : `admin@admin.com`
  - Password : `admin`
- **API Docs** : http://localhost:8000/api/

### Commandes utiles

```bash
# Voir les logs
docker compose logs -f

# Voir les logs d'un service
docker compose logs -f web

# Accéder au shell Django
docker compose exec web python manage.py shell

# Accéder au bash du conteneur
docker compose exec web bash

# Arrêter les services
docker compose down

# Redémarrer
docker compose restart
```

### Avec Makefile (encore plus simple)

```bash
make up              # Démarrer
make logs            # Voir les logs
make shell           # Django shell
make bash            # Container bash
make migrate         # Migrations
make test            # Tests
make down            # Arrêter
make clean           # Nettoyer
```

---

## 💻 Option 2 : Installation Manuelle (Sans Docker)

### Prérequis
- Python 3.11+
- PostgreSQL 15+
- Redis (optionnel)

### 1. Environnement virtuel

```bash
python -m venv venv

# Activer
venv\Scripts\activate          # Windows
source venv/bin/activate       # Linux/Mac
```

### 2. Installer les dépendances

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Configuration

Créer `.env` :
```bash
cp .env.example .env
```

Éditer `.env` pour la base de données SQLite (rapide) :
```env
DEBUG=True
SECRET_KEY=dev-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
```

### 4. Base de données

**Option A : SQLite (rapide)**

Modifier `config/settings/base.py` ligne 88 :
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

**Option B : PostgreSQL**

Créer la base :
```bash
psql -U postgres
CREATE DATABASE shoemaker_db;
\q
```

Configurer `.env` :
```env
DB_NAME=shoemaker_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

### 5. Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Superuser

```bash
python manage.py createsuperuser
```

### 7. Lancer le serveur

```bash
python manage.py runserver
```

Accès : http://localhost:8000

---

## 📡 Test des Endpoints

### 1. Inscription

```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123",
    "password_confirm": "SecurePass123",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "role": "CLIENT"
  }'
```

### 2. Login (JWT)

```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

Réponse :
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 3. Accéder au profil (avec token)

```bash
curl -X GET http://localhost:8000/api/users/me/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Liste des services

```bash
curl http://localhost:8000/api/services/
```

---

## 🚀 Déploiement en Production

### Prérequis
- Serveur Linux (Ubuntu, Debian, etc.)
- Docker & Docker Compose installés
- Nom de domaine configuré

### Étapes

1. **Configurer `.env` pour la production**
   ```bash
   cp .env.prod .env
   # Éditer .env avec vos valeurs de production
   ```

2. **Modifier la config Nginx**
   ```bash
   # nginx/conf.d/shoemaker.conf
   # Remplacer "your-domain.com" par votre domaine
   ```

3. **Démarrer les services**
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

4. **Obtenir le certificat SSL**
   ```bash
   docker compose -f docker-compose.prod.yml run --rm certbot certonly \
     --webroot --webroot-path=/var/www/certbot \
     -d your-domain.com -d www.your-domain.com \
     --email your-email@example.com --agree-tos
   ```

5. **Redémarrer Nginx**
   ```bash
   docker compose -f docker-compose.prod.yml restart nginx
   ```

📖 **Guide complet** : Voir [DOCKER.md](DOCKER.md)

---

## 📚 Documentation

- **README.md** : Documentation générale
- **DOCKER.md** : Guide Docker complet (dev + prod)
- **ARCHITECTURE.md** : Explication de la Clean Architecture

---

## 🎯 Endpoints Disponibles

### Authentication
- `POST /api/token/` - Obtenir token JWT
- `POST /api/token/refresh/` - Rafraîchir token

### Users
- `POST /api/users/register/` - Inscription
- `GET /api/users/me/` - Mon profil
- `PATCH /api/users/update_profile/` - Modifier profil
- `POST /api/users/change_password/` - Changer password
- `GET /api/users/` - Liste users (admin)

### Delivery Persons
- `POST /api/users/delivery-persons/` - Créer profil livreur
- `POST /api/users/delivery-persons/update_location/` - Mettre à jour position
- `GET /api/users/delivery-persons/available/` - Livreurs disponibles

### Services
- `GET /api/services/` - Liste services
- `GET /api/services/{id}/` - Détail service
- `POST /api/services/` - Créer service (admin)
- `PUT/PATCH /api/services/{id}/` - Modifier service (admin)
- `DELETE /api/services/{id}/` - Supprimer service (admin)

---

## 🛠️ Commandes Utiles

### Django
```bash
# Migrations
python manage.py makemigrations
python manage.py migrate

# Superuser
python manage.py createsuperuser

# Shell
python manage.py shell

# Tests
python manage.py test

# Collect static
python manage.py collectstatic
```

### Docker
```bash
# Dev
docker compose up -d              # Démarrer
docker compose logs -f            # Logs
docker compose down               # Arrêter

# Production
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml down
```

---

## ❓ FAQ

**Q : Docker ou installation manuelle ?**
**R :** Docker est recommandé car tout est préconfiguré (PostgreSQL, Redis, pgAdmin).

**Q : Les migrations sont automatiques ?**
**R :** Oui avec Docker. Manuel : `python manage.py migrate`

**Q : Comment ajouter une nouvelle app ?**
**R :** Suivre le pattern de l'app `users` (Clean Architecture) ou `services` (simplifié).

**Q : Mot de passe admin par défaut ?**
**R :** Dev Docker : `admin@admin.com` / `admin123`. Production : à créer manuellement.

**Q : Le code change automatiquement ?**
**R :** Oui en dev Docker (volume monté). Production : rebuild requis.

---

## 🆘 Besoin d'aide ?

1. Vérifier les logs : `docker compose logs -f`
2. Consulter [DOCKER.md](DOCKER.md) - section Troubleshooting
3. Vérifier la configuration `.env`
4. Redémarrer : `docker compose restart`

---

**Bon développement ! 🚀**
