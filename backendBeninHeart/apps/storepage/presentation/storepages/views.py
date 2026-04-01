"""
Views for client endpoints (public)
"""
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from ...models import HeroBanner
from .serializers import HeroBannerSerializer


class HeroBannerViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet pour les bannières Hero (public, lecture seule).
    Retourne uniquement les bannières actives, triées par ordre.
    """
    serializer_class = HeroBannerSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """Retourne uniquement les bannières actives."""
        return HeroBanner.objects.filter(actif=True).order_by('ordre')

    @extend_schema(
        tags=['Client - Storepage'],
        summary="Liste des bannières Hero",
        description="Récupère la liste des bannières Hero actives pour le carousel"
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['Client - Storepage'],
        summary="Détails d'une bannière",
        description="Récupère les détails d'une bannière Hero"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)
