"""
Views for admin endpoints
"""
from rest_framework import viewsets
from drf_spectacular.utils import extend_schema
from ...models import Storepage
from .serializers import AdminStorepageSerializer, AdminStorepageListSerializer
from .permissions import IsAdminOrSuperAdmin


class AdminStorepageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ADMIN storepage management.
    """
    queryset = Storepage.objects.all()
    permission_classes = [IsAdminOrSuperAdmin]
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']

    def get_serializer_class(self):
        if self.action == 'list':
            return AdminStorepageListSerializer
        return AdminStorepageSerializer

    @extend_schema(
        tags=['ADMIN - Storepage'],
        summary="Liste des storepages",
        description="Récupère la liste de tous les storepages"
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Storepage'],
        summary="Détails d'un storepage",
        description="Récupère les détails d'un storepage spécifique"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Storepage'],
        summary="Créer un storepage",
        description="Créer un nouveau storepage",
        request=AdminStorepageSerializer
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Storepage'],
        summary="Modifier un storepage",
        description="Modifier un storepage existant",
        request=AdminStorepageSerializer
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Storepage'],
        summary="Supprimer un storepage",
        description="Supprimer un storepage"
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
