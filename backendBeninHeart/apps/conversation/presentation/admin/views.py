"""
Views for admin endpoints
"""
from rest_framework import viewsets
from drf_spectacular.utils import extend_schema
from ...models import Conversation
from .serializers import AdminConversationSerializer, AdminConversationListSerializer
from .permissions import IsAdminOrSuperAdmin


class AdminConversationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ADMIN conversation management.
    """
    queryset = Conversation.objects.all()
    permission_classes = [IsAdminOrSuperAdmin]
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']

    def get_serializer_class(self):
        if self.action == 'list':
            return AdminConversationListSerializer
        return AdminConversationSerializer

    @extend_schema(
        tags=['ADMIN - Conversation'],
        summary="Liste des conversations",
        description="Récupère la liste de tous les conversations"
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Conversation'],
        summary="Détails d'un conversation",
        description="Récupère les détails d'un conversation spécifique"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Conversation'],
        summary="Créer un conversation",
        description="Créer un nouveau conversation",
        request=AdminConversationSerializer
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Conversation'],
        summary="Modifier un conversation",
        description="Modifier un conversation existant",
        request=AdminConversationSerializer
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Conversation'],
        summary="Supprimer un conversation",
        description="Supprimer un conversation"
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
