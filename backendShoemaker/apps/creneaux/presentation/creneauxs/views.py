"""
Views for client endpoints (public)
"""
from rest_framework import viewsets, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from django.utils import timezone
from ...models import Creneaux, CreneauxConfig
from .serializers import ClientCreneauxSerializer, CreneauxConfigSerializer


@extend_schema_view(
    list=extend_schema(
        tags=['Client - Créneaux horaires'],
        summary="Lister les créneaux disponibles",
        description="Récupère la liste des créneaux horaires disponibles pour réservation (accès public).",
        parameters=[
            OpenApiParameter(name='date', description='Filtrer par date (YYYY-MM-DD)', required=False, type=str),
            OpenApiParameter(name='date_debut', description='Date de début (YYYY-MM-DD)', required=False, type=str),
            OpenApiParameter(name='date_fin', description='Date de fin (YYYY-MM-DD)', required=False, type=str),
        ]
    ),
    retrieve=extend_schema(
        tags=['Client - Créneaux horaires'],
        summary="Détails d'un créneau",
        description="Récupère les détails d'un créneau horaire spécifique (accès public)."
    )
)
class ClientCreneauxViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for CLIENT creneaux viewing (public, read-only).
    Affiche uniquement les créneaux disponibles.
    """
    serializer_class = ClientCreneauxSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        """
        Retourne uniquement les créneaux disponibles, filtrés par date si demandé.
        Un créneau est disponible si:
        - Il est actif
        - La capacité maximale n'est pas atteinte
        - La durée limite avant le début n'est pas dépassée
        """
        today = timezone.now().date()
        queryset = Creneaux.objects.filter(
            date__gte=today,
            actif=True
        ).order_by('date', 'heure_debut')

        # Filtrer par date exacte
        date_param = self.request.query_params.get('date')
        if date_param:
            queryset = queryset.filter(date=date_param)

        # Filtrer par plage de dates
        date_debut = self.request.query_params.get('date_debut')
        date_fin = self.request.query_params.get('date_fin')
        if date_debut:
            queryset = queryset.filter(date__gte=date_debut)
        if date_fin:
            queryset = queryset.filter(date__lte=date_fin)

        # Filtrer pour ne garder que les créneaux disponibles
        # (capacité non atteinte + délai non dépassé)
        creneaux_disponibles = []
        for creneau in queryset:
            if creneau.est_disponible():
                creneaux_disponibles.append(creneau.id)

        return queryset.filter(id__in=creneaux_disponibles)


class CreneauxConfigView(views.APIView):
    """
    Vue pour récupérer la configuration du système de créneaux.
    Permet au client de savoir si les créneaux sont activés ou non.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Client - Créneaux horaires'],
        summary="Configuration du système de créneaux",
        description="Récupère la configuration du système de créneaux pour savoir si les créneaux prédéfinis sont requis ou non (accès public).",
        responses={200: CreneauxConfigSerializer}
    )
    def get(self, request):
        """
        GET /api/client/creneaux/config/
        Retourne la configuration actuelle du système de créneaux.
        """
        config = CreneauxConfig.get_config()
        serializer = CreneauxConfigSerializer(config)
        return Response(serializer.data)
