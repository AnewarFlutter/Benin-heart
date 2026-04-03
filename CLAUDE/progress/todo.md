# Plan de Travail — Benin Heart

> Équipe de développeurs seniors — 20 ans d'expérience.
> Abonnements gérés via Django admin (pas de paiement en ligne pour l'instant).
> Les endpoints `/api/admin/*` sont à développer maintenant pour le futur admin frontend.
> Features temps réel (chat, notifications, statut en ligne) via **WebSocket (Django Channels)**.

---

## ÉTAPE 0 — Setup Django Channels (WebSocket) — À faire AVANT les apps like/conversation

### Installation
```bash
pip install channels channels-redis daphne
```

### config/settings/base.py
```python
INSTALLED_APPS = [
    'daphne',        # ← en premier
    ...
    'channels',
]

ASGI_APPLICATION = 'config.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': { 'hosts': [('redis', 6379)] },
    }
}
```

### config/asgi.py (réécrire)
```python
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django_asgi_app = get_asgi_application()

# Import des routings WS après django setup
from apps.conversation.routing import websocket_urlpatterns as chat_ws
from apps.like.routing import websocket_urlpatterns as notif_ws

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': AuthMiddlewareStack(
        URLRouter(chat_ws + notif_ws)
    ),
})
```

### docker-compose.yml — vérifier que Redis est présent (il est déjà là pour Celery ✅)

---

## ÉTAPE 1 — Migrations users (URGENT, 5 min)

```bash
cd D:/Benin-heart/backendBeninHeart
python manage.py makemigrations users
python manage.py migrate
```

---

## ÉTAPE 2 — App `abonnement` (HAUTE PRIORITÉ)

```bash
python create_django_app.py abonnement
```

### Modèle `PlanAbonnement`
```python
class PlanAbonnement(TimeStampedModel):
    slug = CharField(max_length=50, unique=True)          # 'gratuit', 'premium', 'vip'
    titre = CharField(max_length=100)
    description = TextField()
    prix = DecimalField(max_digits=8, decimal_places=2)
    prix_affiche = CharField(max_length=50)               # "14,99€ / mois"
    duree = CharField(max_length=50)                      # "Mensuel", "À vie"
    fonctionnalites = JSONField(default=list)             # ["Likes illimités", ...]
    fonctionnalites_exclues = JSONField(default=list)
    est_populaire = BooleanField(default=False)
    icone = CharField(max_length=50, default='heart')     # 'heart', 'star', 'crown'
    ordre = PositiveIntegerField(default=0)
    est_actif = BooleanField(default=True)
```

### Modèle `Souscription`
```python
class Souscription(TimeStampedModel):
    STATUT_CHOICES = [('ACTIVE','Active'), ('EXPIREE','Expirée'), ('ANNULEE','Annulée'), ('EN_ATTENTE','En attente')]
    user = ForeignKey(User, on_delete=CASCADE)
    plan = ForeignKey(PlanAbonnement, on_delete=PROTECT)
    date_debut = DateField()
    date_fin = DateField(null=True, blank=True)
    statut = CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    nombre_mois = PositiveIntegerField(default=1)
    # Infos paiement (pour l'admin)
    prenom = CharField(max_length=100, blank=True)
    nom = CharField(max_length=100, blank=True)
    telephone = CharField(max_length=20, blank=True)
    adresse = CharField(max_length=255, blank=True)
    ville = CharField(max_length=100, blank=True)
    code_promo = CharField(max_length=50, blank=True, null=True)
```

### Endpoints à créer
- **CLIENT** : `GET /api/client/plans/` (public), `POST /api/client/souscriptions/`, `GET /api/client/mon-abonnement/`, `POST /api/client/mon-abonnement/annuler/`
- **ADMIN** : `GET/POST/PUT/DELETE /api/admin/plans/`, `GET/PUT/DELETE /api/admin/souscriptions/`

---

## ÉTAPE 3 — App `profil` (HAUTE PRIORITÉ)

```bash
python create_django_app.py profil
```

### Modèle `Profil`
```python
class Profil(TimeStampedModel):
    user = OneToOneField(User, on_delete=CASCADE, related_name='profil')
    bio = TextField(blank=True, null=True)
    date_naissance = DateField(null=True, blank=True)
    profession = CharField(max_length=255, blank=True, null=True)
    ville = CharField(max_length=255, blank=True, null=True)
    pays = CharField(max_length=100, default='Bénin')
    centres_interet = JSONField(default=list)
    niveau_education = CharField(max_length=100, blank=True, null=True)
    ecole = CharField(max_length=255, blank=True, null=True)
    domaine_etudes = CharField(max_length=255, blank=True, null=True)
    video_url = FileField(upload_to='profils/videos/', null=True, blank=True)
    est_visible = BooleanField(default=True)
    est_vedette = BooleanField(default=False)               # Pour la page d'accueil
    # Préférences notifications
    notifs_likes = BooleanField(default=True)
    notifs_messages = BooleanField(default=True)
    notifs_matchs = BooleanField(default=True)
```

### Modèle `PhotoProfil`
```python
class PhotoProfil(TimeStampedModel):
    profil = ForeignKey(Profil, on_delete=CASCADE, related_name='photos')
    image = ImageField(upload_to='profils/photos/')
    ordre = PositiveIntegerField(default=0)
    est_principale = BooleanField(default=False)
```

### Endpoints à créer
- **CLIENT** : `GET /api/client/profils/` (swipe, paginated), `GET /api/client/profils/vedettes/`, `GET/PUT/PATCH /api/client/mon-profil/`, `POST/DELETE /api/client/mon-profil/photos/`, `POST/DELETE /api/client/mon-profil/video/`
- **ADMIN** : `GET/PUT/DELETE /api/admin/profils/`, `GET/PUT /api/admin/profils/{id}/`

---

## ÉTAPE 4 — App `like` + WebSocket Notifications (MOYENNE PRIORITÉ)

```bash
python create_django_app.py like
```

### Modèle `Like`
```python
class Like(TimeStampedModel):
    TYPE_CHOICES = [('LIKE', 'Like'), ('SUPERLIKE', 'Super Like'), ('DISLIKE', 'Dislike')]
    de_profil = ForeignKey(Profil, on_delete=CASCADE, related_name='likes_envoyes')
    vers_profil = ForeignKey(Profil, on_delete=CASCADE, related_name='likes_recus')
    type_like = CharField(max_length=10, choices=TYPE_CHOICES)

    class Meta:
        unique_together = ['de_profil', 'vers_profil']
```

### Modèle `Match`
```python
class Match(TimeStampedModel):
    profil_a = ForeignKey(Profil, on_delete=CASCADE, related_name='matchs_a')
    profil_b = ForeignKey(Profil, on_delete=CASCADE, related_name='matchs_b')
    est_actif = BooleanField(default=True)
    # Créé automatiquement quand 2 profils se likent mutuellement
```

### Endpoints REST à créer
- **CLIENT** : `POST /api/client/likes/`, `POST /api/client/superlikes/`, `POST /api/client/dislikes/`, `GET /api/client/mes-likes/`, `GET /api/client/mes-favoris/`, `GET /api/client/mes-stats/`
- **ADMIN** : `GET /api/admin/likes/` (statistiques)

### WebSocket — Canal `ws/notifications/`
```python
# apps/like/consumers.py
class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope['user']
        if not user.is_authenticated:
            await self.close(); return
        self.group_name = f'notifications_{user.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    # Appelé depuis un signal Django quand un match est créé
    async def nouveau_match(self, event):
        await self.send(text_data=json.dumps({'type': 'nouveau_match', 'profil': event['profil']}))

    async def nouveau_like(self, event):
        await self.send(text_data=json.dumps({'type': 'nouveau_like', 'profil': event['profil']}))
```

### Signal Django — Notifier en temps réel lors d'un match
```python
# apps/like/signals.py
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

@receiver(post_save, sender=Match)
def notifier_match(sender, instance, created, **kwargs):
    if not created: return
    channel_layer = get_channel_layer()
    for profil, autre in [(instance.profil_a, instance.profil_b), (instance.profil_b, instance.profil_a)]:
        async_to_sync(channel_layer.group_send)(
            f'notifications_{profil.user_id}',
            {'type': 'nouveau_match', 'profil': {'id': autre.id, 'prenom': autre.user.first_name, 'photo': str(autre.photos.filter(est_principale=True).first().image)}}
        )
```

---

## ÉTAPE 5 — App `conversation` + WebSocket Chat (BASSE PRIORITÉ)

```bash
python create_django_app.py conversation
```

### Modèle `Conversation`
```python
class Conversation(TimeStampedModel):
    match = OneToOneField(Match, on_delete=CASCADE, related_name='conversation')
    est_active = BooleanField(default=True)
```

### Modèle `Message`
```python
class Message(TimeStampedModel):
    STATUT_CHOICES = [('SENT','Envoyé'), ('DELIVERED','Livré'), ('READ','Lu')]
    conversation = ForeignKey(Conversation, on_delete=CASCADE, related_name='messages')
    auteur = ForeignKey(Profil, on_delete=CASCADE)
    contenu = TextField()
    statut = CharField(max_length=10, choices=STATUT_CHOICES, default='SENT')
```

### Endpoints REST (historique + liste)
- **CLIENT** : `GET /api/client/conversations/`, `GET /api/client/conversations/{id}/messages/` (pagination), `POST /api/client/conversations/{id}/lire/`
- **ADMIN** : `GET /api/admin/conversations/` (modération)

### WebSocket — Canal `ws/chat/{conversation_id}/`
```python
# apps/conversation/consumers.py
class ConversationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conv_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room = f'chat_{self.conv_id}'
        user = self.scope['user']
        if not user.is_authenticated or not await self.user_in_conversation(user):
            await self.close(); return
        await self.channel_layer.group_add(self.room, self.channel_name)
        # Marquer l'utilisateur en ligne
        await self.set_online_status(user, True)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room, self.channel_name)
        await self.set_online_status(self.scope['user'], False)

    async def receive(self, text_data):
        data = json.loads(text_data)
        if data['type'] == 'message':
            msg = await self.save_message(data['contenu'])
            await self.channel_layer.group_send(self.room, {'type': 'chat_message', 'message': msg})
        elif data['type'] == 'typing':
            await self.channel_layer.group_send(self.room, {'type': 'typing_indicator', 'auteur_id': self.scope['user'].id, 'est_en_train_de_taper': data['est_en_train_de_taper']})
        elif data['type'] == 'lire':
            await self.marquer_lu()
            await self.channel_layer.group_send(self.room, {'type': 'messages_lus', 'lu_par': self.scope['user'].id})

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({'type': 'message', **event['message']}))

    async def typing_indicator(self, event):
        if event['auteur_id'] != self.scope['user'].id:
            await self.send(text_data=json.dumps(event))

    async def messages_lus(self, event):
        await self.send(text_data=json.dumps(event))
```

### Routing WebSocket
```python
# apps/conversation/routing.py
websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<conversation_id>\d+)/$', ConversationConsumer.as_asgi()),
]
# apps/like/routing.py
websocket_urlpatterns = [
    re_path(r'ws/notifications/$', NotificationConsumer.as_asgi()),
]
```

---

## ÉTAPE 6 — Connecter Storefront aux APIs existantes

Les APIs backend existent déjà. Connecter le frontend :

| Composant | API | Action |
|-----------|-----|--------|
| `hero_banner_carousel.tsx` | `GET /api/storepages/hero-banners/` | Remplacer données statiques |
| `before_and_after.tsx` | `GET /api/client/temoignages/` | Remplacer données statiques |
| `answer_and_question.tsx` | `GET /api/client/faqs/` | Remplacer données statiques |
| `contact_form_card.tsx` | `POST /api/client/contact/` | Connecter le formulaire |
| `contact_info_card.tsx` | `GET /api/client/contact-info/` | Charger depuis l'API |
