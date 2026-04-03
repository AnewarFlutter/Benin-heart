"""
Views for client conversation endpoints.
"""
from django.utils import timezone
from django.db.models import Q
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, JSONParser
from drf_spectacular.utils import extend_schema

from ...models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer, EnvoyerMessageSerializer


class MesConversationsView(APIView):
    """GET /api/client/conversations/ — Liste de mes conversations actives."""
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Client - Conversations'],
        summary="Mes conversations",
        responses={200: ConversationSerializer(many=True)},
    )
    def get(self, request):
        conversations = Conversation.objects.filter(
            est_active=True
        ).filter(
            Q(participant1=request.user) | Q(participant2=request.user)
        ).select_related(
            'participant1__profil', 'participant2__profil'
        ).order_by('-dernier_message_at', '-created_at')
        serializer = ConversationSerializer(conversations, many=True, context={'request': request})
        return Response(serializer.data)


class ConversationMessagesView(APIView):
    """
    GET  /api/client/conversations/{uuid}/messages/ — Historique des messages
    POST /api/client/conversations/{uuid}/messages/ — Envoyer un message (REST fallback)
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, JSONParser]

    def _get_conversation(self, request, uuid):
        try:
            conv = Conversation.objects.get(
                uuid=uuid, est_active=True
            )
        except Conversation.DoesNotExist:
            return None
        if conv.participant1 != request.user and conv.participant2 != request.user:
            return None
        return conv

    @extend_schema(
        tags=['Client - Conversations'],
        summary="Historique des messages",
        description="Retourne les 50 derniers messages. Marque automatiquement comme lus.",
        responses={200: MessageSerializer(many=True)},
    )
    def get(self, request, uuid):
        conv = self._get_conversation(request, uuid)
        if not conv:
            return Response({'detail': 'Conversation introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        messages = conv.messages.select_related('auteur').order_by('-created_at')[:50]
        messages = list(reversed(list(messages)))

        # Marquer les messages non lus de l'autre comme lus
        conv.messages.filter(lu=False).exclude(auteur=request.user).update(
            lu=True, lu_at=timezone.now()
        )

        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)

    @extend_schema(
        tags=['Client - Conversations'],
        summary="Envoyer un message (REST)",
        description="Alternative REST au WebSocket. Préférer le WebSocket pour le temps réel.",
        request=EnvoyerMessageSerializer,
        responses={201: MessageSerializer},
    )
    def post(self, request, uuid):
        conv = self._get_conversation(request, uuid)
        if not conv:
            return Response({'detail': 'Conversation introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = EnvoyerMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        message = Message.objects.create(
            conversation=conv,
            auteur=request.user,
            **serializer.validated_data
        )
        Conversation.objects.filter(pk=conv.pk).update(
            dernier_message_texte=message.texte[:500],
            dernier_message_at=message.created_at,
        )
        return Response(MessageSerializer(message, context={'request': request}).data, status=status.HTTP_201_CREATED)


class OuvrirConversationView(APIView):
    """
    POST /api/client/conversations/ouvrir/ — Ouvrir une conversation avec un match.
    Crée la conversation si elle n'existe pas encore.
    """
    permission_classes = [IsAuthenticated]

    @extend_schema(
        tags=['Client - Conversations'],
        summary="Ouvrir une conversation",
        request={'application/json': {'type': 'object', 'properties': {'match_uuid': {'type': 'string'}}}},
        responses={200: ConversationSerializer, 201: ConversationSerializer},
    )
    def post(self, request):
        match_uuid = request.data.get('match_uuid')
        if not match_uuid:
            return Response({'detail': 'match_uuid requis.'}, status=status.HTTP_400_BAD_REQUEST)

        from apps.like.models import Match
        try:
            match = Match.objects.get(
                uuid=match_uuid, est_actif=True
            )
        except Match.DoesNotExist:
            return Response({'detail': 'Match introuvable.'}, status=status.HTTP_404_NOT_FOUND)

        # Vérifier que l'utilisateur est dans ce match
        if request.user not in (match.user1, match.user2):
            return Response({'detail': 'Accès refusé.'}, status=status.HTTP_403_FORBIDDEN)

        conv, created = Conversation.get_or_create_ordered(match.user1, match.user2, match=match)
        code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(ConversationSerializer(conv, context={'request': request}).data, status=code)
