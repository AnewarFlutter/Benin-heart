"""
WebSocket Consumer — Chat en temps réel.
URL: ws/chat/{conversation_uuid}/
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone


class ChatConsumer(AsyncWebsocketConsumer):
    """
    Consumer WebSocket pour une conversation spécifique.
    Chaque conversation a son groupe : chat_{conversation_uuid}
    """

    async def connect(self):
        user = self.scope.get('user')
        if not user or not user.is_authenticated:
            await self.close(code=4001)
            return

        self.user = user
        self.conversation_uuid = self.scope['url_route']['kwargs']['conversation_uuid']
        self.group_name = f'chat_{self.conversation_uuid}'

        # Vérifier que l'utilisateur est bien participant
        conversation = await self._get_conversation()
        if not conversation:
            await self.close(code=4003)
            return

        self.conversation = conversation
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        msg_type = data.get('type')

        if msg_type == 'message':
            texte = data.get('texte', '').strip()
            if not texte:
                return
            message = await self._save_message(texte)
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'chat_message',
                    'data': {
                        'uuid': str(message.uuid),
                        'auteur_id': self.user.pk,
                        'texte': message.texte,
                        'created_at': message.created_at.isoformat(),
                    }
                }
            )

        elif msg_type == 'typing':
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'typing_indicator',
                    'data': {
                        'user_id': self.user.pk,
                        'is_typing': data.get('is_typing', False),
                    }
                }
            )

        elif msg_type == 'lu':
            message_uuid = data.get('message_uuid')
            if message_uuid:
                await self._marquer_lu(message_uuid)
                await self.channel_layer.group_send(
                    self.group_name,
                    {
                        'type': 'message_lu',
                        'data': {
                            'message_uuid': message_uuid,
                            'lu_par': self.user.pk,
                        }
                    }
                )

    # --- Handlers ---

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'data': event['data'],
        }))

    async def typing_indicator(self, event):
        # Ne pas renvoyer au même utilisateur
        if event['data']['user_id'] != self.user.pk:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'data': event['data'],
            }))

    async def message_lu(self, event):
        await self.send(text_data=json.dumps({
            'type': 'lu',
            'data': event['data'],
        }))

    # --- DB helpers ---

    @database_sync_to_async
    def _get_conversation(self):
        from .models import Conversation
        from django.db.models import Q
        try:
            return Conversation.objects.get(
                uuid=self.conversation_uuid,
                est_active=True,
            )
        except Conversation.DoesNotExist:
            return None

    @database_sync_to_async
    def _check_participant(self):
        return (
            self.conversation.participant1 == self.user or
            self.conversation.participant2 == self.user
        )

    @database_sync_to_async
    def _save_message(self, texte):
        from .models import Message, Conversation
        message = Message.objects.create(
            conversation=self.conversation,
            auteur=self.user,
            texte=texte,
        )
        # Mettre à jour le dernier message sur la conversation
        Conversation.objects.filter(pk=self.conversation.pk).update(
            dernier_message_texte=texte[:500],
            dernier_message_at=message.created_at,
        )
        return message

    @database_sync_to_async
    def _marquer_lu(self, message_uuid):
        from .models import Message
        Message.objects.filter(
            uuid=message_uuid,
            conversation=self.conversation,
        ).exclude(auteur=self.user).update(lu=True, lu_at=timezone.now())
