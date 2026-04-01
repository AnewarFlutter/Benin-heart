# 🔐 JWT Blacklist System - Documentation

## 📋 Vue d'ensemble

Ce système implémente une **blacklist JWT** hybride pour sécuriser les tokens lors du logout :

- **Access Tokens** → Blacklistés dans **Redis** (cache rapide avec TTL)
- **Refresh Tokens** → Blacklistés dans **PostgreSQL** (base de données via SimpleJWT)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      LOGOUT                                  │
├─────────────────────────────────────────────────────────────┤
│  1. User fait logout                                        │
│  2. Access Token JTI → Redis (TTL = temps restant)          │
│  3. Refresh Token → Blacklist en BDD (SimpleJWT)            │
│  4. Tokens invalidés immédiatement                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              NOUVELLE REQUÊTE AVEC ANCIEN TOKEN              │
├─────────────────────────────────────────────────────────────┤
│  1. Requête arrive avec Access Token                        │
│  2. Middleware vérifie si JTI est dans Redis                │
│  3. Si blacklisté → 401 Unauthorized                        │
│  4. Si non blacklisté → Requête autorisée                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

### 1. Installer les dépendances

```bash
pip install django-redis redis pyjwt
```

### 2. Installer et démarrer Redis

**Windows (via WSL ou Docker):**
```bash
# Via Docker
docker run -d -p 6379:6379 redis:alpine

# Via WSL
sudo apt update
sudo apt install redis-server
redis-server
```

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis

