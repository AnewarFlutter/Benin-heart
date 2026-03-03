"""
DRF ViewSets for Temoignage Client API.
"""
from rest_framework import viewsets, mixins, filters
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from ...models import Temoignage
from .serializers import ClientTemoignageSerializer


@extend_schema_view(
    list=extend_schema(
        tags=['Client - Témoignage'],
        summary="Lister tous les témoignages",
        description="Récupère la liste de tous les témoignages clients publiés (accessible à tous)."
    ),
)
class ClientTemoignageViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for Temoignage model (Client).
    Clients can only list testimonials (read-only).
    """
    queryset = Temoignage.objects.all().order_by('-created_at')
    serializer_class = ClientTemoignageSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'profession']
    ordering_fields = ['created_at']


