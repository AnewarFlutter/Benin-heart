"""
DRF ViewSets for Temoignage Admin API.
"""
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from ...models import Temoignage
from .serializers import AdminTemoignageSerializer
from .permissions import IsAdminOrSuperAdmin


@extend_schema_view(
    list=extend_schema(
        tags=['Admin - Témoignage'],
        summary="Lister tous les témoignages",
        description="Récupère la liste de tous les témoignages clients (réservé aux administrateurs)."
    ),
    retrieve=extend_schema(
        tags=['Admin - Témoignage'],
        summary="Détails d'un témoignage",
        description="Récupère les détails complets d'un témoignage spécifique (réservé aux administrateurs)."
    ),
    create=extend_schema(
        tags=['Admin - Témoignage'],
        summary="Créer un nouveau témoignage",
        description="Permet de créer un nouveau témoignage client (réservé aux administrateurs)."
    ),
    update=extend_schema(
        tags=['Admin - Témoignage'],
        summary="Modifier un témoignage",
        description="Permet de modifier complètement un témoignage existant (réservé aux administrateurs)."
    ),
    partial_update=extend_schema(
        tags=['Admin - Témoignage'],
        summary="Modifier partiellement un témoignage",
        description="Permet de modifier partiellement un témoignage existant (réservé aux administrateurs)."
    ),
    destroy=extend_schema(
        tags=['Admin - Témoignage'],
        summary="Supprimer un témoignage",
        description="Permet de supprimer un témoignage (réservé aux administrateurs).",
        responses={
            200: {
                "description": "Témoignage supprimé avec succès",
                "type": "object",
                "properties": {
                    "message": {"type": "string"}
                }
            }
        }
    ),
)
class AdminTemoignageViewSet(viewsets.ModelViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for Temoignage model (Admin).
    Admins have full CRUD access to testimonials.
    """
    queryset = Temoignage.objects.all().order_by('-created_at')
    serializer_class = AdminTemoignageSerializer
    permission_classes = [IsAdminOrSuperAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'profession', 'description']
    ordering_fields = ['created_at', 'name']

    def destroy(self, request, *args, **kwargs):
        """
        Supprimer un témoignage et retourner un message de confirmation.
        DELETE /api/admin/temoignages/{uuid}/
        """
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'Témoignage supprimé avec succès'},
            status=status.HTTP_200_OK
        )