# Mac
brew install redis
brew services start redis
```

### 3. Configurer les variables d'environnement (.env)

```env
# Redis Configuration (pour JWT Blacklist des Access Tokens)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=
```

### 4. Appliquer les migrations

```bash
# Migration pour la table BlacklistedToken (SimpleJWT)
python manage.py migrate
```

---

## ⚙️ Configuration

### `config/settings/base.py`

#### INSTALLED_APPS
```python
INSTALLED_APPS = [
    # ...
    'rest_framework_simplejwt.token_blacklist',  # JWT Blacklist pour Refresh Tokens
    # ...
]
```

#### MIDDLEWARE
```python
MIDDLEWARE = [
    # ...
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'core.middleware.JWTBlacklistMiddleware',  # JWT Blacklist verification
    # ...
]
```

#### REDIS & CACHE
```python
REDIS_HOST = config('REDIS_HOST', default='localhost')
REDIS_PORT = config('REDIS_PORT', default=6379, cast=int)
REDIS_DB = config('REDIS_DB', default=0, cast=int)
REDIS_PASSWORD = config('REDIS_PASSWORD', default=None)

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': f'redis://{":" + REDIS_PASSWORD + "@" if REDIS_PASSWORD else ""}{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        },
        'KEY_PREFIX': 'shoemaker',
        'TIMEOUT': 300,
    }
}
```

#### SIMPLE_JWT
```python
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,

    # Configuration Blacklist
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_BLACKLIST_ENABLED': True,
    'JTI_CLAIM': 'jti',
}
```

---

## 🚀 Utilisation

### 1. Dans vos Views (Logout endpoint)

```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from core.utils import logout_user_tokens


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Endpoint de logout qui blacklist les tokens.

    Body:
    {
        "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
    }
    """
    # Récupérer l'Access Token depuis les headers
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    access_token = auth_header.replace('Bearer ', '') if auth_header else None

    # Récupérer le Refresh Token depuis le body
    refresh_token = request.data.get('refresh_token')

    if not access_token or not refresh_token:
        return Response(
            {'error': 'Access token and refresh token are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Blacklister les deux tokens
    result = logout_user_tokens(access_token, refresh_token)

    if result['success']:
        return Response(
            {'message': 'Successfully logged out'},
            status=status.HTTP_200_OK
        )
    else:
        return Response(
            {'error': 'Failed to logout', 'details': result},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
```

### 2. Exemple d'appel API (Frontend)

```javascript
// Logout
async function logout() {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    try {
        const response = await fetch('/api/auth/logout/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refresh_token: refreshToken
            })
        });

        if (response.ok) {
            // Supprimer les tokens du localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');

            // Rediriger vers login
            window.location.href = '/login';
        }
    } catch (error) {
        console.error('Logout failed:', error);
    }
}
```

---

## 🔧 Fonctions utilitaires (core/utils.py)

### `blacklist_access_token(token: str) -> bool`

Blacklist un Access Token dans Redis avec TTL automatique.

```python
from core.utils import blacklist_access_token

# Blacklister un Access Token
success = blacklist_access_token("eyJ0eXAiOiJKV1QiLCJhbGc...")
```

### `blacklist_refresh_token(refresh_token: str) -> bool`

Blacklist un Refresh Token dans la BDD via SimpleJWT.

```python
from core.utils import blacklist_refresh_token

# Blacklister un Refresh Token
success = blacklist_refresh_token("eyJ0eXAiOiJKV1QiLCJhbGc...")
```

### `logout_user_tokens(access_token: str, refresh_token: str) -> dict`

Blacklist les deux tokens en une seule fonction (recommandé).

```python
from core.utils import logout_user_tokens

# Logout complet
result = logout_user_tokens(
    access_token="eyJ0eXAiOiJKV1Qi...",
    refresh_token="eyJ0eXAiOiJKV1Qi..."
)

# result = {
#     'access_token_blacklisted': True,
#     'refresh_token_blacklisted': True,
#     'success': True
# }
```

---

## 🔍 Middleware (core/middleware.py)

Le middleware `JWTBlacklistMiddleware` intercepte toutes les requêtes et vérifie si l'Access Token est blacklisté dans Redis.

**Flow:**
1. Extraire le token de l'en-tête `Authorization`
2. Décoder le JWT pour récupérer le `jti` (JWT ID)
3. Vérifier dans Redis si `blacklist_access_token_{jti}` existe
4. Si blacklisté → retourner **401 Unauthorized**
5. Si non blacklisté → continuer normalement

---

## 🧪 Tests

### Tester la connexion Redis

```python
# Dans le shell Django
python manage.py shell

from django.core.cache import cache

# Test d'écriture
cache.set('test_key', 'test_value', timeout=60)

# Test de lecture
value = cache.get('test_key')
print(value)  # Devrait afficher: test_value
```

### Tester le blacklist

```python
from core.utils import logout_user_tokens

# Supposons que vous avez des tokens valides
access_token = "eyJ0eXAiOiJKV1QiLCJhbGc..."
refresh_token = "eyJ0eXAiOiJKV1QiLCJhbGc..."

# Blacklister
result = logout_user_tokens(access_token, refresh_token)
print(result)
# {'access_token_blacklisted': True, 'refresh_token_blacklisted': True, 'success': True}

# Essayer d'utiliser le token blacklisté
# → Devrait retourner 401 Unauthorized
```

---

## 📊 Vérifier les tokens blacklistés

### Dans Redis (Access Tokens)

```bash
# Connexion à Redis CLI
redis-cli

# Lister toutes les clés de blacklist
KEYS shoemaker:blacklist_access_token_*

# Voir la valeur d'une clé
GET shoemaker:blacklist_access_token_<jti>

# Voir le TTL (temps restant)
TTL shoemaker:blacklist_access_token_<jti>
```

### Dans PostgreSQL (Refresh Tokens)

```sql
-- Voir tous les tokens blacklistés
SELECT * FROM token_blacklist_blacklistedtoken;

-- Voir les tokens blacklistés récemment
SELECT * FROM token_blacklist_blacklistedtoken
ORDER BY blacklisted_at DESC
LIMIT 10;
```

---

## ❓ FAQ

### Pourquoi Redis pour les Access Tokens et PostgreSQL pour les Refresh Tokens?

- **Access Tokens** ont une durée de vie courte (1 jour) et sont utilisés fréquemment → Redis est plus rapide (cache en mémoire)
- **Refresh Tokens** ont une durée de vie longue (7 jours) et sont rarement utilisés → PostgreSQL est plus fiable (persistance)
- **TTL automatique** dans Redis supprime automatiquement les entrées expirées (pas besoin de nettoyage)

### Que se passe-t-il si Redis est down?

Le middleware `JWTBlacklistMiddleware` gère les erreurs de connexion Redis :
- En cas d'erreur, la requête continue normalement (fail-safe)
- Les tokens ne seront pas vérifiés temporairement
- **Important:** Surveillez les logs Redis en production

### Comment nettoyer les anciens tokens en BDD?

SimpleJWT propose une commande de nettoyage:

```bash
# Supprimer les tokens expirés de la BDD
python manage.py flushexpiredtokens
```

Ajoutez cette commande à un cron job pour l'exécuter régulièrement.

---

## 🔒 Sécurité

### Bonnes pratiques

1. **Utilisez HTTPS en production** - Les tokens JWT doivent toujours être transmis sur HTTPS
2. **Durée de vie courte** - Access Tokens: 15min-1h, Refresh Tokens: 1-7 jours
3. **Rotation des Refresh Tokens** - `ROTATE_REFRESH_TOKENS: True` génère un nouveau Refresh Token à chaque utilisation
4. **Blacklist automatique** - `BLACKLIST_AFTER_ROTATION: True` blacklist l'ancien Refresh Token
5. **Sécurisez Redis** - Utilisez un mot de passe Redis en production
6. **Logs** - Surveillez les tentatives d'utilisation de tokens blacklistés

### Configuration production

```python
# Production settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),  # Plus court en production
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# Redis sécurisé
REDIS_PASSWORD = config('REDIS_PASSWORD')  # Obligatoire en production
```

---

## 📝 Résumé

✅ **Access Tokens** → Redis (rapide, TTL automatique)
✅ **Refresh Tokens** → PostgreSQL (persistant, fiable)
✅ **Middleware** → Vérification automatique sur chaque requête
✅ **Logout** → Invalidation immédiate des deux tokens
✅ **Sécurité** → Protection contre la réutilisation de tokens révoqués

---

**Auteur:** Shoemaker Backend Team
**Dernière mise à jour:** 2025-12-18
