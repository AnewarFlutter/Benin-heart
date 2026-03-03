"""
Views for delivery person endpoints
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from django.db import transaction
from django.db.models import Q
from ...models import Commande, CodeCollecte, CommandeProduit
from .serializers import (
    DeliveryCommandeListSerializer,
    DeliveryCommandeDetailSerializer,
    DeliveryCodeCollecteSerializer,
    AssignCodeSerializer,
    DeliveryHistoriqueSerializer,
    ValidateLivraisonSerializer
)
from .permissions import IsDeliveryPerson, IsAssignedDeliveryPerson


class DeliveryCommandeViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for DELIVERY PERSON commande management.
    Delivery persons can only see commandes assigned to them.
    """
    permission_classes = [IsAuthenticated, IsDeliveryPerson]

    def get_queryset(self):
        """
        Only return commandes assigned to this delivery person.
        Returns both collection missions (delivery_person) and delivery missions (delivery_person_livraison).

        For collection missions: show 'nouvelle' (assigned) and 'en_collecte' (in progress)
        For delivery missions: only show 'en_livraison' with date_livraison = today or past
        """
        user = self.request.user
        from django.utils import timezone

        # Get delivery person profile
        try:
            from apps.users.models import DeliveryPerson
            delivery_person = DeliveryPerson.objects.get(user=user)
        except DeliveryPerson.DoesNotExist:
            return Commande.objects.none()

        # Date d'aujourd'hui
        today = timezone.now().date()

        # Missions de collecte: statuts 'nouvelle' (assignée) ou 'en_collecte' (en cours)
        missions_collecte = Q(
            delivery_person=delivery_person,
            statut_commande__in=['nouvelle', 'en_collecte']
        )

        # Missions de livraison: statuts 'prete' (assignée) ou 'en_livraison' (confirmée) ET date_livraison <= aujourd'hui
        # (affiche seulement les livraisons prévues aujourd'hui ou en retard)
        missions_livraison = Q(
            delivery_person_livraison=delivery_person,
            statut_commande__in=['prete', 'en_livraison'],
            date_livraison__lte=today
        )

        # Combiner les deux types de missions
        return Commande.objects.filter(
            missions_collecte | missions_livraison
        ).select_related(
            'user',
            'moyen_paiement',
            'code_promo'
        ).prefetch_related('produits__services').order_by('-date_assignation')

    def get_serializer_class(self):
        if self.action == 'list':
            return DeliveryCommandeListSerializer
        return DeliveryCommandeDetailSerializer

    def get_permissions(self):
        """Apply IsAssignedDeliveryPerson for detail views."""
        if self.action in ['retrieve', 'confirm_commande']:
            return [IsAuthenticated(), IsDeliveryPerson(), IsAssignedDeliveryPerson()]
        return super().get_permissions()

    def get_serializer_context(self):
        """
        Add delivery person coordinates to context for distance calculation.
        """
        context = super().get_serializer_context()

        # Get livreur coordinates from query parameters
        livreur_lat = self.request.query_params.get('livreur_lat')
        livreur_lon = self.request.query_params.get('livreur_lon')

        if livreur_lat:
            context['livreur_lat'] = livreur_lat
        if livreur_lon:
            context['livreur_lon'] = livreur_lon

        return context

    @extend_schema(
        tags=['DELIVERY - Commande'],
        summary="Liste de mes commandes assignées",
        description="Récupère la liste de toutes les commandes assignées au livreur connecté. "
                   "Vous pouvez passer les paramètres 'livreur_lat' et 'livreur_lon' pour calculer la distance."
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['DELIVERY - Statistiques'],
        summary="Statistiques du livreur",
        description="Récupère les statistiques du livreur connecté: "
                   "missions terminées aujourd'hui, missions en cours, et montant à encaisser (espèces uniquement)."
    )
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get delivery person statistics.
        GET /api/delivery/commandes/statistics/

        Returns:
        - terminees_aujourdhui: nombre de commandes terminées aujourd'hui
        - missions_en_cours: nombre de commandes assignées en cours
        - montant_a_encaisser: montant total des commandes en espèces assignées au livreur
        """
        from django.db.models import Q, Sum
        from django.utils import timezone
        from datetime import datetime

        user = request.user

        # Get delivery person profile
        try:
            from apps.users.models import DeliveryPerson
            delivery_person = DeliveryPerson.objects.get(user=user)
        except DeliveryPerson.DoesNotExist:
            return Response(
                {'error': 'Profil livreur introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Date d'aujourd'hui
        today = timezone.now().date()

        # 1. Terminées aujourd'hui
        # Inclut les collectes effectuées aujourd'hui ET les livraisons effectuées aujourd'hui
        # Peu importe le statut actuel de la commande

        # Collectes effectuées aujourd'hui par ce livreur
        # (on vérifie la date de collecte effective, pas le statut actuel)
        collectes_aujourd_hui = Commande.objects.filter(
            delivery_person=delivery_person,
            produits__date_collecte_effective__date=today
        ).distinct().count()

        # Livraisons effectuées aujourd'hui par ce livreur
        # (on vérifie la date de livraison effective)
        livraisons_aujourd_hui = Commande.objects.filter(
            delivery_person_livraison=delivery_person,
            date_livraison_effective__date=today
        ).count()

        terminees_aujourdhui = collectes_aujourd_hui + livraisons_aujourd_hui

        # 2. Missions en cours
        # Collectes en cours: statuts 'nouvelle' ou 'en_collecte'
        missions_collecte_en_cours = Q(
            delivery_person=delivery_person,
            statut_commande__in=['nouvelle', 'en_collecte']
        )
        # Livraisons en cours: statuts 'prete' ou 'en_livraison' ET date_livraison <= aujourd'hui
        missions_livraison_en_cours = Q(
            delivery_person_livraison=delivery_person,
            statut_commande__in=['prete', 'en_livraison'],
            date_livraison__lte=today
        )
        missions_en_cours = Commande.objects.filter(
            missions_collecte_en_cours | missions_livraison_en_cours
        ).count()

        # 3. Montant à encaisser (espèces uniquement)
        # Somme des montants finaux des commandes de COLLECTE en cours avec paiement en espèces
        # NOTE: On ne compte que les collectes car le paiement est encaissé lors de la collecte,
        # pas lors de la livraison (la livraison restitue les chaussures réparées)
        montant_a_encaisser = Commande.objects.filter(
            missions_collecte_en_cours,
            moyen_paiement__code='ESPECECODE'
        ).aggregate(total=Sum('montant_final'))['total'] or 0

        return Response({
            'terminees_aujourdhui': terminees_aujourdhui,
            'missions_en_cours': missions_en_cours,
            'montant_a_encaisser': float(montant_a_encaisser)
        })

    @extend_schema(
        tags=['DELIVERY - Historique'],
        summary="Historique des missions complétées",
        description="Récupère l'historique de toutes les missions terminées par le livreur connecté. "
                   "Inclut les collectes finalisées (statut 'collectee') et les livraisons finalisées (statut 'terminee'). "
                   "Les missions sont triées par date de complétion décroissante."
    )
    @action(detail=False, methods=['get'], url_path='historique')
    def historique(self, request):
        """
        Get history of completed missions for the delivery person.
        GET /api/delivery/commandes/historique/

        Returns:
        - All collectes (statut='collectee') where delivery_person matches
        - All livraisons (statut='terminee') where delivery_person_livraison matches
        """
        user = request.user

        # Get delivery person profile
        try:
            from apps.users.models import DeliveryPerson
            delivery_person = DeliveryPerson.objects.get(user=user)
        except DeliveryPerson.DoesNotExist:
            return Response(
                {'error': 'Profil livreur introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get completed missions
        # - Collectes: toutes les commandes où le livreur a collecté (statut >= 'collectee')
        # - Livraisons: statut='terminee' where delivery_person_livraison matches
        from django.db.models import Q

        # Collectes terminées: le livreur de collecte a fini sa mission
        # (statut >= 'collectee', donc collectee, en_cours, prete, en_livraison, terminee)
        collectes = Commande.objects.filter(
            delivery_person=delivery_person,
            statut_commande__in=['collectee', 'en_cours', 'prete', 'en_livraison', 'terminee']
        ).select_related('user', 'moyen_paiement').prefetch_related('produits__services')

        # Livraisons terminées: le livreur de livraison a fini sa mission
        livraisons = Commande.objects.filter(
            delivery_person_livraison=delivery_person,
            statut_commande='terminee'
        ).select_related('user', 'moyen_paiement').prefetch_related('produits__services')

        # Combine querysets
        missions = list(collectes) + list(livraisons)

        # Sort by completion date descending
        def get_completion_date(commande):
            if commande.statut_commande == 'collectee':
                first_produit = commande.produits.first()
                if first_produit and first_produit.date_collecte_effective:
                    return first_produit.date_collecte_effective
                return commande.created_at
            elif commande.statut_commande == 'terminee':
                return commande.date_livraison_effective or commande.created_at
            return commande.created_at

        missions.sort(key=get_completion_date, reverse=True)

        serializer = DeliveryHistoriqueSerializer(
            missions,
            many=True,
            context={'request': request}
        )
        return Response({
            'count': len(missions),
            'results': serializer.data
        })

    @extend_schema(
        tags=['DELIVERY - Commande'],
        summary="Détails d'une commande",
        description="Récupère les détails complets d'une commande assignée"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['DELIVERY - Commande'],
        summary="Confirmer la prise en charge d'une commande",
        description="Le livreur confirme qu'il a pris en charge la commande. Le client sera notifié par email."
    )
    @action(detail=True, methods=['post'])
    def confirm_commande(self, request, uuid=None):
        """
        Confirm that delivery person has accepted the commande.
        POST /api/delivery/commandes/{id}/confirm_commande/

        This will:
        1. Change status to 'en_collecte'
        2. Set date_confirmation_livreur
        3. Send email to client
        """
        commande = self.get_object()

        # Check if already confirmed
        if commande.date_confirmation_livreur:
            return Response(
                {'error': 'Cette commande a déjà été confirmée'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update commande
        from django.utils import timezone
        commande.date_confirmation_livreur = timezone.now()
        commande.statut_commande = 'en_collecte'
        commande.save()

        # Send notification emails
        from ...tasks import send_waiting_for_pickup_notification, send_delivery_confirmation_to_admins

        # Notify client
        send_waiting_for_pickup_notification.delay(commande.id)

        # Notify admins
        send_delivery_confirmation_to_admins.delay(commande.id)

        return Response({
            'message': 'Commande confirmée avec succès. Le client et les administrateurs ont été notifiés.',
            'commande': DeliveryCommandeDetailSerializer(commande).data
        })

    @extend_schema(
        tags=['DELIVERY - Livraison Finale'],
        summary="Confirmer la prise en charge d'une livraison",
        description="Le livreur confirme qu'il prend en charge la livraison finale. Le client et les admins seront notifiés par email."
    )
    @action(detail=True, methods=['post'], url_path='confirm-livraison')
    def confirm_livraison(self, request, uuid=None):
        """
        Confirm that delivery person has accepted the livraison (delivery).
        POST /api/delivery/commandes/{id}/confirm-livraison/

        This will:
        1. Change status from 'prete' to 'en_livraison'
        2. Set date_confirmation_livreur_livraison
        3. Send email to client and admins
        """
        commande = self.get_object()

        # Check if commande is in correct status
        if commande.statut_commande != 'prete':
            return Response(
                {'error': f'La commande doit être au statut "prête" pour confirmer la livraison (statut actuel: {commande.get_statut_commande_display()})'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if this delivery person is assigned to this delivery
        if not commande.delivery_person_livraison:
            return Response(
                {'error': 'Aucun livreur n\'est assigné à cette livraison'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if commande.delivery_person_livraison.id != self.request.user.delivery_profile.id:
            return Response(
                {'error': 'Vous n\'êtes pas le livreur assigné à cette livraison'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Generate unique confirmation code
        import random
        import string
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

        # Update commande
        from django.utils import timezone
        commande.statut_commande = 'en_livraison'
        commande.code_confirmation_livraison = code
        commande.save()

        # Send notification emails
        from ...tasks import send_livraison_confirmation_to_client, send_livraison_confirmation_to_admins

        # Notify client
        send_livraison_confirmation_to_client.delay(commande.id)

        # Notify admins
        send_livraison_confirmation_to_admins.delay(commande.id)

        return Response({
            'message': 'Livraison confirmée avec succès. Le code de confirmation a été envoyé au client.',
            'code_confirmation': code,
            'commande': DeliveryCommandeDetailSerializer(commande).data
        })

    @extend_schema(
        tags=['Delivery - Collecte'],
        summary="Liste des codes de collecte disponibles",
        description="Récupère la liste de tous les codes de collecte disponibles (non utilisés). "
                   "Ces codes doivent être collés sur chaque paire de chaussures lors de la collecte."
    )
    @action(detail=False, methods=['get'], url_path='codes-disponibles')
    def codes_disponibles(self, request):
        """
        Get available codes (not used).
        GET /api/delivery/commandes/codes-disponibles/
        """
        codes = CodeCollecte.objects.filter(utilise=False).order_by('code')
        
        return Response({
            'count': codes.count(),
            'codes': DeliveryCodeCollecteSerializer(codes, many=True).data
        })

    @extend_schema(
        tags=['Delivery - Collecte'],
        summary="Assigner un code à une paire de chaussures",
        description="Assigne un code de collecte unique à une paire de chaussures. "
                   "Le code doit avoir été préalablement collé physiquement sur la paire. "
                   "Cette action enregistre la collecte effective de la paire.",
        request=AssignCodeSerializer
    )
    @action(detail=True, methods=['post'], url_path='assign-code')
    @transaction.atomic
    def assign_code(self, request, uuid=None):
        """
        Assign a code to a product (shoe pair).
        POST /api/delivery/commandes/{id}/assign-code/
        
        Body: {
            "produit_id": 1,
            "code": "CC-ABC123"
        }
        """
        commande = self.get_object()
        serializer = AssignCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        produit_id = serializer.validated_data['produit_id']
        code_str = serializer.validated_data['code']
        
        # Validate product belongs to this commande
        try:
            produit = CommandeProduit.objects.get(uuid=produit_id, commande=commande)
        except CommandeProduit.DoesNotExist:
            return Response(
                {'error': 'Produit introuvable dans cette commande'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if product already has a code
        if produit.code_collecte:
            return Response(
                {'error': f'Ce produit a déjà un code assigné: {produit.code_collecte}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate code exists and is not used
        try:
            code_obj = CodeCollecte.objects.get(code=code_str)
        except CodeCollecte.DoesNotExist:
            return Response(
                {'error': 'Code invalide'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if code_obj.utilise:
            return Response(
                {'error': 'Ce code a déjà été utilisé'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Assign code
        from django.utils import timezone
        produit.code_collecte = code_str
        produit.date_collecte_effective = timezone.now()
        produit.save()
        
        # Mark code as used
        code_obj.utilise = True
        code_obj.date_utilisation = timezone.now()
        code_obj.commande_produit = produit
        code_obj.save()
        
        return Response({
            'message': 'Code assigné avec succès',
            'produit': {
                'id': str(produit.uuid),
                'marque': produit.marque,
                'modele': produit.modele,
                'couleur': produit.couleur,
                'code_collecte': produit.code_collecte,
                'date_collecte_effective': produit.date_collecte_effective
            }
        })

    @extend_schema(
        tags=['Delivery - Collecte'],
        summary="Valider la collecte complète de la commande",
        description="Valide que toutes les paires de chaussures ont été collectées avec leurs codes. "
                   "Vérifie que chaque produit a un code assigné avant de changer le statut à 'collectée'. "
                   "Envoie automatiquement des notifications au client et aux administrateurs."
    )
    @action(detail=True, methods=['post'], url_path='validate-collecte')
    @transaction.atomic
    def validate_collecte(self, request, uuid=None):
        """
        Validate that all products have been collected.
        POST /api/delivery/commandes/{id}/validate-collecte/
        
        Checks that all products have a code assigned, then changes status to 'collectee'.
        """
        commande = self.get_object()
        
        # Check if commande is in correct status
        if commande.statut_commande != 'en_collecte':
            return Response(
                {'error': f'La commande doit être en statut "en_collecte" (statut actuel: {commande.get_statut_commande_display()})'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check all products have a code
        produits_total = commande.produits.count()
        produits_avec_code = commande.produits.exclude(code_collecte__isnull=True).exclude(code_collecte='').count()
        
        if produits_avec_code < produits_total:
            produits_manquants = commande.produits.filter(code_collecte__isnull=True) | commande.produits.filter(code_collecte='')
            return Response({
                'error': f'{produits_total - produits_avec_code} paire(s) n\'ont pas encore de code assigné',
                'produits_manquants': [
                    {
                        'id': str(p.uuid),
                        'marque': p.marque,
                        'modele': p.modele,
                        'couleur': p.couleur
                    } for p in produits_manquants
                ]
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # All products have codes, validate collection
        commande.statut_commande = 'collectee'
        commande.save()

        # Send notifications to client and admins
        from ...tasks import (
            send_collection_completed_notification_to_client,
            send_collection_completed_notification_to_admins
        )

        # Notify client
        send_collection_completed_notification_to_client.delay(commande.id)

        # Notify admins
        send_collection_completed_notification_to_admins.delay(commande.id)

        return Response({
            'message': 'Collecte validée avec succès ! Le client et les administrateurs ont été notifiés.',
            'commande': {
                'code_unique': commande.code_unique,
                'statut': commande.get_statut_commande_display(),
                'produits_collectes': produits_total
            }
        })

    @extend_schema(
        tags=['Delivery - Livraison Finale'],
        summary="Valider la livraison finale au client",
        description="Marque une commande comme livrée au client après réparation. "
                   "Requiert le code de confirmation fourni par le client. "
                   "Cette action finalise le cycle complet de la commande. "
                   "Des notifications sont automatiquement envoyées au client et aux administrateurs.",
        request=ValidateLivraisonSerializer
    )
    @action(detail=True, methods=['post'], url_path='validate-livraison')
    @transaction.atomic
    def validate_livraison(self, request, uuid=None):
        """
        Validate that delivery has been completed.
        POST /api/delivery/commandes/{id}/validate-livraison/

        Body: {
            "code_confirmation": "ABC123"
        }

        Changes status to 'terminee' and notifies client and admins.
        """
        commande = self.get_object()

        # Validate request data
        serializer = ValidateLivraisonSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        code_confirmation = serializer.validated_data['code_confirmation']

        # Check if commande is in correct status
        if commande.statut_commande != 'en_livraison':
            return Response(
                {'error': f'La commande doit être en statut "en_livraison" (statut actuel: {commande.get_statut_commande_display()})'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if this delivery person is assigned to this delivery
        if not commande.delivery_person_livraison:
            return Response(
                {'error': 'Aucun livreur n\'est assigné à cette livraison'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if commande.delivery_person_livraison.id != self.request.user.delivery_profile.id:
            return Response(
                {'error': 'Vous n\'êtes pas le livreur assigné à cette livraison'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Verify confirmation code
        if not commande.code_confirmation_livraison:
            return Response(
                {'error': 'Aucun code de confirmation n\'a été généré pour cette commande'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if code_confirmation.upper() != commande.code_confirmation_livraison.upper():
            return Response(
                {'error': 'Code de confirmation invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mark delivery as completed
        from django.utils import timezone
        commande.statut_commande = 'terminee'
        commande.date_livraison_effective = timezone.now()
        commande.save()

        # Send notifications to client and admins
        from ...tasks import (
            send_delivery_completed_notification_to_client,
            send_delivery_completed_notification_to_admins
        )

        # Notify client
        send_delivery_completed_notification_to_client.delay(commande.id)

        # Notify admins
        send_delivery_completed_notification_to_admins.delay(commande.id)

        return Response({
            'message': 'Livraison validée avec succès ! Le client et les administrateurs ont été notifiés.',
            'commande': {
                'code_unique': commande.code_unique,
                'statut': commande.get_statut_commande_display(),
                'date_livraison_effective': commande.date_livraison_effective,
                'nombre_produits': commande.produits.count()
            }
        })
