"""
Serializers for admin endpoints
"""
from rest_framework import serializers
from ...models import MoyenPaiement, CodePromo, Commande, CommandeProduit, CommandeProduitService, CodeCollecte
from apps.service.models import Service


# ==================== MOYENS DE PAIEMENT ====================

class AdminMoyenPaiementSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for admin moyen paiement management."""

    class Meta:
        model = MoyenPaiement
        fields = ['id', 'nom', 'code', 'description', 'actif', 'icone', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


# ==================== CODES PROMO ====================

class AdminCodePromoSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for admin code promo management."""
    valeur = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
    montant_minimum = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False, allow_null=True, required=False)
    est_valide = serializers.SerializerMethodField()
    utilisations_actuelles = serializers.SerializerMethodField()

    class Meta:
        model = CodePromo
        fields = [
            'id', 'code', 'type_reduction', 'valeur',
            'date_debut', 'date_fin', 'actif', 'description',
            'utilisation_max', 'max_uses_per_user', 'montant_minimum',
            'est_valide', 'utilisations_actuelles', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'est_valide', 'utilisations_actuelles', 'created_at', 'updated_at']

    def get_est_valide(self, obj):
        return obj.est_valide()

    def get_utilisations_actuelles(self, obj):
        return obj.utilisations_actuelles()


class AdminCodePromoUpdateSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for updating code promo (all fields optional)."""
    valeur = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False, required=False)
    montant_minimum = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False, allow_null=True, required=False)
    est_valide = serializers.SerializerMethodField()
    utilisations_actuelles = serializers.SerializerMethodField()

    class Meta:
        model = CodePromo
        fields = [
            'id', 'code', 'type_reduction', 'valeur',
            'date_debut', 'date_fin', 'actif', 'description',
            'utilisation_max', 'max_uses_per_user', 'montant_minimum',
            'est_valide', 'utilisations_actuelles', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'est_valide', 'utilisations_actuelles', 'created_at', 'updated_at']
        extra_kwargs = {
            'code': {'required': False},
            'type_reduction': {'required': False},
            'date_debut': {'required': False},
            'date_fin': {'required': False},
        }

    def get_est_valide(self, obj):
        return obj.est_valide()

    def get_utilisations_actuelles(self, obj):
        return obj.utilisations_actuelles()


# ==================== COMMANDES - NESTED SERIALIZERS ====================

class AdminCommandeProduitServiceSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for services applied to a product (read only)."""
    service_id = serializers.UUIDField(source='service.uuid', read_only=True)

    class Meta:
        model = CommandeProduitService
        fields = ['id', 'service_id', 'nom_service', 'prix_ht', 'tva', 'montant_tva', 'prix_ttc']


class AdminCommandeProduitSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for products in a command (read only)."""
    services = AdminCommandeProduitServiceSerializer(many=True, read_only=True)

    class Meta:
        model = CommandeProduit
        fields = [
            'id', 'description', 'marque', 'modele', 'couleur',
            'photo', 'note_utilisateur', 'prix_ht', 'tva', 'prix_ttc', 'services',
            'code_collecte', 'date_collecte_effective'
        ]


class AdminCommandeSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for admin commande detail (read and write)."""
    user_id = serializers.UUIDField(source='user.uuid', read_only=True)
    produits = AdminCommandeProduitSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_nom_complet = serializers.SerializerMethodField()
    moyen_paiement_id = serializers.UUIDField(source='moyen_paiement.uuid', read_only=True)
    moyen_paiement_nom = serializers.CharField(source='moyen_paiement.nom', read_only=True)
    code_promo_id = serializers.UUIDField(source='code_promo.uuid', read_only=True, allow_null=True)
    code_promo_code = serializers.CharField(source='code_promo.code', read_only=True, allow_null=True)

    # Delivery person for collection (collecte)
    delivery_person_id_to_collect = serializers.UUIDField(source='delivery_person.uuid', read_only=True, allow_null=True)
    delivery_person_nom_to_collect = serializers.SerializerMethodField()

    # Delivery person for delivery (livraison)
    delivery_person_id_to_delivery = serializers.UUIDField(source='delivery_person_livraison.uuid', read_only=True, allow_null=True)
    delivery_person_nom_to_delivery = serializers.SerializerMethodField()

    creneau_id = serializers.UUIDField(source='creneau.uuid', read_only=True, allow_null=True)

    # Monnaie remise au livreur pour la collecte
    monnaie = serializers.DecimalField(source='monnaie_collecte', max_digits=10, decimal_places=2, read_only=True, allow_null=True)
    montant_a_ramener = serializers.SerializerMethodField()

    # Write-only field for updating delivery_person
    delivery_person_uuid = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Commande
        fields = [
            'id', 'code_unique', 'user_id', 'user_email', 'user_nom_complet',
            'montant_ht', 'montant_tva', 'montant_ttc', 'montant_reduction', 'montant_final',
            'statut_paiement', 'moyen_paiement_id', 'moyen_paiement_nom',
            'statut_commande', 'code_promo_id', 'code_promo_code',
            'delivery_person_id_to_collect', 'delivery_person_nom_to_collect',
            'delivery_person_id_to_delivery', 'delivery_person_nom_to_delivery',
            'delivery_person_uuid',
            'date_assignation', 'date_confirmation_livreur', 'rappel_envoye',
            'adresse_collecte', 'latitude', 'longitude', 'telephone_collecte',
            'date_collecte', 'creneau_id', 'creneau_horaire', 'note_collecte', 'monnaie', 'montant_a_ramener',
            'produits', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'code_unique', 'user_id', 'user_email', 'user_nom_complet',
            'montant_ht', 'montant_tva', 'montant_ttc', 'montant_reduction', 'montant_final',
            'moyen_paiement_id', 'moyen_paiement_nom', 'code_promo_id', 'code_promo_code',
            'delivery_person_id_to_collect', 'delivery_person_nom_to_collect',
            'delivery_person_id_to_delivery', 'delivery_person_nom_to_delivery',
            'creneau_id', 'creneau_horaire',
            'produits', 'created_at', 'updated_at'
        ]

    def validate(self, attrs):
        """Convert delivery_person_uuid to delivery_person object."""
        if 'delivery_person_uuid' in attrs:
            from apps.users.models import DeliveryPerson

            if attrs['delivery_person_uuid'] is None:
                attrs['delivery_person'] = None
            else:
                try:
                    delivery_person = DeliveryPerson.objects.get(uuid=attrs['delivery_person_uuid'])
                    attrs['delivery_person'] = delivery_person
                except DeliveryPerson.DoesNotExist:
                    raise serializers.ValidationError({
                        'delivery_person_uuid': 'Livreur invalide'
                    })

            del attrs['delivery_person_uuid']

        return attrs

    def get_user_nom_complet(self, obj):
        return obj.user.get_full_name() or obj.user.email

    def get_delivery_person_nom_to_collect(self, obj):
        if obj.delivery_person:
            return obj.delivery_person.user.get_full_name() or obj.delivery_person.user.email
        return None

    def get_delivery_person_nom_to_delivery(self, obj):
        if obj.delivery_person_livraison:
            return obj.delivery_person_livraison.user.get_full_name() or obj.delivery_person_livraison.user.email
        return None

    def get_montant_a_ramener(self, obj):
        """Calcule le montant à ramener (montant_final + monnaie)."""
        from decimal import Decimal
        montant = obj.montant_final or Decimal('0')
        monnaie = obj.monnaie_collecte or Decimal('0')
        return float(montant + monnaie)


class AdminCommandeListSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for listing commandes (admin)."""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_nom_complet = serializers.SerializerMethodField()
    moyen_paiement_nom = serializers.CharField(source='moyen_paiement.nom', read_only=True)

    # Delivery person for collection (collecte)
    delivery_person_id_to_collect = serializers.UUIDField(source='delivery_person.uuid', read_only=True, allow_null=True)
    delivery_person_nom_to_collect = serializers.SerializerMethodField()

    # Delivery person for delivery (livraison)
    delivery_person_id_to_delivery = serializers.UUIDField(source='delivery_person_livraison.uuid', read_only=True, allow_null=True)
    delivery_person_nom_to_delivery = serializers.SerializerMethodField()

    nombre_produits = serializers.SerializerMethodField()

    class Meta:
        model = Commande
        fields = [
            'id', 'code_unique', 'user_email', 'user_nom_complet', 'montant_final',
            'statut_paiement', 'statut_commande', 'moyen_paiement_nom',
            'delivery_person_id_to_collect', 'delivery_person_nom_to_collect',
            'delivery_person_id_to_delivery', 'delivery_person_nom_to_delivery',
            'date_collecte', 'nombre_produits', 'created_at'
        ]

    def get_user_nom_complet(self, obj):
        return obj.user.get_full_name() or obj.user.email

    def get_nombre_produits(self, obj):
        return obj.produits.count()

    def get_delivery_person_nom_to_collect(self, obj):
        if obj.delivery_person:
            return obj.delivery_person.user.get_full_name() or obj.delivery_person.user.email
        return None

    def get_delivery_person_nom_to_delivery(self, obj):
        if obj.delivery_person_livraison:
            return obj.delivery_person_livraison.user.get_full_name() or obj.delivery_person_livraison.user.email
        return None


# ==================== COMMANDES - CREATE/UPDATE ====================

class AdminCommandeUpdateSerializer(serializers.Serializer):
    """Serializer for updating a commande (admin)."""

    # Statuts
    statut_paiement = serializers.ChoiceField(
        choices=Commande.STATUT_PAIEMENT_CHOICES,
        required=False
    )
    statut_commande = serializers.ChoiceField(
        choices=Commande.STATUT_COMMANDE_CHOICES,
        required=False
    )

    # Relations (UUID)
    moyen_paiement_id = serializers.UUIDField(required=False, allow_null=True)
    code_promo_code = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    delivery_person_id = serializers.UUIDField(required=False, allow_null=True)

    # Dates et flags
    date_assignation = serializers.DateTimeField(required=False, allow_null=True)
    date_confirmation_livreur = serializers.DateTimeField(required=False, allow_null=True)
    rappel_envoye = serializers.BooleanField(required=False)

    # Collecte
    adresse_collecte = serializers.CharField(required=False)
    latitude = serializers.DecimalField(max_digits=10, decimal_places=7, coerce_to_string=False, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=10, decimal_places=7, coerce_to_string=False, required=False, allow_null=True)
    telephone_collecte = serializers.CharField(max_length=20, required=False)
    date_collecte = serializers.DateField(required=False)
    note_collecte = serializers.CharField(required=False, allow_blank=True)

    # Système de créneaux
    creneau_id = serializers.UUIDField(
        required=False,
        allow_null=True,
        help_text="UUID du créneau horaire (requis si système de créneaux activé)"
    )
    creneau_texte = serializers.CharField(
        max_length=50,
        required=False,
        allow_blank=True,
        allow_null=True,
        help_text="Horaire en texte libre (utilisé si système de créneaux désactivé)"
    )

    def validate(self, attrs):
        """Validate and convert UUIDs to objects."""
        from apps.users.models import DeliveryPerson
        from apps.creneaux.models import Creneaux, CreneauxConfig
        from django.utils import timezone
        from datetime import datetime

        # Convert moyen_paiement_id to moyen_paiement object
        if 'moyen_paiement_id' in attrs and attrs['moyen_paiement_id'] is not None:
            try:
                moyen_paiement = MoyenPaiement.objects.get(uuid=attrs['moyen_paiement_id'])
                attrs['moyen_paiement'] = moyen_paiement
                del attrs['moyen_paiement_id']
            except MoyenPaiement.DoesNotExist:
                raise serializers.ValidationError({
                    'moyen_paiement_id': 'Moyen de paiement invalide'
                })

        # Convert code_promo_code to code_promo object
        if 'code_promo_code' in attrs:
            if attrs['code_promo_code']:
                try:
                    code_promo = CodePromo.objects.get(code=attrs['code_promo_code'])
                    if not code_promo.est_valide():
                        raise serializers.ValidationError({
                            'code_promo_code': 'Code promo invalide ou expiré'
                        })
                    attrs['code_promo'] = code_promo
                except CodePromo.DoesNotExist:
                    raise serializers.ValidationError({
                        'code_promo_code': 'Code promo introuvable'
                    })
            else:
                attrs['code_promo'] = None
            del attrs['code_promo_code']

        # Convert delivery_person_id to delivery_person object
        if 'delivery_person_id' in attrs:
            if attrs['delivery_person_id'] is None:
                attrs['delivery_person'] = None
            else:
                try:
                    delivery_person = DeliveryPerson.objects.get(uuid=attrs['delivery_person_id'])
                    attrs['delivery_person'] = delivery_person
                except DeliveryPerson.DoesNotExist:
                    raise serializers.ValidationError({
                        'delivery_person_id': 'Livreur invalide'
                    })
            del attrs['delivery_person_id']

        # Validate creneaux system
        if 'creneau_id' in attrs or 'creneau_texte' in attrs:
            try:
                config = CreneauxConfig.objects.first()
                systeme_actif = config.actif if config else False
            except:
                systeme_actif = False

            if systeme_actif:
                # Système de créneaux activé - creneau_id est requis
                creneau_id = attrs.get('creneau_id')
                if not creneau_id:
                    raise serializers.ValidationError({
                        'creneau_id': 'Le créneau est obligatoire (système de créneaux activé)'
                    })

                # Validate creneau exists and is available
                try:
                    creneau = Creneaux.objects.get(uuid=creneau_id)

                    # Check if creneau is available
                    if not creneau.est_disponible():
                        raise serializers.ValidationError({
                            'creneau_id': 'Ce créneau n\'est pas disponible'
                        })

                    attrs['creneau'] = creneau
                    # Auto-fill creneau_horaire from creneau
                    attrs['creneau_horaire'] = f"{creneau.heure_debut.strftime('%H:%M')} - {creneau.heure_fin.strftime('%H:%M')}"

                except Creneaux.DoesNotExist:
                    raise serializers.ValidationError({
                        'creneau_id': 'Créneau invalide'
                    })

                # Remove creneau_id from attrs
                del attrs['creneau_id']
                # Remove creneau_texte if present
                if 'creneau_texte' in attrs:
                    del attrs['creneau_texte']

            else:
                # Système de créneaux désactivé - creneau_texte est utilisé
                creneau_texte = attrs.get('creneau_texte', '').strip()
                if creneau_texte:
                    attrs['creneau_horaire'] = creneau_texte
                    attrs['creneau'] = None

                # Remove both creneau fields
                if 'creneau_id' in attrs:
                    del attrs['creneau_id']
                if 'creneau_texte' in attrs:
                    del attrs['creneau_texte']

        return attrs


class UpdateStatutSerializer(serializers.Serializer):
    """Serializer for updating command status."""
    statut_paiement = serializers.ChoiceField(
        choices=Commande.STATUT_PAIEMENT_CHOICES,
        required=False
    )
    statut_commande = serializers.ChoiceField(
        choices=Commande.STATUT_COMMANDE_CHOICES,
        required=False
    )


# ==================== ADMIN CHECKOUT ====================

class AdminCheckoutProduitSerializer(serializers.Serializer):
    """Serializer for product data during admin checkout."""
    description = serializers.CharField(max_length=500)
    marque = serializers.CharField(max_length=100)
    modele = serializers.CharField(max_length=100)
    couleur = serializers.CharField(max_length=50)
    photo = serializers.ImageField(required=False, allow_null=True)
    note_utilisateur = serializers.CharField(required=False, allow_blank=True)
    services_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        help_text="Liste des UUIDs de services à appliquer à ce produit"
    )


class AdminCheckoutCollecteSerializer(serializers.Serializer):
    """Serializer for collecte information during admin checkout."""
    adresse = serializers.CharField()
    latitude = serializers.DecimalField(max_digits=10, decimal_places=7, coerce_to_string=False, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=10, decimal_places=7, coerce_to_string=False, required=False, allow_null=True)
    telephone = serializers.CharField(max_length=20)
    date = serializers.DateField()

    # Système de créneaux prédéfinis (si activé)
    creneau_id = serializers.UUIDField(
        required=False,
        allow_null=True,
        help_text="UUID du créneau horaire (requis si système de créneaux activé)"
    )

    # Mode texte libre (si système désactivé)
    creneau_texte = serializers.CharField(
        max_length=50,
        required=False,
        allow_blank=True,
        allow_null=True,
        help_text="Horaire en texte libre (utilisé si système de créneaux désactivé)"
    )

    # Ancien champ (deprecated mais gardé pour rétrocompatibilité)
    creneau = serializers.CharField(
        max_length=50,
        required=False,
        allow_blank=True,
        allow_null=True,
        help_text="[DEPRECATED] Utiliser creneau_id ou creneau_texte à la place"
    )

    note = serializers.CharField(required=False, allow_blank=True)


class AdminCheckoutSerializer(serializers.Serializer):
    """Serializer for admin checkout process (create commande for a user)."""
    user_id = serializers.UUIDField(
        help_text="UUID de l'utilisateur pour lequel créer la commande"
    )
    produits = AdminCheckoutProduitSerializer(many=True)
    moyen_paiement_id = serializers.UUIDField(
        help_text="UUID du moyen de paiement"
    )
    code_promo = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    collecte = AdminCheckoutCollecteSerializer()


# ==================== ASSIGN DELIVERY PERSON ====================

class AssignDeliveryPersonSerializer(serializers.Serializer):
    """Serializer for assigning a delivery person to a commande."""
    delivery_person_id = serializers.UUIDField(
        help_text="UUID du livreur à assigner à cette commande"
    )
    monnaie = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        allow_null=True,
        help_text="Montant de monnaie remis au livreur pour la collecte"
    )


class AssignDeliveryPersonLivraisonSerializer(serializers.Serializer):
    """Serializer for assigning a delivery person for delivery (livraison)."""
    delivery_person_id = serializers.UUIDField(
        help_text="UUID du livreur à assigner pour la livraison"
    )
    date_livraison = serializers.DateField(
        help_text="Date de livraison prévue"
    )


# ==================== CODES COLLECTE ====================

class CodeCollecteSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for code collecte."""
    genere_par_nom = serializers.CharField(source='genere_par.get_full_name', read_only=True)
    commande_numero = serializers.SerializerMethodField()
    produit_details = serializers.SerializerMethodField()

    class Meta:
        model = CodeCollecte
        fields = [
            'id', 'code', 'genere_par', 'genere_par_nom', 'utilise',
            'date_utilisation', 'commande_produit', 'commande_numero',
            'produit_details', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_commande_numero(self, obj):
        if obj.commande_produit:
            return obj.commande_produit.commande.code_unique
        return None

    def get_produit_details(self, obj):
        if obj.commande_produit:
            return {
                'marque': obj.commande_produit.marque,
                'modele': obj.commande_produit.modele,
                'couleur': obj.commande_produit.couleur
            }
        return None


class GenerateCodesSerializer(serializers.Serializer):
    """Serializer for generating multiple codes."""
    nombre = serializers.IntegerField(
        min_value=1,
        max_value=1000,
        help_text="Nombre de codes à générer (max 1000)"
    )


class ProductByCodeCollecteSerializer(serializers.Serializer):
    """Serializer for product details retrieved by code_collecte."""
    commande_id = serializers.UUIDField(source='commande.uuid')
    commande_code = serializers.CharField(source='commande.code_unique')
    produit = serializers.SerializerMethodField()

    def get_produit(self, obj):
        """Return full product details including services."""
        services_data = []
        for service in obj.services.all():
            services_data.append({
                'id': str(service.uuid),
                'service_id': str(service.service.uuid),
                'nom_service': service.nom_service,
                'prix_ht': float(service.prix_ht),
                'tva': float(service.tva),
                'montant_tva': float(service.montant_tva),
                'prix_ttc': float(service.prix_ttc)
            })

        return {
            'id': str(obj.uuid),
            'description': obj.description,
            'marque': obj.marque,
            'modele': obj.modele,
            'couleur': obj.couleur,
            'photo': self.context.get('request').build_absolute_uri(obj.photo.url) if obj.photo else None,
            'note_utilisateur': obj.note_utilisateur,
            'prix_ht': float(obj.prix_ht),
            'tva': float(obj.tva),
            'prix_ttc': float(obj.prix_ttc),
            'code_collecte': obj.code_collecte,
            'date_collecte_effective': obj.date_collecte_effective,
            'services': services_data
        }
