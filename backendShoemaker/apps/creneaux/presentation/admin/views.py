"""
Views for admin endpoints
"""
from rest_framework import viewsets, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from django.utils import timezone
from datetime import timedelta
from ...models import Creneaux, CreneauxConfig
from .serializers import AdminCreneauxSerializer, AdminCreneauxListSerializer, AdminCreneauxConfigSerializer
from .permissions import IsAdminOrSuperAdmin


@extend_schema_view(
    list=extend_schema(
        tags=['Admin - Créneaux horaires'],
        summary="Lister tous les créneaux",
        description="Récupère la liste de tous les créneaux horaires (réservé aux administrateurs).",
        parameters=[
            OpenApiParameter(name='date', description='Filtrer par date (YYYY-MM-DD)', required=False, type=str),
            OpenApiParameter(name='date_debut', description='Date de début (YYYY-MM-DD)', required=False, type=str),
            OpenApiParameter(name='date_fin', description='Date de fin (YYYY-MM-DD)', required=False, type=str),
            OpenApiParameter(name='actif', description='Filtrer par statut actif (true/false)', required=False, type=bool),
            OpenApiParameter(name='disponible', description='Filtrer par disponibilité (true/false)', required=False, type=bool),
        ]
    ),
    retrieve=extend_schema(
        tags=['Admin - Créneaux horaires'],
        summary="Détails d'un créneau",
        description="Récupère les détails complets d'un créneau horaire spécifique."
    ),
    create=extend_schema(
        tags=['Admin - Créneaux horaires'],
        summary="Créer un créneau",
        description="Créer un nouveau créneau horaire."
    ),
    update=extend_schema(
        tags=['Admin - Créneaux horaires'],
        summary="Modifier un créneau (complet)",
        description="Modifier complètement un créneau horaire existant (tous les champs requis avec PUT)."
    ),
    partial_update=extend_schema(
        tags=['Admin - Créneaux horaires'],
        summary="Modifier un créneau (partiel)",
        description="Modifier partiellement un créneau horaire (seuls les champs fournis sont modifiés avec PATCH)."
    ),
    destroy=extend_schema(
        tags=['Admin - Créneaux horaires'],
        summary="Supprimer un créneau",
        description="Supprimer un créneau horaire (attention: cela peut affecter les réservations existantes)."
    )
)
class AdminCreneauxViewSet(viewsets.ModelViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for ADMIN creneaux management.
    Permet aux administrateurs de gérer les créneaux horaires.
    """
    queryset = Creneaux.objects.all()
    permission_classes = [IsAdminOrSuperAdmin]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def get_serializer_class(self):
        """Retourne le serializer approprié selon l'action."""
        if self.action == 'list':
            return AdminCreneauxListSerializer
        elif self.action in ['update', 'partial_update']:
            from .serializers import AdminCreneauxUpdateSerializer
            return AdminCreneauxUpdateSerializer
        return AdminCreneauxSerializer

    def get_queryset(self):
        """
        Filtre les créneaux selon les paramètres de requête.
        """
        queryset = Creneaux.objects.all().order_by('date', 'heure_debut')

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

        # Filtrer par statut actif
        actif = self.request.query_params.get('actif')
        if actif is not None:
            queryset = queryset.filter(actif=actif.lower() == 'true')

        # Filtrer par disponibilité
        disponible = self.request.query_params.get('disponible')
        if disponible is not None:
            is_disponible = disponible.lower() == 'true'
            if is_disponible:
                # Filtrer pour ne garder que les créneaux disponibles
                creneaux_disponibles = []
                for creneau in queryset:
                    if creneau.est_disponible():
                        creneaux_disponibles.append(creneau.id)
                queryset = queryset.filter(id__in=creneaux_disponibles)
            else:
                # Filtrer pour ne garder que les créneaux non disponibles
                creneaux_non_disponibles = []
                for creneau in queryset:
                    if not creneau.est_disponible():
                        creneaux_non_disponibles.append(creneau.id)
                queryset = queryset.filter(id__in=creneaux_non_disponibles)

        return queryset

    def destroy(self, request, *args, **kwargs):
        """
        Supprime un créneau horaire.
        DELETE /api/admin/creneaux/{id}/
        """
        creneau = self.get_object()

        # Vérifier s'il y a des réservations
        if creneau.reservations_actuelles > 0:
            return Response({
                'error': f'Impossible de supprimer ce créneau car il a {creneau.reservations_actuelles} réservation(s) active(s)'
            }, status=status.HTTP_400_BAD_REQUEST)

        date_str = creneau.date.strftime('%d/%m/%Y')
        horaire = f"{creneau.heure_debut.strftime('%H:%M')} - {creneau.heure_fin.strftime('%H:%M')}"
        creneau.delete()

        return Response({
            'message': f'Créneau du {date_str} ({horaire}) supprimé avec succès'
        }, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['Admin - Créneaux horaires'],
        summary="Statistiques des créneaux",
        description="Récupère les statistiques globales des créneaux horaires."
    )
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Récupère les statistiques des créneaux.
        GET /api/admin/creneaux/statistics/
        """
        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)
        next_week = today + timedelta(days=7)

        total_creneaux = Creneaux.objects.count()
        creneaux_actifs = Creneaux.objects.filter(actif=True).count()
        creneaux_inactifs = Creneaux.objects.filter(actif=False).count()

        # Créneaux aujourd'hui
        creneaux_aujourd_hui = Creneaux.objects.filter(date=today).count()

        # Créneaux demain
        creneaux_demain = Creneaux.objects.filter(date=tomorrow).count()

        # Créneaux dans les 7 prochains jours
        creneaux_semaine = Creneaux.objects.filter(
            date__gte=today,
            date__lte=next_week
        ).count()

        # Créneaux disponibles dans les 7 prochains jours
        creneaux_semaine_queryset = Creneaux.objects.filter(
            date__gte=today,
            date__lte=next_week,
            actif=True
        )
        creneaux_disponibles = []
        for creneau in creneaux_semaine_queryset:
            if creneau.est_disponible():
                creneaux_disponibles.append(creneau.id)

        creneaux_disponibles_semaine = len(creneaux_disponibles)

        # Taux d'occupation global
        total_capacite = sum(c.capacite_max for c in Creneaux.objects.all())
        total_reservations = sum(c.reservations_actuelles for c in Creneaux.objects.all())
        taux_occupation_global = (total_reservations / total_capacite * 100) if total_capacite > 0 else 0

        return Response({
            'total_creneaux': total_creneaux,
            'creneaux_actifs': creneaux_actifs,
            'creneaux_inactifs': creneaux_inactifs,
            'creneaux_aujourd_hui': creneaux_aujourd_hui,
            'creneaux_demain': creneaux_demain,
            'creneaux_semaine': creneaux_semaine,
            'creneaux_disponibles_semaine': creneaux_disponibles_semaine,
            'total_capacite': total_capacite,
            'total_reservations': total_reservations,
            'taux_occupation_global': round(taux_occupation_global, 2)
        })

    @extend_schema(
        tags=['Admin - Créneaux horaires'],
        summary="Activer/Désactiver un créneau",
        description="Change le statut actif d'un créneau horaire."
    )
    @action(detail=True, methods=['post'])
    def toggle_actif(self, request, uuid=None):
        """
        Toggle le statut actif d'un créneau.
        POST /api/admin/creneaux/{id}/toggle_actif/
        """
        creneau = self.get_object()
        creneau.actif = not creneau.actif
        creneau.save()

        return Response({
            'message': f"Créneau {'activé' if creneau.actif else 'désactivé'} avec succès.",
            'actif': creneau.actif
        })


class AdminCreneauxConfigView(views.APIView):
    """
    Vue pour gérer la configuration du système de créneaux (admin only).
    Singleton - une seule instance de configuration.
    """
    permission_classes = [IsAdminOrSuperAdmin]

    @extend_schema(
        tags=['Admin - Créneaux horaires'],
        summary="Récupérer la configuration",
        description="Récupère la configuration du système de créneaux (réservé aux administrateurs).",
        responses={200: AdminCreneauxConfigSerializer}
    )
    def get(self, request):
        """
        GET /api/admin/creneaux/config/
        Retourne la configuration actuelle du système de créneaux.
        """
        config = CreneauxConfig.get_config()
        serializer = AdminCreneauxConfigSerializer(config)
        return Response(serializer.data)

    @extend_schema(
        tags=['Admin - Créneaux horaires'],
        summary="Modifier la configuration",
        description="Modifie la configuration du système de créneaux (activer/désactiver, message). Réservé aux administrateurs.",
        request=AdminCreneauxConfigSerializer,
        responses={200: AdminCreneauxConfigSerializer}
    )
    def patch(self, request):
        """
        PATCH /api/admin/creneaux/config/
        Modifie partiellement la configuration (ex: changer uniquement 'actif').
        """
        config = CreneauxConfig.get_config()
        serializer = AdminCreneauxConfigSerializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            'message': f"Configuration mise à jour. Système de créneaux: {'ACTIVÉ' if config.actif else 'DÉSACTIVÉ'}",
            'config': serializer.data
        })

    @extend_schema(
        tags=['Admin - Créneaux horaires'],
        summary="Remplacer la configuration",
        description="Remplace complètement la configuration du système de créneaux. Réservé aux administrateurs.",
        request=AdminCreneauxConfigSerializer,
        responses={200: AdminCreneauxConfigSerializer}
    )
    def put(self, request):
        """
        PUT /api/admin/creneaux/config/
        Remplace complètement la configuration.
        """
        config = CreneauxConfig.get_config()
        serializer = AdminCreneauxConfigSerializer(config, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            'message': f"Configuration remplacée. Système de créneaux: {'ACTIVÉ' if config.actif else 'DÉSACTIVÉ'}",
            'config': serializer.data
        })
