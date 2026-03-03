"""
Views for admin service endpoints
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from drf_spectacular.utils import extend_schema
from django.db.models import Q, Count
from ...models import Service, ServiceCategory
from apps.commande.models import CommandeProduitService
from .serializers import (
    AdminServiceSerializer, AdminServiceListSerializer, AdminServiceUpdateSerializer,
    AdminServiceCategorySerializer, AdminServiceCategoryUpdateSerializer
)
from .permissions import IsAdminOrSuperAdmin


class AdminServiceViewSet(viewsets.ModelViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for ADMIN service management.
    """
    queryset = Service.objects.all()
    permission_classes = [IsAdminOrSuperAdmin]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def get_serializer_class(self):
        if self.action == 'list':
            return AdminServiceListSerializer
        elif self.action in ['update', 'partial_update']:
            return AdminServiceUpdateSerializer
        return AdminServiceSerializer

    def get_queryset(self):
        """
        Filtre le queryset selon les paramètres de requête.
        Supporte: statut, category_id, search (par nom/description)
        """
        queryset = Service.objects.select_related('category').order_by('-created_at')

        # Filtre par statut
        statut = self.request.query_params.get('statut', None)
        if statut:
            queryset = queryset.filter(statut=statut.lower())

        # Filtre par catégorie
        category_id = self.request.query_params.get('category_id', None)
        if category_id:
            queryset = queryset.filter(category__uuid=category_id)

        # Recherche par nom ou description
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(nom__icontains=search) |
                Q(description__icontains=search)
            )

        return queryset

    @extend_schema(
        tags=['ADMIN - Service'],
        summary='Liste des services',
        description='Récupère la liste de tous les services (admin). Filtrable par statut (actif/inactif/brouillon) et recherche (search)'
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Service'],
        summary="Détails d'un service",
        description="Récupère les détails d'un service spécifique"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Service'],
        summary='Créer un nouveau service',
        description='Créer un nouveau service (admin uniquement)',
        request=AdminServiceSerializer
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Service'],
        summary='Modifier un service',
        description='Modifier complètement un service existant',
        request=AdminServiceSerializer
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Service'],
        summary='Supprimer un service',
        description="Suppression définitive d'un service"
    )
    def destroy(self, request, *args, **kwargs):
        service = self.get_object()
        nom = service.nom
        service.delete()
        return Response({
            'message': f'Service "{nom}" supprimé avec succès'
        }, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['ADMIN - Service'],
        summary='Statistiques des services',
        description='Récupère les statistiques des services'
    )
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Récupère les statistiques des services.
        GET /api/admin/services/statistics/
        """
        total = Service.objects.count()
        actifs = Service.objects.filter(statut='actif').count()
        inactifs = Service.objects.filter(statut='inactif').count()
        brouillons = Service.objects.filter(statut='brouillon').count()

        # Services les plus populaires (basés sur le nombre de commandes)
        # Compter combien de fois chaque service a été utilisé dans les commandes
        popular_services = (
            CommandeProduitService.objects
            .values('service__uuid', 'service__nom')
            .annotate(usage_count=Count('id'))
            .order_by('-usage_count')[:5]  # Top 5 services les plus utilisés
        )

        most_popular_services = [
            {
                'id': str(service['service__uuid']),
                'nom': service['service__nom'],
                'usage_count': service['usage_count']
            }
            for service in popular_services
        ] if popular_services.exists() else None

        return Response({
            "total_services": total,
            "active_services": actifs,
            "by_status": {
                "actifs": actifs,
                "inactifs": inactifs,
                "brouillons": brouillons,
            },
            "most_popular_services": most_popular_services or None,
        }, status=status.HTTP_200_OK)


class AdminServiceCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ADMIN service category management.
    Supports image upload via multipart/form-data.
    """
    lookup_field = 'uuid'
    queryset = ServiceCategory.objects.all()
    permission_classes = [IsAdminOrSuperAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def get_serializer_class(self):
        if self.action in ['update', 'partial_update']:
            return AdminServiceCategoryUpdateSerializer
        return AdminServiceCategorySerializer

    def get_queryset(self):
        """
        Filtre le queryset selon les paramètres de requête.
        Supporte: statut, search (par nom/description)
        """
        queryset = ServiceCategory.objects.all().order_by('nom')

        # Filtre par statut
        statut = self.request.query_params.get('statut', None)
        if statut:
            queryset = queryset.filter(statut=statut.lower())

        # Recherche par nom ou description
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(nom__icontains=search) |
                Q(description__icontains=search)
            )

        return queryset

    @extend_schema(
        tags=['ADMIN - Service Category'],
        summary='Liste des catégories de services',
        description='Récupère la liste de toutes les catégories de services. Filtrable par statut (actif/inactif) et recherche (search)'
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Service Category'],
        summary="Détails d'une catégorie",
        description="Récupère les détails d'une catégorie spécifique"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Service Category'],
        summary='Créer une nouvelle catégorie',
        description='Créer une nouvelle catégorie de services (admin uniquement)',
        request=AdminServiceCategorySerializer
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Service Category'],
        summary='Modifier une catégorie',
        description='Modifier une catégorie existante',
        request=AdminServiceCategoryUpdateSerializer
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Service Category'],
        summary='Supprimer une catégorie',
        description="Suppression définitive d'une catégorie"
    )
    def destroy(self, request, *args, **kwargs):
        category = self.get_object()
        nom = category.nom
        category.delete()
        return Response({
            'message': f'Catégorie "{nom}" supprimée avec succès'
        }, status=status.HTTP_200_OK)
