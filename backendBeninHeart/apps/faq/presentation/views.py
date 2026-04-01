"""
DRF ViewSets for FAQ API.
"""
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from core.permissions import IsAdminOrReadOnly
from ..models import FAQ
from .serializers import FaqSerializer


@extend_schema_view(
    list=extend_schema(
        tags=['Client - FAQ'],
        summary="Lister toutes les FAQ",
        description="Récupère la liste de toutes les questions fréquemment posées (accessible à tous)."
    ),
    retrieve=extend_schema(
        tags=['Client - FAQ'],
        summary="Détails d'une FAQ",
        description="Récupère les détails complets d'une question FAQ spécifique (accessible à tous)."
    ),
    create=extend_schema(
        tags=['Admin - FAQ'],
        summary="Créer une nouvelle FAQ",
        description="Permet de créer une nouvelle question FAQ (réservé aux administrateurs)."
    ),
    update=extend_schema(
        tags=['Admin - FAQ'],
        summary="Modifier une FAQ",
        description="Permet de modifier complètement une question FAQ existante (réservé aux administrateurs)."
    ),
    partial_update=extend_schema(
        tags=['Admin - FAQ'],
        summary="Modifier partiellement une FAQ",
        description="Permet de modifier partiellement une question FAQ existante (réservé aux administrateurs)."
    ),
    destroy=extend_schema(
        tags=['Admin - FAQ'],
        summary="Supprimer une FAQ",
        description="Permet de supprimer une question FAQ (réservé aux administrateurs)."
    ),
)
class FaqViewSet(viewsets.ModelViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for FAQ model.
    Anyone can view FAQs, seuls les admins peuvent créer/modifier/supprimer.
    """
    queryset = FAQ.objects.all()
    serializer_class = FaqSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['question']
    search_fields = ['question', 'answer']
    ordering_fields = ['created_at', 'question']
