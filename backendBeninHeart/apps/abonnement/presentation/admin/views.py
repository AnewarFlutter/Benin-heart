"""
Views for admin abonnement endpoints.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from drf_spectacular.utils import extend_schema

from ...models import PlanAbonnement, Souscription
from .serializers import (
    AdminPlanAbonnementSerializer,
    AdminPlanAbonnementListSerializer,
    AdminSouscriptionSerializer,
    AdminSouscriptionUpdateSerializer,
)
from .permissions import IsAdminOrSuperAdmin


class AdminPlanAbonnementViewSet(viewsets.ModelViewSet):
    """
    CRUD complet des plans d'abonnement.
    GET/POST /api/admin/plans/
    GET/PUT/PATCH/DELETE /api/admin/plans/{pk}/
    """
    permission_classes = [IsAdminOrSuperAdmin]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        qs = PlanAbonnement.objects.annotate(souscriptions_count=Count('souscriptions'))
        return qs.order_by('ordre')

    def get_serializer_class(self):
        if self.action == 'list':
            return AdminPlanAbonnementListSerializer
        return AdminPlanAbonnementSerializer

    @extend_schema(tags=['ADMIN - Plans'], summary="Liste des plans")
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(tags=['ADMIN - Plans'], summary="Détails d'un plan")
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(tags=['ADMIN - Plans'], summary="Créer un plan", request=AdminPlanAbonnementSerializer)
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(tags=['ADMIN - Plans'], summary="Modifier un plan", request=AdminPlanAbonnementSerializer)
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(tags=['ADMIN - Plans'], summary="Modifier partiellement un plan")
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(tags=['ADMIN - Plans'], summary="Supprimer un plan")
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)


class AdminSouscriptionViewSet(viewsets.ModelViewSet):
    """
    Gestion des souscriptions (validation manuelle).
    GET /api/admin/souscriptions/
    GET/PATCH /api/admin/souscriptions/{pk}/
    POST /api/admin/souscriptions/{pk}/valider/
    POST /api/admin/souscriptions/{pk}/annuler/
    """
    permission_classes = [IsAdminOrSuperAdmin]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_queryset(self):
        qs = Souscription.objects.select_related('user', 'plan').order_by('-created_at')
        statut = self.request.query_params.get('statut')
        if statut:
            qs = qs.filter(statut=statut)
        return qs

    def get_serializer_class(self):
        if self.action in ('partial_update',):
            return AdminSouscriptionUpdateSerializer
        return AdminSouscriptionSerializer

    @extend_schema(
        tags=['ADMIN - Souscriptions'],
        summary="Liste des souscriptions",
        description="Filtrable par ?statut=EN_ATTENTE|ACTIVE|EXPIREE|ANNULEE",
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(tags=['ADMIN - Souscriptions'], summary="Détails d'une souscription")
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Souscriptions'],
        summary="Modifier statut / dates / notes",
        request=AdminSouscriptionUpdateSerializer,
    )
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Souscriptions'],
        summary="Valider une souscription",
        description="Passe le statut à ACTIVE.",
        responses={200: AdminSouscriptionSerializer},
    )
    @action(detail=True, methods=['post'])
    def valider(self, request, pk=None):
        souscription = self.get_object()
        souscription.statut = 'ACTIVE'
        souscription.save(update_fields=['statut', 'updated_at'])
        return Response(AdminSouscriptionSerializer(souscription).data)

    @extend_schema(
        tags=['ADMIN - Souscriptions'],
        summary="Annuler une souscription",
        responses={200: AdminSouscriptionSerializer},
    )
    @action(detail=True, methods=['post'])
    def annuler(self, request, pk=None):
        souscription = self.get_object()
        souscription.statut = 'ANNULEE'
        souscription.save(update_fields=['statut', 'updated_at'])
        return Response(AdminSouscriptionSerializer(souscription).data)
