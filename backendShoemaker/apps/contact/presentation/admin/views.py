"""
DRF ViewSets for Contact Admin API.
"""
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view
from ...models import Contact, ContactInfo
from .serializers import AdminContactSerializer, AdminContactInfoSerializer
from .permissions import IsAdminOrSuperAdmin


@extend_schema_view(
    list=extend_schema(
        tags=['Admin - Contact'],
        summary="Lister tous les messages de contact",
        description="Récupère la liste de tous les messages de contact reçus (réservé aux administrateurs)."
    ),
    retrieve=extend_schema(
        tags=['Admin - Contact'],
        summary="Détails d'un message de contact",
        description="Récupère les détails complets d'un message de contact spécifique (réservé aux administrateurs)."
    ),
)
class AdminContactViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for Contact model (Admin).
    Admins can view contact messages (read-only).
    """
    queryset = Contact.objects.all().order_by('-created_at')
    serializer_class = AdminContactSerializer
    permission_classes = [IsAdminOrSuperAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'sujet', 'message']
    ordering_fields = ['created_at', 'name']

    def get_queryset(self):
        """Filter to show all contacts for admins."""
        return Contact.objects.all().order_by('-created_at')


@extend_schema_view(
    list=extend_schema(
        tags=['Admin - Contact Info'],
        summary="Récupérer les informations de contact",
        description="Récupère les informations de contact de l'entreprise (réservé aux administrateurs).",
        responses={
            200: AdminContactInfoSerializer,
            401: {"description": "Non authentifié - Token manquant ou invalide"},
            403: {"description": "Permission refusée - Réservé aux administrateurs"}
        }
    ),
    update=extend_schema(
        tags=['Admin - Contact Info'],
        summary="Mettre à jour les informations de contact",
        description="Met à jour les informations de contact de l'entreprise (réservé aux administrateurs).",
        responses={
            200: AdminContactInfoSerializer,
            400: {"description": "Données invalides - Vérifiez les champs requis"},
            401: {"description": "Non authentifié - Token manquant ou invalide"},
            403: {"description": "Permission refusée - Réservé aux administrateurs"}
        }
    ),
    partial_update=extend_schema(
        tags=['Admin - Contact Info'],
        summary="Mettre à jour partiellement les informations de contact",
        description="Met à jour partiellement les informations de contact de l'entreprise (réservé aux administrateurs).",
        responses={
            200: AdminContactInfoSerializer,
            400: {"description": "Données invalides - Vérifiez les champs requis"},
            401: {"description": "Non authentifié - Token manquant ou invalide"},
            403: {"description": "Permission refusée - Réservé aux administrateurs"}
        }
    ),
)
class AdminContactInfoViewSet(viewsets.ViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for ContactInfo model (Admin).
    Gère les informations de contact de l'entreprise (singleton).
    """
    permission_classes = [IsAdminOrSuperAdmin]
    serializer_class = AdminContactInfoSerializer

    def list(self, request):
        """
        Récupère l'instance unique de ContactInfo.
        GET /api/admin/contact-info/
        """
        instance = ContactInfo.get_instance()
        serializer = AdminContactInfoSerializer(instance)
        return Response(serializer.data)

    def update(self, request, uuid=None):
        """
        Met à jour complètement l'instance unique de ContactInfo.
        PUT /api/admin/contact-info/1/
        """
        instance = ContactInfo.get_instance()
        serializer = AdminContactInfoSerializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def partial_update(self, request, uuid=None):
        """
        Met à jour partiellement l'instance unique de ContactInfo.
        PATCH /api/admin/contact-info/1/
        """
        instance = ContactInfo.get_instance()
        serializer = AdminContactInfoSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
