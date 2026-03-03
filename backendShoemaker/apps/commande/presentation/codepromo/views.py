"""
DRF ViewSets for Code Promo Client API.
"""
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema, extend_schema_view
from ...models import CodePromo
from .serializers import ClientCodePromoSerializer


@extend_schema_view(
    list=extend_schema(
        tags=['Client - Code Promo'],
        summary="Lister tous les codes promo actifs",
        description="Récupère la liste de tous les codes promo actuellement valides et actifs (accessible à tous)."
    ),
    retrieve=extend_schema(
        tags=['Client - Code Promo'],
        summary="Détails d'un code promo",
        description="Récupère les détails d'un code promo spécifique par son code (accessible à tous)."
    ),
)
class ClientCodePromoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for CodePromo model (Client).
    Clients can only view valid promotional codes (read-only).
    """
    serializer_class = ClientCodePromoSerializer
    permission_classes = [AllowAny]
    lookup_field = 'code'  # Permet de rechercher par code au lieu de l'ID

    def get_queryset(self):
        """Retourne uniquement les codes promo actifs."""
        from django.utils import timezone
        now = timezone.now()
        return CodePromo.objects.filter(
            actif=True,
            date_debut__lte=now,
            date_fin__gte=now
        ).order_by('-created_at')
