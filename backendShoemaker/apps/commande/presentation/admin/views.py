"""
Views for admin endpoints
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from django.db.models import Count, Sum, Q
from django.db import transaction
from decimal import Decimal
from ...models import MoyenPaiement, CodePromo, Commande, CommandeProduit, CommandeProduitService, CodeCollecte
from apps.service.models import Service
from apps.users.models import User
from .serializers import (
    AdminMoyenPaiementSerializer,
    AdminCodePromoSerializer,
    AdminCommandeSerializer,
    AdminCommandeListSerializer,
    AdminCommandeUpdateSerializer,
    UpdateStatutSerializer,
    AdminCheckoutSerializer,
    AssignDeliveryPersonSerializer,
    AssignDeliveryPersonLivraisonSerializer,
    CodeCollecteSerializer,
    GenerateCodesSerializer,
    ProductByCodeCollecteSerializer
)
from .permissions import IsAdminOrSuperAdmin
from apps.users.models import DeliveryPerson
import secrets
import string


# ==================== MOYENS DE PAIEMENT ====================

class AdminMoyenPaiementViewSet(viewsets.ModelViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for ADMIN moyen paiement management.
    """
    queryset = MoyenPaiement.objects.all()
    serializer_class = AdminMoyenPaiementSerializer
    permission_classes = [IsAdminOrSuperAdmin]
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']

    @extend_schema(
        tags=['ADMIN - Moyen de paiement'],
        summary="Liste des moyens de paiement",
        description="Récupère la liste de tous les moyens de paiement"
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Moyen de paiement'],
        summary="Détails d'un moyen de paiement",
        description="Récupère les détails d'un moyen de paiement spécifique"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Moyen de paiement'],
        summary="Créer un moyen de paiement",
        description="Créer un nouveau moyen de paiement"
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Moyen de paiement'],
        summary="Modifier un moyen de paiement",
        description="Modifier un moyen de paiement existant"
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Moyen de paiement'],
        summary="Supprimer un moyen de paiement",
        description="Supprimer un moyen de paiement"
    )
    def destroy(self, request, *args, **kwargs):
        moyen_paiement = self.get_object()
        nom = moyen_paiement.nom
        moyen_paiement.delete()
        return Response({
            'message': f'Moyen de paiement "{nom}" supprimé avec succès'
        }, status=status.HTTP_200_OK)


# ==================== CODES PROMO ====================

