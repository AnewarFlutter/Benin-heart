"""
Views for client endpoints
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from drf_spectacular.utils import extend_schema
from django.db import transaction
from decimal import Decimal

from ...models import MoyenPaiement, CodePromo, Commande, CommandeProduit, CommandeProduitService
from apps.service.models import Service
from .serializers import (
    ClientMoyenPaiementSerializer,
    CheckoutSerializer,
    ClientCommandeSerializer,
    ClientCommandeListSerializer,
    TrackingCommandeSerializer
)
from .permissions import IsOwnerOrAdmin
from core.permissions import IsClient


# ==================== MOYENS DE PAIEMENT (lecture seule) ====================

class ClientMoyenPaiementViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for CLIENT to view active payment methods (public, read-only).
    """
    queryset = MoyenPaiement.objects.filter(actif=True)
    serializer_class = ClientMoyenPaiementSerializer
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Client - Moyen de paiement'],
        summary="Liste des moyens de paiement actifs",
        description="Récupère la liste des moyens de paiement disponibles (accès public)"
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['Client - Moyen de paiement'],
        summary="Détails d'un moyen de paiement",
        description="Récupère les détails d'un moyen de paiement (accès public)"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)


# ==================== COMMANDES ====================

class ClientCommandeViewSet(viewsets.ModelViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for CLIENT commande management.
    """
    permission_classes = [IsAuthenticated, IsClient]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        """Client can only see their own commandes."""
        return Commande.objects.filter(user=self.request.user).select_related(
            'moyen_paiement', 'code_promo'
        ).prefetch_related('produits__services')

    def get_serializer_class(self):
        if self.action == 'list':
            return ClientCommandeListSerializer
        elif self.action == 'checkout':
            return CheckoutSerializer
        return ClientCommandeSerializer

    def get_permissions(self):
        """Apply IsOwnerOrAdmin for detail views."""
        if self.action in ['retrieve']:
            return [IsAuthenticated(), IsOwnerOrAdmin()]
        return super().get_permissions()

    @extend_schema(exclude=True)
    def create(self, request, *args, **kwargs):
        """Disable standard create - use checkout action instead."""
        return Response(
            {'detail': 'Utilisez l\'endpoint /api/client/commandes/checkout/ pour créer une commande'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    @extend_schema(
        tags=['Client - Commande'],
        summary="Liste de mes commandes",
        description="Récupère la liste de toutes mes commandes"
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['Client - Commande'],
        summary="Détails d'une commande",
        description="Récupère les détails complets d'une de mes commandes"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    def _parse_formdata_to_checkout_format(self, request):
        """
        Parse FormData with nested bracket notation into the format expected by CheckoutSerializer.
        Handles formats like: produits[0][description], produits[0][services_ids][0], collecte[adresse]
        """
        import re
        from collections import defaultdict

        data = request.data
        files = request.FILES

        # Initialize result structure
        result = {
            'moyen_paiement_id': data.get('moyen_paiement_id'),
            'code_promo': data.get('code_promo', ''),
            'produits': defaultdict(dict),
            'collecte': {}
        }

        # Parse all keys
        for key, value in data.items():
            # Parse produits[0][field] or produits[0][services_ids][0]
            produit_match = re.match(r'produits\[(\d+)\]\[([^\]]+)\](?:\[(\d+)\])?', key)
            if produit_match:
                index = int(produit_match.group(1))
                field = produit_match.group(2)
                sub_index = produit_match.group(3)

                if sub_index is not None:
                    # It's an array field like services_ids[0]
                    if field not in result['produits'][index]:
                        result['produits'][index][field] = []
                    result['produits'][index][field].append(value)
                else:
                    # It's a regular field
                    result['produits'][index][field] = value
                continue

            # Parse collecte[field]
            collecte_match = re.match(r'collecte\[([^\]]+)\]', key)
            if collecte_match:
                field = collecte_match.group(1)
                result['collecte'][field] = value
                continue

        # Parse FILES for photos
        for key, file in files.items():
            photo_match = re.match(r'produits\[(\d+)\]\[photo\]', key)
            if photo_match:
                index = int(photo_match.group(1))
                result['produits'][index]['photo'] = file

        # Convert produits defaultdict to list
        if result['produits']:
            max_index = max(result['produits'].keys())
            produits_list = []
            for i in range(max_index + 1):
                if i in result['produits']:
                    produits_list.append(result['produits'][i])
            result['produits'] = produits_list
        else:
            result['produits'] = []

        return result

    @extend_schema(
        tags=['Client - Commande'],
        summary="Créer une commande (checkout)",
        description="Créer une nouvelle commande avec produits et services",
        request=CheckoutSerializer
    )
    @action(detail=False, methods=['post'])
    @transaction.atomic
    def checkout(self, request):
        """
        Create a new commande (checkout process).
        POST /api/client/commandes/checkout/

        All prices are calculated server-side for security.
        """
        import logging
        logger = logging.getLogger(__name__)

        logger.info("=" * 80)
        logger.info("CHECKOUT - Début de la requête")
        logger.info("=" * 80)
        logger.info(f"User: {request.user}")
        logger.info(f"Content-Type: {request.content_type}")
        logger.info(f"Request data type: {type(request.data)}")
        logger.info(f"Request data keys: {request.data.keys() if hasattr(request.data, 'keys') else 'N/A'}")
        logger.info(f"Request FILES: {request.FILES.keys() if request.FILES else 'No files'}")

        # Afficher les données reçues
        for key, value in request.data.items():
            logger.info(f"Data[{key}]: {value}")

        # Parse FormData if it contains nested bracket notation
        parsed_data = request.data
        if any(key.startswith('produits[') or key.startswith('collecte[') for key in request.data.keys()):
            parsed_data = self._parse_formdata_to_checkout_format(request)
            logger.info("FormData parsed successfully:")
            logger.info(f"Parsed data: {parsed_data}")

        serializer = CheckoutSerializer(data=parsed_data)

        if not serializer.is_valid():
            logger.error("VALIDATION ERRORS:")
            logger.error(serializer.errors)
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        logger.info("Validation réussie!")
        logger.info(f"Validated data: {serializer.validated_data}")

        data = serializer.validated_data

        # Validate moyen_paiement
        try:
            moyen_paiement = MoyenPaiement.objects.get(
                uuid=data['moyen_paiement_id'],
                actif=True
            )
        except MoyenPaiement.DoesNotExist:
            return Response(
                {'error': 'Moyen de paiement invalide ou inactif'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate and apply code_promo if provided
        code_promo = None
        montant_reduction = Decimal('0.00')
        if data.get('code_promo'):
            try:
                code_promo = CodePromo.objects.get(code=data['code_promo'])
                if not code_promo.est_valide():
                    return Response(
                        {'error': 'Code promo invalide ou expiré'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except CodePromo.DoesNotExist:
                return Response(
                    {'error': 'Code promo invalide'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Calculate total amounts
        montant_ht_total = Decimal('0.00')
        montant_tva_total = Decimal('0.00')

        produits_data = []

        # Process each product
        for produit_data in data['produits']:
            services_ids = produit_data.pop('services_ids')

            # Validate and get services
            try:
                services = Service.objects.filter(
                    uuid__in=services_ids,
                    statut='actif'
                )
                if services.count() != len(services_ids):
                    return Response(
                        {'error': 'Un ou plusieurs services sont invalides ou inactifs'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except Exception as e:
                return Response(
                    {'error': f'Erreur lors de la validation des services: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Calculate service prices for this product
            services_data = []
            produit_montant_ht = Decimal('0.00')
            produit_montant_tva = Decimal('0.00')

            for service in services:
                service_ht = service.prix_minimum_ht
                service_tva_pct = service.tva
                service_montant_tva = service_ht * (service_tva_pct / 100)
                service_ttc = service_ht + service_montant_tva

                produit_montant_ht += service_ht
                produit_montant_tva += service_montant_tva

                services_data.append({
                    'service': service,
                    'nom_service': service.nom,
                    'prix_ht': service_ht,
                    'tva': service_tva_pct,
                    'montant_tva': service_montant_tva,
                    'prix_ttc': service_ttc
                })

            montant_ht_total += produit_montant_ht
            montant_tva_total += produit_montant_tva

            produit_data['services_data'] = services_data
            produit_data['prix_ht'] = produit_montant_ht
            produit_data['tva'] = Decimal('20.00')  # Default TVA
            produit_data['prix_ttc'] = produit_montant_ht + produit_montant_tva

            produits_data.append(produit_data)

        montant_ttc_total = montant_ht_total + montant_tva_total

        # Validate code_promo with montant and user (validation complète)
        if code_promo:
            peut_utiliser, message_erreur = code_promo.peut_etre_utilise_par(request.user, montant_ttc_total)
            if not peut_utiliser:
                return Response(
                    {'error': message_erreur},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Apply code_promo reduction
        if code_promo:
            if code_promo.type_reduction == 'pourcentage':
                montant_reduction = montant_ttc_total * (code_promo.valeur / 100)
            else:  # montant_fixe
                montant_reduction = code_promo.valeur

        montant_final = montant_ttc_total - montant_reduction

        # Validate créneau selon la configuration
        from apps.creneaux.models import Creneaux, CreneauxConfig

        collecte = data['collecte']
        config = CreneauxConfig.get_config()
        creneau = None
        creneau_horaire_texte = None

        if config.actif:
            # Système de créneaux activé: valider le créneau sélectionné
            try:
                creneau = Creneaux.objects.get(uuid=collecte['creneau_id'])

                # Vérifier que le créneau est disponible
                if not creneau.est_disponible():
                    if not creneau.actif:
                        return Response(
                            {'error': 'Ce créneau n\'est plus actif'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    elif creneau.reservations_actuelles >= creneau.capacite_max:
                        return Response(
                            {'error': 'Ce créneau est complet. Veuillez choisir un autre créneau.'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    elif creneau.est_delai_depasse():
                        return Response(
                            {'error': f'Le délai de réservation pour ce créneau est dépassé (limite: {creneau.duree_limite_minutes} minutes avant le début)'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    else:
                        return Response(
                            {'error': 'Ce créneau n\'est plus disponible'},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                # Vérifier la cohérence entre la date sélectionnée et le créneau
                if creneau.date != collecte['date']:
                    return Response(
                        {'error': f'Le créneau sélectionné est pour le {creneau.date}, pas pour le {collecte["date"]}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            except Creneaux.DoesNotExist:
                return Response(
                    {'error': 'Créneau invalide'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # Système de créneaux désactivé: utiliser le texte libre
            creneau_horaire_texte = collecte.get('creneau_texte')

        # Create commande
        commande = Commande.objects.create(
            user=request.user,
            montant_ht=montant_ht_total,
            montant_tva=montant_tva_total,
            montant_ttc=montant_ttc_total,
            montant_reduction=montant_reduction,
            montant_final=montant_final,
            moyen_paiement=moyen_paiement,
            code_promo=code_promo,
            adresse_collecte=collecte['adresse'],
            latitude=collecte.get('latitude'),
            longitude=collecte.get('longitude'),
            telephone_collecte=collecte['telephone'],
            date_collecte=collecte['date'],
            creneau=creneau,  # ForeignKey vers Creneaux (None si système désactivé)
            creneau_horaire=creneau_horaire_texte,  # Texte libre si système désactivé, sinon rempli par save()
            note_collecte=collecte.get('note', '')
        )

        # Incrémenter les réservations du créneau si système activé
        if config.actif and creneau:
            try:
                creneau.incrementer_reservations()
            except Exception as e:
                # Si l'incrémentation échoue, supprimer la commande
                commande.delete()
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Create products and services
        for produit_data in produits_data:
            services_data = produit_data.pop('services_data')

            produit = CommandeProduit.objects.create(
                commande=commande,
                description=produit_data['description'],
                marque=produit_data['marque'],
                modele=produit_data['modele'],
                couleur=produit_data['couleur'],
                photo=produit_data.get('photo'),
                note_utilisateur=produit_data.get('note_utilisateur', ''),
                prix_ht=produit_data['prix_ht'],
                tva=produit_data['tva'],
                prix_ttc=produit_data['prix_ttc']
            )

            # Create services for this product
            for service_data in services_data:
                CommandeProduitService.objects.create(
                    commande_produit=produit,
                    **service_data
                )

        # Send email notifications asynchronously
        from ...tasks import send_new_commande_notification_to_admins, send_commande_confirmation_to_client

        # Notify admins
        send_new_commande_notification_to_admins.delay(commande.id)

        # Send confirmation to client
        send_commande_confirmation_to_client.delay(commande.id)

        # Return created commande
        return Response(
            ClientCommandeSerializer(commande).data,
            status=status.HTTP_201_CREATED
        )

    @extend_schema(
        tags=['Client - Commande'],
        summary="Annuler une commande",
        description="Annuler une de mes commandes (si statut le permet)"
    )
    @action(detail=True, methods=['post'])
    def cancel(self, request, uuid=None):
        """
        Cancel a commande.
        POST /api/client/commandes/{id}/cancel/
        """
        commande = self.get_object()

        # Check if commande can be cancelled
        if commande.statut_commande in ['terminee', 'annulee']:
            return Response(
                {'error': 'Cette commande ne peut pas être annulée'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if commande.statut_paiement == 'paye':
            return Response(
                {'error': 'Une commande payée ne peut pas être annulée. Contactez le support.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        commande.statut_commande = 'annulee'
        commande.save()

        # Décrémenter les réservations du créneau
        if commande.creneau:
            try:
                commande.creneau.decrementer_reservations()
            except Exception as e:
                # Log l'erreur mais ne bloquer pas l'annulation
                pass

        return Response({
            'message': 'Commande annulée avec succès',
            'commande': ClientCommandeSerializer(commande).data
        })

    @extend_schema(
        tags=['Client - Commande'],
        summary="Suivre ma commande",
        description="Obtenir le suivi détaillé d'une commande avec timeline et statut par produit"
    )
    @action(detail=True, methods=['get'], url_path='tracking')
    def tracking(self, request, uuid=None):
        """
        Get detailed tracking information for a commande.
        GET /api/client/commandes/{id}/tracking/

        Returns:
        - Global commande status
        - Timeline of events
        - Status for each product (shoe pair)
        """
        commande = self.get_object()
        serializer = TrackingCommandeSerializer(commande)
        return Response(serializer.data)
