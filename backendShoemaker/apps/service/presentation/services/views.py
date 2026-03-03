"""
Views for client service endpoints (public)
"""
from rest_framework import viewsets, mixins
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from ...models import Service, ServiceCategory
from .serializers import ClientServiceSerializer, ClientServiceCategorySerializer


class ClientServiceViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for CLIENT service viewing (public, read-only).
    """
    queryset = Service.objects.filter(statut='actif').order_by('nom')
    serializer_class = ClientServiceSerializer
    permission_classes = [AllowAny]  # Public access

    @extend_schema(
        tags=['Client - Service'],
        summary='Liste des services disponibles',
        description='Récupère la liste de tous les services actifs (accès public)'
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


class ClientServiceCategoryViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    ViewSet pour les catégories de services avec services imbriqués (public).
    """
    lookup_field = 'uuid'
    queryset = ServiceCategory.objects.filter(statut='actif').prefetch_related('services').order_by('ordre', 'nom')
    serializer_class = ClientServiceCategorySerializer
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Client - Service'],
        summary='Liste des catégories avec leurs services',
        description='Récupère les catégories actives avec leurs services actifs imbriqués (accès public)'
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)
