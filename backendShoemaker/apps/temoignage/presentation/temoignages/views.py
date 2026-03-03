"""
Views for client endpoints (public)
"""
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from ...models import Temoignage
from .serializers import ClientTemoignageSerializer


class ClientTemoignageViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for CLIENT temoignage viewing (public, read-only).
    """
    queryset = Temoignage.objects.all()
    serializer_class = ClientTemoignageSerializer
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Client - Temoignage'],
        summary="Liste des temoignages",
        description="Récupère la liste des temoignages (accès public)"
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['Client - Temoignage'],
        summary="Détails d'un temoignage",
        description="Récupère les détails d'un temoignage (accès public)"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
