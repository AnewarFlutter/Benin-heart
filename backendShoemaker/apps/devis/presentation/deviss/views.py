"""
Views for client endpoints (public)
"""
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from ...models import Devis
from .serializers import ClientDevisSerializer


class ClientDevisViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for CLIENT devis viewing (public, read-only).
    """
    queryset = Devis.objects.all()
    serializer_class = ClientDevisSerializer
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Client - Devis'],
        summary="Liste des deviss",
        description="Récupère la liste des deviss (accès public)"
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['Client - Devis'],
        summary="Détails d'un devis",
        description="Récupère les détails d'un devis (accès public)"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
