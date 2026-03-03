"""
DRF ViewSets for Devis Admin API.
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view
from ...models import Devis, DevisProduit
from .serializers import (
    AdminDevisListSerializer,
    AdminDevisDetailSerializer,
    AdminRepondreDevisSerializer
)
from .permissions import IsAdminOrSuperAdmin


@extend_schema_view(
    list=extend_schema(
        tags=['Admin - Devis'],
        summary="Lister tous les devis",
        description="Récupère la liste de toutes les demandes de devis (réservé aux administrateurs).",
        responses={
            200: AdminDevisListSerializer(many=True),
            401: {"description": "Non authentifié - Token manquant ou invalide"},
            403: {"description": "Permission refusée - Réservé aux administrateurs"}
        }
    ),
    retrieve=extend_schema(
        tags=['Admin - Devis'],
        summary="Détails d'un devis",
        description="Récupère les détails complets d'un devis avec tous les produits (réservé aux administrateurs).",
        responses={
            200: AdminDevisDetailSerializer,
            401: {"description": "Non authentifié - Token manquant ou invalide"},
            403: {"description": "Permission refusée - Réservé aux administrateurs"},
            404: {"description": "Devis non trouvé - L'ID spécifié n'existe pas"}
        }
    ),
)
class AdminDevisViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for Devis model (Admin).
    Admins can view and respond to devis requests.
    """
    queryset = Devis.objects.all().order_by('-created_at')
    permission_classes = [IsAdminOrSuperAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['statut', 'email', 'telephone']
    search_fields = ['code_devis', 'nom_complet', 'email', 'telephone', 'informations_supplementaires']
    ordering_fields = ['created_at', 'date_reponse', 'date_expiration', 'montant_total_ttc']

    def get_serializer_class(self):
        if self.action == 'list':
            return AdminDevisListSerializer
        return AdminDevisDetailSerializer

    @extend_schema(
        tags=['Admin - Devis'],
        summary="Répondre à un devis",
        description="Permet de répondre à une demande de devis en définissant les prix et en envoyant la facture au client.",
        request=AdminRepondreDevisSerializer,
        responses={
            200: {"description": "Devis envoyé au client avec succès"},
            400: {"description": "Données invalides - Vérifiez les montants et les prix des produits"},
            401: {"description": "Non authentifié - Token manquant ou invalide"},
            403: {"description": "Permission refusée - Réservé aux administrateurs"},
            404: {"description": "Devis non trouvé - L'ID spécifié n'existe pas"}
        }
    )
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def repondre(self, request, uuid=None):
        """
        Répondre à un devis et envoyer la facture au client.
        POST /api/admin/devis/{id}/repondre/
        """
        devis = self.get_object()

        # Vérifier que le devis est en attente
        if devis.statut not in ['en_attente', 'en_cours']:
            return Response(
                {'error': f'Ce devis a déjà été traité (statut: {devis.get_statut_display()}).'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = AdminRepondreDevisSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Mettre à jour les prix des produits
        produits_data = {str(p['id']): p for p in serializer.validated_data['produits']}
        for produit in devis.produits.all():
            produit_uuid_str = str(produit.uuid)
            if produit_uuid_str not in produits_data:
                return Response(
                    {'error': f'Le prix du produit {produit_uuid_str} est manquant.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            produit_prix = produits_data[produit_uuid_str]
            produit.prix_unitaire_ht = produit_prix['prix_unitaire_ht']
            produit.prix_unitaire_ttc = produit_prix['prix_unitaire_ttc']
            produit.save()

        # Mettre à jour le devis
        devis.montant_total_ht = serializer.validated_data['montant_total_ht']
        devis.montant_total_ttc = serializer.validated_data['montant_total_ttc']
        devis.message_admin = serializer.validated_data.get('message_admin', '')
        devis.date_expiration = serializer.validated_data['date_expiration']
        devis.statut = 'envoye'
        devis.date_reponse = timezone.now()
        devis.traite_par = request.user
        devis.save()

        # Envoyer l'email avec le devis au client
        from ...tasks import send_devis_response_client
        transaction.on_commit(lambda: send_devis_response_client.delay(devis.id))

        return Response(
            {
                'message': 'Le devis a été envoyé au client avec succès.',
                'code_devis': devis.code_devis
            },
            status=status.HTTP_200_OK
        )
