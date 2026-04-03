"""
WebSocket Consumer — Notifications temps réel (likes, matchs, statut en ligne).
URL: ws/notifications/
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone


class NotificationsConsumer(AsyncWebsocketConsumer):
    """
    Canal de notifications pour un utilisateur connecté.
    Chaque user rejoint son propre groupe : notifications_{user_id}
    """

    async def connect(self):
        user = self.scope.get('user')
        if not user or not user.is_authenticated:
            await self.close(code=4001)
            return

        self.user = user
        self.group_name = f'notifications_{user.pk}'

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Marquer l'utilisateur comme en ligne
        await self._set_en_ligne(True)

        # Informer ses matchs qu'il est en ligne
        await self._broadcast_statut(True)

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

        if hasattr(self, 'user'):
            await self._set_en_ligne(False)
            await self._broadcast_statut(False)

    async def receive(self, text_data):
        """Le client peut envoyer un ping pour maintenir la connexion."""
        try:
            data = json.loads(text_data)
            if data.get('type') == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
        except (json.JSONDecodeError, KeyError):
            pass

    # --- Handlers d'événements du channel layer ---

    async def nouveau_like(self, event):
        await self.send(text_data=json.dumps({
            'type': 'nouveau_like',
            'data': event['data'],
        }))

    async def nouveau_match(self, event):
        await self.send(text_data=json.dumps({
            'type': 'nouveau_match',
            'data': event['data'],
        }))

    async def statut_en_ligne(self, event):
        await self.send(text_data=json.dumps({
            'type': 'statut_en_ligne',
            'data': event['data'],
        }))

    # --- Helpers ---

    @database_sync_to_async
    def _set_en_ligne(self, est_en_ligne: bool):
        try:
            profil = self.user.profil
            profil.est_en_ligne = est_en_ligne
            if est_en_ligne:
                profil.derniere_activite = timezone.now()
            profil.save(update_fields=['est_en_ligne', 'derniere_activite', 'updated_at'])
        except Exception:
            pass

    @database_sync_to_async
    def _get_match_user_ids(self):
        """Retourne les IDs des utilisateurs avec qui on a un match actif."""
        from apps.like.models import Match
        matchs = Match.objects.filter(
            est_actif=True
        ).filter(
            user1=self.user
        ).values_list('user2_id', flat=True)
        matchs2 = Match.objects.filter(
            est_actif=True
        ).filter(
            user2=self.user
        ).values_list('user1_id', flat=True)
        return list(matchs) + list(matchs2)

    async def _broadcast_statut(self, est_en_ligne: bool):
        """Informe les contacts matchés du changement de statut."""
        user_ids = await self._get_match_user_ids()
        for uid in user_ids:
            await self.channel_layer.group_send(
                f'notifications_{uid}',
                {
                    'type': 'statut_en_ligne',
                    'data': {
                        'user_id': self.user.pk,
                        'est_en_ligne': est_en_ligne,
                    }
                }
            )