class AdminCodePromoViewSet(viewsets.ModelViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for ADMIN code promo management.
    """
    queryset = CodePromo.objects.all()
    serializer_class = AdminCodePromoSerializer
    permission_classes = [IsAdminOrSuperAdmin]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def get_serializer_class(self):
        """Use different serializer for update operations."""
        if self.action in ['update', 'partial_update']:
            from .serializers import AdminCodePromoUpdateSerializer
            return AdminCodePromoUpdateSerializer
        return AdminCodePromoSerializer

    def get_queryset(self):
        """Filter by query parameters."""
        queryset = super().get_queryset()

        # Filtre par statut actif
        actif = self.request.query_params.get('actif')
        if actif is not None:
            actif_bool = actif.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(actif=actif_bool)

        # Filtre par type de réduction
        type_reduction = self.request.query_params.get('type_reduction')
        if type_reduction:
            queryset = queryset.filter(type_reduction=type_reduction)

        # Recherche par code
        search = self.request.query_params.get('search')
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(code__icontains=search) |
                Q(description__icontains=search)
            )

        return queryset

    @extend_schema(
        tags=['ADMIN - Code promo'],
        summary="Liste des codes promo",
        description="Récupère la liste de tous les codes promo (filtres: actif, type_reduction, search)"
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Code promo'],
        summary="Détails d'un code promo",
        description="Récupère les détails d'un code promo spécifique"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Code promo'],
        summary="Créer un code promo",
        description="Créer un nouveau code promo"
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Code promo'],
        summary="Modifier un code promo (complet)",
        description="Modifier un code promo existant (tous les champs requis avec PUT)"
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Code promo'],
        summary="Modifier un code promo (partiel)",
        description="Modifier partiellement un code promo (seuls les champs fournis sont modifiés avec PATCH)"
    )
    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Code promo'],
        summary="Supprimer un code promo",
        description="Supprimer un code promo"
    )
    def destroy(self, request, *args, **kwargs):
        code_promo = self.get_object()
        code = code_promo.code
        code_promo.delete()
        return Response({
            'message': f'Code promo "{code}" supprimé avec succès'
        }, status=status.HTTP_200_OK)


# ==================== COMMANDES ====================

class AdminCommandeViewSet(viewsets.ModelViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for ADMIN commande management.
    """
    queryset = Commande.objects.select_related(
        'user',
        'moyen_paiement',
        'code_promo',
        'delivery_person__user',
        'delivery_person_livraison__user',
        'creneau'
    ).prefetch_related('produits__services')
    permission_classes = [IsAdminOrSuperAdmin]
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']

    def get_serializer_class(self):
        if self.action == 'list':
            return AdminCommandeListSerializer
        elif self.action == 'checkout':
            return AdminCheckoutSerializer
        elif self.action == 'update':
            return AdminCommandeUpdateSerializer
        return AdminCommandeSerializer

    def get_queryset(self):
        """Filter by query parameters."""
        queryset = super().get_queryset()

        # Filters
        statut_paiement = self.request.query_params.get('statut_paiement')
        statut_commande = self.request.query_params.get('statut_commande')
        user_id = self.request.query_params.get('user_id')

        if statut_paiement:
            queryset = queryset.filter(statut_paiement=statut_paiement)
        if statut_commande:
            queryset = queryset.filter(statut_commande=statut_commande)
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        # Recherche par code commande ou nom/email client
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(code_unique__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__email__icontains=search)
            )

        return queryset

    @extend_schema(exclude=True)
    def create(self, request, *args, **kwargs):
        """Disable standard create - use checkout action instead."""
        return Response(
            {'detail': 'Utilisez l\'endpoint /api/admin/commandes/checkout/ pour créer une commande'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )

    @extend_schema(
        tags=['ADMIN - Commande'],
        summary="Liste des commandes",
        description="Récupère la liste de toutes les commandes (filtres: statut_paiement, statut_commande, user_id, search par numéro/nom/email)"
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Commande'],
        summary="Détails d'une commande",
        description="Récupère les détails complets d'une commande"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Commande'],
        summary="Modifier une commande",
        description="""
        Modifier les informations d'une commande existante.

        Champs modifiables:
        - statut_paiement, statut_commande
        - moyen_paiement_id (UUID)
        - code_promo_code (string)
        - delivery_person_id (UUID)
        - date_assignation, date_confirmation_livreur, rappel_envoye
        - adresse_collecte, latitude, longitude, telephone_collecte
        - date_collecte, note_collecte
        - creneau_id (UUID, si système activé) OU creneau_texte (string, si désactivé)
        """
    )
    def update(self, request, *args, **kwargs):
        commande = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        validated_data = serializer.validated_data

        # Track modifications for email notification
        modifications_summary = {}

        # Save old values before modification
        old_values = {
            'statut_paiement': commande.get_statut_paiement_display() if 'statut_paiement' in validated_data else None,
            'statut_commande': commande.get_statut_commande_display() if 'statut_commande' in validated_data else None,
            'date_collecte': commande.date_collecte if 'date_collecte' in validated_data else None,
            'creneau_horaire': commande.creneau_horaire if 'creneau' in validated_data or 'creneau_horaire' in validated_data else None,
            'adresse_collecte': commande.adresse_collecte if 'adresse_collecte' in validated_data else None,
            'telephone_collecte': commande.telephone_collecte if 'telephone_collecte' in validated_data else None,
            'delivery_person': (commande.delivery_person.user.get_full_name() if commande.delivery_person else None) if 'delivery_person' in validated_data else None,
        }

        # Handle creneau change - decrement old, increment new
        ancien_creneau = commande.creneau
        nouveau_creneau = validated_data.get('creneau')

        # If creneau is changing
        if 'creneau' in validated_data:
            if ancien_creneau != nouveau_creneau:
                # Decrement old creneau
                if ancien_creneau:
                    ancien_creneau.decrementer_reservations()

                # Increment new creneau
                if nouveau_creneau:
                    nouveau_creneau.incrementer_reservations()

            # Force update creneau_horaire from nouveau_creneau
            if nouveau_creneau:
                validated_data['creneau_horaire'] = f"{nouveau_creneau.heure_debut.strftime('%H:%M')} - {nouveau_creneau.heure_fin.strftime('%H:%M')}"

        # Update commande with validated data
        for field, value in validated_data.items():
            setattr(commande, field, value)

        commande.save()
        commande.refresh_from_db()

        # Build modifications summary for email
        if 'statut_paiement' in validated_data:
            modifications_summary['statut_paiement'] = {
                'ancien': old_values['statut_paiement'],
                'nouveau': commande.get_statut_paiement_display()
            }

        if 'statut_commande' in validated_data:
            modifications_summary['statut_commande'] = {
                'ancien': old_values['statut_commande'],
                'nouveau': commande.get_statut_commande_display()
            }

        if 'date_collecte' in validated_data and old_values['date_collecte'] != commande.date_collecte:
            modifications_summary['date_collecte'] = {
                'ancien': old_values['date_collecte'],
                'nouveau': commande.date_collecte
            }

        if old_values['creneau_horaire'] and old_values['creneau_horaire'] != commande.creneau_horaire:
            modifications_summary['creneau_horaire'] = {
                'ancien': old_values['creneau_horaire'],
                'nouveau': commande.creneau_horaire
            }

        if 'adresse_collecte' in validated_data and old_values['adresse_collecte'] != commande.adresse_collecte:
            modifications_summary['adresse_collecte'] = {
                'ancien': old_values['adresse_collecte'],
                'nouveau': commande.adresse_collecte
            }

        if 'telephone_collecte' in validated_data and old_values['telephone_collecte'] != commande.telephone_collecte:
            modifications_summary['telephone_collecte'] = {
                'ancien': old_values['telephone_collecte'],
                'nouveau': commande.telephone_collecte
            }

        if 'delivery_person' in validated_data:
            new_delivery_person_name = commande.delivery_person.user.get_full_name() if commande.delivery_person else None
            if old_values['delivery_person'] != new_delivery_person_name:
                modifications_summary['delivery_person'] = {
                    'ancien': old_values['delivery_person'],
                    'nouveau': new_delivery_person_name
                }

        # Send email notification to client if there are modifications
        if modifications_summary:
            from ...tasks import send_commande_modification_notification_to_client
            send_commande_modification_notification_to_client.delay(commande.id, modifications_summary)

        # Return updated commande using detail serializer
        response_serializer = AdminCommandeSerializer(commande)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['ADMIN - Commande'],
        summary="Supprimer une commande",
        description="Supprimer définitivement une commande"
    )
    def destroy(self, request, *args, **kwargs):
        commande = self.get_object()
        code_unique = commande.code_unique
        commande.delete()
        return Response({
            'message': f'Commande {code_unique} supprimée définitivement avec succès'
        }, status=status.HTTP_200_OK)

    @extend_schema(
        tags=['ADMIN - Commande'],
        summary="Changer le statut d'une commande",
        description="Modifier le statut de paiement et/ou le statut de la commande",
        request=UpdateStatutSerializer
    )
    @action(detail=True, methods=['post'])
    def update_status(self, request, uuid=None):
        """
        Update command status.
        POST /api/admin/commandes/{id}/update_status/
        """
        commande = self.get_object()
        serializer = UpdateStatutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        old_statut_commande = commande.statut_commande

        if 'statut_paiement' in serializer.validated_data:
            commande.statut_paiement = serializer.validated_data['statut_paiement']

        if 'statut_commande' in serializer.validated_data:
            commande.statut_commande = serializer.validated_data['statut_commande']

        commande.save()

        # Send notification when commande arrives at workshop
        if 'statut_commande' in serializer.validated_data:
            new_statut = serializer.validated_data['statut_commande']
            if old_statut_commande != 'en_cours' and new_statut == 'en_cours':
                from ...tasks import send_workshop_arrival_notification
                send_workshop_arrival_notification.delay(commande.id)

        return Response({
            'message': 'Statut mis à jour avec succès',
            'commande': AdminCommandeSerializer(commande).data
        })

    @extend_schema(
        tags=['ADMIN - Commandes'],
        summary="Récupérer un produit par code de collecte",
        description="Retourne les détails d'un produit et de sa commande à partir du code de collecte"
    )
    @action(detail=False, methods=['get'], url_path='produits/(?P<code_collecte>[^/.]+)')
    def get_product_by_code(self, request, code_collecte=None):
        """Get product details by collection code."""
        try:
            # Find the product with this code_collecte
            produit = CommandeProduit.objects.select_related('commande').prefetch_related('services').get(
                code_collecte=code_collecte
            )
            
            serializer = ProductByCodeCollecteSerializer(produit, context={'request': request})
            return Response(serializer.data)
            
        except CommandeProduit.DoesNotExist:
            return Response(
                {'error': 'Aucun produit trouvé avec ce code de collecte'},
                status=status.HTTP_404_NOT_FOUND
            )

    @extend_schema(
        tags=['ADMIN - Commande'],
        summary="Statistiques des commandes",
        description="Récupère les statistiques globales des commandes"
    )
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get commandes statistics.
        GET /api/admin/commandes/statistics/
        """
        total = Commande.objects.count()

        # By payment status
        by_payment = {}
        for choice in Commande.STATUT_PAIEMENT_CHOICES:
            count = Commande.objects.filter(statut_paiement=choice[0]).count()
            by_payment[choice[0]] = count

        # By command status
        by_status = {}
        for choice in Commande.STATUT_COMMANDE_CHOICES:
            count = Commande.objects.filter(statut_commande=choice[0]).count()
            by_status[choice[0]] = count

        # Total revenue
        total_revenue = Commande.objects.filter(
            statut_paiement='paye'
        ).aggregate(Sum('montant_final'))['montant_final__sum'] or 0

        return Response({
            'total': total,
            'by_payment_status': by_payment,
            'by_command_status': by_status,
            'total_revenue': float(total_revenue)
        })

    @extend_schema(
        tags=['ADMIN - Statistiques'],
        summary="Chiffre d'affaires par période",
        description="""
        Récupère le chiffre d'affaires groupé par période.

        **Paramètres de filtre (query params):**
        - `days`: Nombre de jours à afficher (ex: 7, 30). Retourne le CA par jour.
        - `start_date` et `end_date`: Plage de dates (format: YYYY-MM-DD).
          - Si la période <= 31 jours: groupé par jour
          - Si la période <= 365 jours: groupé par mois
          - Si la période > 365 jours: groupé par année
        - `service_id`: UUID du service pour filtrer les commandes contenant ce service.

        **Exemples:**
        - `/api/admin/commandes/revenue/?days=7` - CA des 7 derniers jours
        - `/api/admin/commandes/revenue/?start_date=2024-01-01&end_date=2024-12-31` - CA de l'année 2024 par mois
        - `/api/admin/commandes/revenue/?days=30&service_id=uuid-du-service` - CA des 30 derniers jours pour un service spécifique
        """
    )
    @action(detail=False, methods=['get'])
    def revenue(self, request):
        """
        Get revenue statistics by period.
        GET /api/admin/commandes/revenue/
        """
        from django.utils import timezone
        from django.db.models.functions import TruncDay, TruncMonth, TruncYear
        from datetime import datetime, timedelta

        # Parse query parameters
        days = request.query_params.get('days')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        service_id = request.query_params.get('service_id')

        # Base queryset - only paid orders
        queryset = Commande.objects.filter(statut_paiement='paye')

        # Filter by service if provided
        service_name = None
        if service_id:
            try:
                service = Service.objects.get(uuid=service_id)
                service_name = service.nom
                # Filter commandes that have products with this service
                queryset = queryset.filter(
                    produits__services__service_id=service.id
                ).distinct()
            except Service.DoesNotExist:
                return Response(
                    {'error': 'Service introuvable'},
                    status=status.HTTP_404_NOT_FOUND
                )
            except ValueError:
                return Response(
                    {'error': 'UUID de service invalide'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Determine date range
        today = timezone.now().date()

        if days:
            # Filter by number of days
            try:
                days = int(days)
                start_date = today - timedelta(days=days - 1)
                end_date = today
                group_by = 'day'
            except ValueError:
                return Response(
                    {'error': 'Le paramètre "days" doit être un nombre entier'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif start_date_str and end_date_str:
            # Filter by date range
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {'error': 'Format de date invalide. Utilisez YYYY-MM-DD'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Determine grouping based on period length
            period_days = (end_date - start_date).days
            if period_days <= 31:
                group_by = 'day'
            elif period_days <= 365:
                group_by = 'month'
            else:
                group_by = 'year'
        else:
            # Default: last 31 days
            start_date = today - timedelta(days=30)
            end_date = today
            group_by = 'day'

        # Filter by date range
        queryset = queryset.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date
        )

        # Group by period
        if group_by == 'day':
            trunc_func = TruncDay('created_at')
            date_format = '%Y-%m-%d'
        elif group_by == 'month':
            trunc_func = TruncMonth('created_at')
            date_format = '%Y-%m'
        else:  # year
            trunc_func = TruncYear('created_at')
            date_format = '%Y'

        # Aggregate revenue by period
        # Use distinct=True on Count to avoid counting duplicates when filtering by service
        revenue_data = queryset.annotate(
            period=trunc_func
        ).values('period').annotate(
            revenue=Sum('montant_final'),
            count=Count('id', distinct=True)
        ).order_by('period')

        # Format response
        results = []
        for item in revenue_data:
            if item['period']:
                results.append({
                    'period': item['period'].strftime(date_format),
                    'revenue': float(item['revenue'] or 0),
                    'orders_count': item['count']
                })

        # Calculate totals
        total_revenue = sum(item['revenue'] for item in results)
        total_orders = sum(item['orders_count'] for item in results)

        response_data = {
            'start_date': start_date.strftime('%Y-%m-%d'),
            'end_date': end_date.strftime('%Y-%m-%d'),
            'group_by': group_by,
            'total_revenue': total_revenue,
            'total_orders': total_orders,
            'results': results
        }

        # Add service filter info if applied
        if service_id and service_name:
            response_data['filter'] = {
                'service_id': service_id,
                'service_name': service_name
            }

        return Response(response_data)

    @extend_schema(
        tags=['ADMIN - CREATION Commande'],
        summary="Créer une commande pour un client (checkout admin)",
        description="Créer une nouvelle commande pour un utilisateur spécifique (ex: commande téléphonique)",
        request=AdminCheckoutSerializer
    )
    @action(detail=False, methods=['post'])
    @transaction.atomic
    def checkout(self, request):
        """
        Create a new commande for a user (admin checkout process).
        POST /api/admin/commandes/checkout/

        All prices are calculated server-side for security.
        """
        serializer = AdminCheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        # Validate user exists
        try:
            user = User.objects.get(uuid=data['user_id'])
        except User.DoesNotExist:
            return Response(
                {'error': 'Utilisateur invalide'},
                status=status.HTTP_400_BAD_REQUEST
            )

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
            peut_utiliser, message_erreur = code_promo.peut_etre_utilise_par(user, montant_ttc_total)
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
            creneau_id = collecte.get('creneau_id')
            if not creneau_id:
                return Response(
                    {'error': 'Le système de créneaux est activé. Veuillez sélectionner un créneau (creneau_id requis).'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                creneau = Creneaux.objects.get(uuid=creneau_id)

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
            creneau_horaire_texte = collecte.get('creneau_texte') or collecte.get('creneau')
            if not creneau_horaire_texte:
                return Response(
                    {'error': 'Veuillez fournir un horaire (creneau_texte ou creneau requis)'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Create commande
        commande = Commande.objects.create(
            user=user,
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
            AdminCommandeSerializer(commande).data,
            status=status.HTTP_201_CREATED
        )

    @extend_schema(
        tags=['ADMIN - Collecte'],
        summary="Assigner un livreur pour la collecte",
        description="Assigne un livreur disponible pour collecter les chaussures chez le client. "
                   "Le livreur recevra une notification par email avec les détails de la collecte.",
        request=AssignDeliveryPersonSerializer
    )
    
    @action(detail=True, methods=['post'])
    def assign_delivery_person(self, request, uuid=None):
        """
        Assign a delivery person to a commande.
        POST /api/admin/commandes/{id}/assign_delivery_person/

        Only available delivery persons can be assigned.
        """
        commande = self.get_object()
        serializer = AssignDeliveryPersonSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        delivery_person_id = serializer.validated_data['delivery_person_id']

        # Validate delivery person exists and is available
        try:
            delivery_person = DeliveryPerson.objects.select_related('user').get(
                uuid=delivery_person_id
            )
        except DeliveryPerson.DoesNotExist:
            return Response(
                {'error': 'Livreur introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if delivery person is available
        if not delivery_person.is_available:
            return Response(
                {'error': 'Ce livreur n\'est pas disponible actuellement'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if there's already an assigned delivery person (reassignment)
        ancien_livreur_id = None
        if commande.delivery_person and commande.delivery_person.id != delivery_person.id:
            ancien_livreur_id = commande.delivery_person.id

        # Assign delivery person
        from django.utils import timezone
        commande.delivery_person = delivery_person
        commande.date_assignation = timezone.now()

        # Sauvegarder la monnaie remise au livreur si fournie
        monnaie = serializer.validated_data.get('monnaie')
        if monnaie is not None:
            commande.monnaie_collecte = monnaie

        commande.save()

        # Send notification email to new delivery person
        from ...tasks import send_delivery_assignment_notification
        send_delivery_assignment_notification.delay(commande.id)

        # Send unassignment notification to old delivery person if applicable
        if ancien_livreur_id:
            from ...tasks import send_delivery_unassignment_notification
            send_delivery_unassignment_notification.delay(commande.id, ancien_livreur_id, 'collecte')

        return Response({
            'message': f'Livreur {delivery_person.user.get_full_name()} assigné avec succès',
            'commande': AdminCommandeSerializer(commande).data
        })

    @extend_schema(
        tags=['ADMIN - Livraison Finale'],
        summary="Assigner un livreur pour la livraison finale",
        description="Assigne un livreur disponible pour la livraison finale d'une commande réparée. "
                   "Le livreur recevra une notification par email avec la date de livraison prévue. "
                   "La commande doit être au statut 'prête' pour pouvoir être assignée.",
        request=AssignDeliveryPersonLivraisonSerializer
    )
    @action(detail=True, methods=['post'], url_path='assign-delivery-livraison')
    @transaction.atomic
    def assign_delivery_livraison(self, request, uuid=None):
        """
        Assign a delivery person for delivery (livraison) of a commande.
        POST /api/admin/commandes/{id}/assign-delivery-livraison/

        Body: {delivery_person_id: int, date_livraison: "YYYY-MM-DD"}
        """
        commande = self.get_object()
        serializer = AssignDeliveryPersonLivraisonSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        delivery_person_id = serializer.validated_data['delivery_person_id']
        date_livraison = serializer.validated_data['date_livraison']

        # Validate delivery person exists and is available
        try:
            delivery_person = DeliveryPerson.objects.select_related('user').get(
                uuid=delivery_person_id
            )
        except DeliveryPerson.DoesNotExist:
            return Response(
                {'error': 'Livreur introuvable'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if delivery person is available
        if not delivery_person.is_available:
            return Response(
                {'error': 'Ce livreur n\'est pas disponible actuellement'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check commande status - should be at least 'prete' for delivery
        if commande.statut_commande not in ['prete', 'en_livraison']:
            return Response(
                {'error': f'La commande doit être prête pour assigner la livraison (statut actuel: {commande.get_statut_commande_display()})'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if there's already an assigned delivery person for livraison (reassignment)
        ancien_livreur_livraison_id = None
        if commande.delivery_person_livraison and commande.delivery_person_livraison.id != delivery_person.id:
            ancien_livreur_livraison_id = commande.delivery_person_livraison.id

        # Assign delivery person for livraison
        from django.utils import timezone
        commande.delivery_person_livraison = delivery_person
        commande.date_livraison = date_livraison
        commande.date_assignation_livraison = timezone.now()
        commande.save()

        # Send notification email to new delivery person
        from ...tasks import send_delivery_assignment_notification_livraison
        send_delivery_assignment_notification_livraison.delay(commande.id)

        # Send unassignment notification to old delivery person if applicable
        if ancien_livreur_livraison_id:
            from ...tasks import send_delivery_unassignment_notification
            send_delivery_unassignment_notification.delay(commande.id, ancien_livreur_livraison_id, 'livraison')

        return Response({
            'message': f'Livreur {delivery_person.user.get_full_name()} assigné pour la livraison le {date_livraison.strftime("%d/%m/%Y")}',
            'commande': AdminCommandeSerializer(commande).data
        })
    @extend_schema(
        tags=['ADMIN - Commandes'],
        summary="Récupérer un produit par code de collecte",
        description="Retourne les détails d'un produit et de sa commande à partir du code de collecte"
    )
    @action(detail=False, methods=['get'], url_path='produits/(?P<code_collecte>[^/.]+)')
    def get_product_by_code(self, request, code_collecte=None):
        """Get product details by collection code."""
        try:
            # Find the product with this code_collecte
            produit = CommandeProduit.objects.select_related('commande').prefetch_related('services').get(
                code_collecte=code_collecte
            )
            
            serializer = ProductByCodeCollecteSerializer(produit, context={'request': request})
            return Response(serializer.data)
            
        except CommandeProduit.DoesNotExist:
            return Response(
                {'error': 'Aucun produit trouvé avec ce code de collecte'},
                status=status.HTTP_404_NOT_FOUND
            )



# ==================== CODES COLLECTE ====================

class AdminCodeCollecteViewSet(viewsets.ModelViewSet):
    lookup_field = 'uuid'
    """
    ViewSet for ADMIN code collecte management.
    """
    queryset = CodeCollecte.objects.select_related('genere_par', 'commande_produit__commande')
    serializer_class = CodeCollecteSerializer
    permission_classes = [IsAdminOrSuperAdmin]
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        """Filter codes by utilise status if requested."""
        queryset = super().get_queryset()
        
        utilise = self.request.query_params.get('utilise')
        if utilise is not None:
            if utilise.lower() == 'true':
                queryset = queryset.filter(utilise=True)
            elif utilise.lower() == 'false':
                queryset = queryset.filter(utilise=False)
        
        return queryset.order_by('-created_at')

    @extend_schema(
        tags=['ADMIN - Codes Collecte'],
        summary="Liste des codes de collecte",
        description="Récupère la liste des codes (filtrables par statut utilise)"
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Codes Collecte'],
        summary="Détails d'un code",
        description="Récupère les détails d'un code de collecte"
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['ADMIN - Codes Collecte'],
        summary="Supprimer un code",
        description="Supprimer un code de collecte (uniquement si non utilisé)"
    )
    def destroy(self, request, *args, **kwargs):
        code = self.get_object()

        if code.utilise:
            return Response(
                {'error': 'Impossible de supprimer un code déjà utilisé'},
                status=status.HTTP_400_BAD_REQUEST
            )

        code.delete()
        return Response(
            {'message': 'Le code a été bien supprimé'},
            status=status.HTTP_200_OK
        )

    @extend_schema(
        tags=['ADMIN - Codes Collecte'],
        summary="Générer des codes de collecte",
        description="Génère un nombre spécifié de codes uniques",
        request=GenerateCodesSerializer
    )
    @action(detail=False, methods=['post'])
    def generate(self, request):
        """
        Generate multiple unique codes.
        POST /api/admin/codes-collecte/generate/
        """
        serializer = GenerateCodesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        nombre = serializer.validated_data['nombre']
        codes_generes = []
        
        # Generate codes
        for _ in range(nombre):
            # Generate unique code (format: CC-XXXXXX)
            while True:
                random_part = ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(6))
                code = f"CC-{random_part}"
                
                # Check if code already exists
                if not CodeCollecte.objects.filter(code=code).exists():
                    break
            
            code_obj = CodeCollecte.objects.create(
                code=code,
                genere_par=request.user
            )
            codes_generes.append(code_obj)
        
        return Response({
            'message': f'{nombre} codes générés avec succès',
            'codes': CodeCollecteSerializer(codes_generes, many=True).data
        }, status=status.HTTP_201_CREATED)

    @extend_schema(
        tags=['ADMIN - Codes Collecte'],
        summary="Statistiques des codes",
        description="Récupère les statistiques des codes de collecte"
    )
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """
        Get codes statistics.
        GET /api/admin/codes-collecte/statistics/
        """
        total = CodeCollecte.objects.count()
        utilises = CodeCollecte.objects.filter(utilise=True).count()
        disponibles = CodeCollecte.objects.filter(utilise=False).count()
        
        return Response({
            'total': total,
            'utilises': utilises,
            'disponibles': disponibles,
            'taux_utilisation': round((utilises / total * 100) if total > 0 else 0, 2)
        })

    @extend_schema(
        tags=['ADMIN - Codes Collecte'],
        summary="Télécharger les codes disponibles",
        description="Télécharge un fichier texte avec tous les codes disponibles"
    )
    @action(detail=False, methods=['get'])
    def download(self, request):
        """
        Download available codes as text file.
        GET /api/admin/codes-collecte/download/
        """
        from django.http import HttpResponse
        
        codes = CodeCollecte.objects.filter(utilise=False).order_by('code')
        
        if not codes.exists():
            return Response(
                {'error': 'Aucun code disponible à télécharger'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create text content
        content = "CODES DE COLLECTE SHOEMAKER\n"
        content += "=" * 50 + "\n\n"
        content += f"Date de génération: {codes.first().created_at.strftime('%d/%m/%Y %H:%M')}\n"
        content += f"Nombre de codes: {codes.count()}\n\n"
        content += "=" * 50 + "\n\n"
        
        for code in codes:
            content += f"{code.code}\n"
        
        # Create response
        response = HttpResponse(content, content_type='text/plain; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="codes_collecte_{codes.first().created_at.strftime("%Y%m%d")}.txt"'
        
        return response
