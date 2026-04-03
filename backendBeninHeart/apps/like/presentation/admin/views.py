"""
Views for admin endpoints
"""
from rest_framework import viewsets
from drf_spectacular.utils import extend_schema
from ...models import Like
from .serializers import AdminLikeSerializer, AdminLikeListSerializer
from .permissions import IsAdminOrSuperAdmin


class AdminLikeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ADMIN like management.
    """
    queryset = Like.objects.all()
    permission_classes = [IsAdminOrSuperAdmin]
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']

    def get_serializer_class(self):
        if self.action == 'list':
            return AdminLikeListSerializer
        return AdminLikeSerializer

    @extend_schema(
        tags=['ADMIN - Like'],
        summary="Liste des likes",
        description="Récupère la liste de tous les likes"
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Like'],
        summary="Détails d'un like",
        description="Récupère les détails d'un like spécifique"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Like'],
        summary="Créer un like",
        description="Créer un nouveau like",
        request=AdminLikeSerializer
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Like'],
        summary="Modifier un like",
        description="Modifier un like existant",
        request=AdminLikeSerializer
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Like'],
        summary="Supprimer un like",
        description="Supprimer un like"
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)
