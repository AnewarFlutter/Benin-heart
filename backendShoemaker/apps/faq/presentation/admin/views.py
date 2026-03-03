"""
DRF ViewSets for FAQ Admin API.
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from ...models import FAQ
from .serializers import AdminFaqSerializer
from .permissions import IsAdminOrSuperAdmin


@extend_schema_view(
    list=extend_schema(
        tags=['Admin - FAQ'],
        summary="Lister toutes les FAQ",
        description="Récupère la liste de toutes les questions fréquemment posées (réservé aux administrateurs)."
    ),
    retrieve=extend_schema(
        tags=['Admin - FAQ'],
        summary="Détails d'une FAQ",
        description="Récupère les détails complets d'une question FAQ spécifique (réservé aux administrateurs)."
    ),
    create=extend_schema(
        tags=['Admin - FAQ'],
        summary="Créer une nouvelle FAQ",
        description="Permet de créer une nouvelle question FAQ (réservé aux administrateurs)."
    ),
    update=extend_schema(
        tags=['Admin - FAQ'],
        summary="Modifier une FAQ",
        description="Permet de modifier complètement une question FAQ existante (réservé aux administrateurs)."
    ),
    partial_update=extend_schema(
        tags=['Admin - FAQ'],
        summary="Modifier partiellement une FAQ",
        description="Permet de modifier partiellement une question FAQ existante (réservé aux administrateurs)."
    ),
    destroy=extend_schema(
        tags=['Admin - FAQ'],
        summary="Supprimer une FAQ",
        description="Permet de supprimer une question FAQ (réservé aux administrateurs).",
        responses={
            200: {
                "description": "FAQ supprimée avec succès",
                "type": "object",
                "properties": {
                    "message": {"type": "string"}
                }
            }
        }
    ),
)
class AdminFaqViewSet(viewsets.ModelViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for FAQ model (Admin).
    Admins have full CRUD access to FAQs.
    """
    queryset = FAQ.objects.all()
    serializer_class = AdminFaqSerializer
    permission_classes = [IsAdminOrSuperAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['question']
    search_fields = ['question', 'answer']
    ordering_fields = ['created_at', 'question']

    def destroy(self, request, *args, **kwargs):
        """
        Supprimer une FAQ et retourner un message de confirmation.
        DELETE /api/admin/faq/{uuid}/
        """
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(
            {'message': 'FAQ supprimée avec succès'},
            status=status.HTTP_200_OK
        )

    @extend_schema(
        tags=['Admin - FAQ'],
        summary="Création en masse de FAQ",
        description="Permet de créer plusieurs FAQ en une seule requête (réservé aux administrateurs).",
        request=AdminFaqSerializer(many=True),
        responses={201: AdminFaqSerializer(many=True)}
    )
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        Create multiple FAQs at once.
        POST /api/admin/faq/bulk_create/
        Body: Liste de FAQ à créer
        """
        # Validate that request.data is a list
        if not isinstance(request.data, list):
            return Response(
                {'error': 'Les données doivent être une liste de FAQ'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate each FAQ
        serializer = AdminFaqSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)

        # Create all FAQs
        faqs = serializer.save()

        return Response(
            {
                'message': f'{len(faqs)} FAQ créées avec succès',
                'faqs': AdminFaqSerializer(faqs, many=True).data
            },
            status=status.HTTP_201_CREATED
        )
