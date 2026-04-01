"""
DRF ViewSets for FAQ Client API.
"""
from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from ...models import FAQ
from .serializers import ClientFaqSerializer


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
)
class ClientFaqViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for FAQ model (Client).
    Clients can only view FAQs (read-only).
    """
    queryset = FAQ.objects.all()
    serializer_class = ClientFaqSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['question']
    search_fields = ['question', 'answer']
    ordering_fields = ['created_at', 'question']
