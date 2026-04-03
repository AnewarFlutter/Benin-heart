"""
Views for admin profil endpoints.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from ...models import Profil
from .serializers import AdminProfilSerializer, AdminProfilListSerializer
from .permissions import IsAdminOrSuperAdmin


class AdminProfilViewSet(viewsets.ModelViewSet):
    """
    Gestion des profils membres.
    GET /api/admin/profils/
    GET/PATCH /api/admin/profils/{pk}/
    POST /api/admin/profils/{pk}/suspendre/
    POST /api/admin/profils/{pk}/bannir/
    POST /api/admin/profils/{pk}/verifier/
    """
    permission_classes = [IsAdminOrSuperAdmin]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_queryset(self):
        qs = Profil.objects.select_related('user').order_by('-created_at')
        statut = self.request.query_params.get('statut')
        genre = self.request.query_params.get('genre')
        if statut:
            qs = qs.filter(statut=statut)
        if genre:
            qs = qs.filter(genre=genre)
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return AdminProfilListSerializer
        return AdminProfilSerializer

    @extend_schema(
        tags=['ADMIN - Profils'],
        summary="Liste des profils",
        description="Filtrable par ?statut=ACTIF|INACTIF|SUSPENDU|BANNI et ?genre=HOMME|FEMME|AUTRE",
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(tags=['ADMIN - Profils'], summary="Détails d'un profil")
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(tags=['ADMIN - Profils'], summary="Modifier statut/vérification")
    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)

    @extend_schema(tags=['ADMIN - Profils'], summary="Suspendre un profil", responses={200: AdminProfilSerializer})
    @action(detail=True, methods=['post'])
    def suspendre(self, request, pk=None):
        profil = self.get_object()
        profil.statut = 'SUSPENDU'
        profil.save(update_fields=['statut', 'updated_at'])
        return Response(AdminProfilSerializer(profil).data)

    @extend_schema(tags=['ADMIN - Profils'], summary="Bannir un profil", responses={200: AdminProfilSerializer})
    @action(detail=True, methods=['post'])
    def bannir(self, request, pk=None):
        profil = self.get_object()
        profil.statut = 'BANNI'
        profil.save(update_fields=['statut', 'updated_at'])
        return Response(AdminProfilSerializer(profil).data)

    @extend_schema(tags=['ADMIN - Profils'], summary="Vérifier un profil", responses={200: AdminProfilSerializer})
    @action(detail=True, methods=['post'])
    def verifier(self, request, pk=None):
        profil = self.get_object()
        profil.est_verifie = True
        profil.save(update_fields=['est_verifie', 'updated_at'])
        return Response(AdminProfilSerializer(profil).data)
