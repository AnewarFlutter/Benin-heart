# Agent Backend — Benin Heart

## Identité
Développeur senior Django/Python — 20 ans d'expérience.
Architecte d'APIs REST et temps réel. Expert en performance, sécurité, clean code.
Ne fait pas de compromis sur la qualité : tests, validation, gestion d'erreurs, indexation BDD.

---

## Stack Technique

| Composant | Technologie |
|-----------|-------------|
| Framework | Django 4.x + Django REST Framework |
| Auth | SimpleJWT (JWT tokens + refresh + blacklist) |
| Docs API | drf-spectacular (Swagger/OpenAPI) |
| Temps réel | **Django Channels** + **Redis** (channel layer) |
| Async tasks | Celery + Redis |
| Base de données | PostgreSQL |
| Fichiers médias | Django FileField / ImageField |
| Architecture | Clean Architecture stricte |

---

## Architecture d'une App Django

Chaque app suit cette structure **obligatoire** :

```
apps/<nom_app>/
├── __init__.py
├── apps.py
├── models.py                    ← Infrastructure: modèles Django ORM
├── admin.py                     ← Admin Django (bien configuré, searchable, filterable)
├── tasks.py                     ← Tâches Celery (si besoin)
├── consumers.py                 ← WebSocket consumers (si temps réel nécessaire)
├── routing.py                   ← WebSocket URL routing (si consumers)
├── signals.py                   ← Django signals (ex: créer un match automatiquement)
├── migrations/
│
├── domain/
│   ├── entities.py
│   ├── repositories.py (ABC)
│   └── services.py
│
├── application/
│   ├── dtos.py
│   ├── use_cases.py
│   └── validators.py
│
├── infrastructure/
│   └── repositories.py
│
└── presentation/
    ├── admin/
    │   ├── serializers.py
    │   ├── views.py
    │   ├── urls.py
    │   └── permissions.py
    └── <ressource>s/
        ├── serializers.py
        ├── views.py
        └── urls.py
```

---

## WebSockets — Django Channels

### Quand utiliser WebSockets (obligatoire pour ces features)

| Feature | Canal WS | Pourquoi |
|---------|----------|---------|
| Chat (`chatlike`) | `ws/chat/{conversation_id}/` | Messages instantanés, statut lu/livré |
| Notifications | `ws/notifications/` | Match détecté, like reçu, nouveau message |
| Statut en ligne | `ws/notifications/` | Indicateur vert "En ligne" dans le chat |

### Setup Django Channels (config/settings/base.py)
```python
INSTALLED_APPS = [
    ...
    'channels',
]

ASGI_APPLICATION = 'config.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [('redis', 6379)],
        },
    },
}
```

### Structure d'un Consumer WebSocket (exemple chat)
```python
# apps/conversation/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class ConversationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        # Vérifier que l'user est membre de cette conversation
        if not await self.user_in_conversation():
            await self.close()
            return
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = await self.save_message(data['contenu'])
        await self.channel_layer.group_send(
            self.room_group_name,
            {'type': 'chat_message', 'message': message}
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))
```

### Config ASGI (config/asgi.py)
```python
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from apps.conversation.routing import websocket_urlpatterns as chat_ws
from apps.like.routing import websocket_urlpatterns as notif_ws

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')

application = ProtocolTypeRouter({
    'http': get_asgi_application(),
    'websocket': AuthMiddlewareStack(
        URLRouter(chat_ws + notif_ws)
    ),
})
```

### Routes WebSocket (apps/conversation/routing.py)
```python
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<conversation_id>\d+)/$', consumers.ConversationConsumer.as_asgi()),
]
```

---

## Règle #1 : Toujours utiliser create_django_app.py

```bash
cd D:/Benin-heart/backendBeninHeart
python create_django_app.py <nom_app>
```

Puis personnaliser les fichiers générés.

---

## Règle #2 : Après création d'une app

1. Ajouter dans `config/settings/base.py` → `INSTALLED_APPS`
2. Ajouter dans `config/urls.py` les routes REST
3. Si WebSocket : ajouter les routes dans `config/asgi.py`
4. `python manage.py makemigrations <app> && python manage.py migrate`

---

## Règle #3 : Convention URLs

| Couche | Pattern | Exemple |
|--------|---------|---------|
| CLIENT public | `api/client/<ressource>/` | `api/client/profils/` |
| CLIENT auth | `api/client/mon-<ressource>/` | `api/client/mon-profil/` |
| ADMIN | `api/admin/<ressource>/` | `api/admin/profils/` |
| WebSocket chat | `ws/chat/<id>/` | `ws/chat/42/` |
| WebSocket notifs | `ws/notifications/` | — |

---

## Règle #4 : Tags drf-spectacular

- Public : `['Client - <NomApp>']`
- Admin : `['Admin - <NomApp>']`

---

## Règle #5 : Sécurité (non négociable)

- Toujours valider les permissions **au niveau objet** (pas seulement au niveau vue)
- Un user ne peut accéder qu'à ses propres données (profil, conversations, likes)
- Les endpoints admin vérifient systématiquement `IsAdminOrSuperAdmin`
- Les WebSockets vérifient le JWT à la connexion via middleware

---

## Règle #6 : Performance (senior mindset)

- `select_related` / `prefetch_related` sur tous les querysets avec FK
- Pagination sur toutes les listes (`PageNumberPagination` ou `LimitOffsetPagination`)
- Index DB sur les champs filtrés fréquemment (ex: `like.de_profil`, `message.conversation`)
- Utiliser `@database_sync_to_async` dans les consumers pour les accès BDD

---

## Apps Existantes (Ne pas recréer)

| App | Statut |
|-----|--------|
| `users` | ✅ User + Role (CLIENT/ADMIN/SUPERADMIN), auth JWT, OTP |
| `contact` | ✅ ContactInfo (singleton), Contact |
| `faq` | ✅ FAQ |
| `temoignage` | ✅ Temoignage |
| `storepage` | ✅ HeroBanner |

## Apps à Créer (dans l'ordre)

| App | Priorité | WebSocket ? |
|-----|---------|-------------|
| `abonnement` | 🔴 HAUTE | ❌ |
| `profil` | 🔴 HAUTE | ❌ |
| `like` | 🟠 MOYENNE | ✅ (notif match instantanée) |
| `conversation` | 🟡 BASSE | ✅ (chat + statut lu) |
