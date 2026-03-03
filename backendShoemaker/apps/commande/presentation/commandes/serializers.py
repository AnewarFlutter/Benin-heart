"""
Serializers for client endpoints
"""
from rest_framework import serializers
from ...models import MoyenPaiement, Commande, CommandeProduit, CommandeProduitService


# ==================== MOYENS DE PAIEMENT (lecture seule) ====================

class ClientMoyenPaiementSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for client to view active payment methods."""

    class Meta:
        model = MoyenPaiement
        fields = ['id', 'nom', 'code', 'description', 'icone']
        read_only_fields = fields


# ==================== CHECKOUT - INPUT ====================

class CheckoutProduitSerializer(serializers.Serializer):
    """
    Serializer for product data during checkout.
    Décrit un produit (chaussure) à réparer avec les services associés.
    """
    description = serializers.CharField(
        max_length=500,
        help_text="Description détaillée du produit (ex: 'Basket de sport usée')"
    )
    marque = serializers.CharField(
        max_length=100,
        help_text="Marque de la chaussure (ex: 'Nike', 'Adidas', 'Clarks')"
    )
    modele = serializers.CharField(
        max_length=100,
        help_text="Modèle de la chaussure (ex: 'Air Force 1', 'Stan Smith')"
    )
    couleur = serializers.CharField(
        max_length=50,
        help_text="Couleur de la chaussure (ex: 'Blanc', 'Noir', 'Rouge')"
    )
    photo = serializers.ImageField(
        required=False,
        allow_null=True,
        help_text="Photo de la chaussure (optionnel) - Format d'upload de fichier multipart/form-data"
    )
    note_utilisateur = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Notes ou observations supplémentaires sur l'état de la chaussure (ex: 'Semelle décollée et cuir sale')"
    )
    services_ids = serializers.ListField(
        child=serializers.UUIDField(),
        min_length=1,
        help_text="Liste des UUIDs de services à appliquer à ce produit (minimum 1 service). Exemple: ['uuid1', 'uuid2']"
    )


class CheckoutCollecteSerializer(serializers.Serializer):
    """
    Serializer for collecte information during checkout.
    Informations sur le lieu et l'horaire de collecte des chaussures.
    """
    adresse = serializers.CharField(
        help_text="Adresse complète de collecte (ex: 'Dakar, Liberté 6, Immeuble X')"
    )
    latitude = serializers.DecimalField(
        max_digits=10,
        decimal_places=7,
        coerce_to_string=False,
        required=False,
        allow_null=True,
        help_text="Latitude GPS de l'adresse (optionnel, ex: 14.7212)"
    )
    longitude = serializers.DecimalField(
        max_digits=10,
        decimal_places=7,
        coerce_to_string=False,
        required=False,
        allow_null=True,
        help_text="Longitude GPS de l'adresse (optionnel, ex: -17.4586)"
    )
    telephone = serializers.CharField(
        max_length=20,
        help_text="Numéro de téléphone de contact pour la collecte (ex: '+221781234567')"
    )
    date = serializers.DateField(
        help_text="Date souhaitée pour la collecte (format: YYYY-MM-DD, ex: '2025-12-24')"
    )
    creneau_id = serializers.UUIDField(
        required=False,
        allow_null=True,
        help_text="UUID du créneau horaire choisi (REQUIS si le système de créneaux est activé). Utilisez GET /api/client/creneaux/?date=YYYY-MM-DD pour voir les créneaux disponibles."
    )
    creneau_texte = serializers.CharField(
        max_length=100,
        required=False,
        allow_blank=True,
        allow_null=True,
        help_text="Créneau horaire en texte libre (REQUIS si le système de créneaux est désactivé). Ex: '14h - 16h', '09:00 - 12:00'"
    )
    note = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Informations complémentaires pour la collecte (ex: 'Le gardien peut réceptionner le colis')"
    )

    def validate(self, attrs):
        """
        Valider que soit creneau_id soit creneau_texte est fourni selon la configuration.
        """
        from apps.creneaux.models import CreneauxConfig

        config = CreneauxConfig.get_config()
        creneau_id = attrs.get('creneau_id')
        creneau_texte = attrs.get('creneau_texte')

        if config.actif:
            # Système de créneaux activé: creneau_id est requis
            if not creneau_id:
                raise serializers.ValidationError({
                    'creneau_id': 'Le choix d\'un créneau horaire est requis. Utilisez GET /api/client/creneaux/ pour voir les créneaux disponibles.'
                })
        else:
            # Système de créneaux désactivé: creneau_texte est requis
            if not creneau_texte:
                raise serializers.ValidationError({
                    'creneau_texte': 'Veuillez indiquer votre créneau horaire souhaité (ex: "14h - 16h")'
                })

        return attrs


class CheckoutSerializer(serializers.Serializer):
    """
    Serializer for checkout process.
    Permet de créer une nouvelle commande avec tous les détails nécessaires.
    """
    produits = CheckoutProduitSerializer(
        many=True,
        help_text="Liste des produits (chaussures) à réparer avec leurs services. Minimum 1 produit requis."
    )
    moyen_paiement_id = serializers.UUIDField(
        help_text="UUID du moyen de paiement choisi. Utilisez GET /api/client/moyens-paiement/ pour voir la liste des moyens disponibles."
    )
    code_promo = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        help_text="Code promo à appliquer (optionnel, ex: 'WELCOME10'). Si valide, une réduction sera appliquée."
    )
    collecte = CheckoutCollecteSerializer(
        help_text="Informations sur la collecte des chaussures (adresse, date, créneau horaire)"
    )


# ==================== COMMANDES - OUTPUT (pour client) ====================

class ClientCommandeProduitServiceSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for services in client command view."""

    class Meta:
        model = CommandeProduitService
        fields = ['id', 'nom_service', 'prix_ht', 'tva', 'montant_tva', 'prix_ttc']


class ClientCommandeProduitSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for products in client command view."""
    services = ClientCommandeProduitServiceSerializer(many=True, read_only=True)

    class Meta:
        model = CommandeProduit
        fields = [
            'id', 'description', 'marque', 'modele', 'couleur',
            'photo', 'note_utilisateur', 'prix_ht', 'tva', 'prix_ttc', 'services'
        ]


class ClientCommandeSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for client command detail view."""
    produits = ClientCommandeProduitSerializer(many=True, read_only=True)
    moyen_paiement_nom = serializers.CharField(source='moyen_paiement.nom', read_only=True)

    class Meta:
        model = Commande
        fields = [
            'id', 'code_unique',
            'montant_ht', 'montant_tva', 'montant_ttc', 'montant_reduction', 'montant_final',
            'statut_paiement', 'moyen_paiement_nom',
            'statut_commande',
            'adresse_collecte', 'telephone_collecte',
            'date_collecte', 'creneau_horaire', 'note_collecte',
            'produits', 'created_at'
        ]
        read_only_fields = fields


class ClientCommandeListSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for listing client commands."""
    moyen_paiement_nom = serializers.CharField(source='moyen_paiement.nom', read_only=True)
    nombre_produits = serializers.SerializerMethodField()

    class Meta:
        model = Commande
        fields = [
            'id', 'code_unique', 'montant_final',
            'statut_paiement', 'statut_commande', 'moyen_paiement_nom',
            'date_collecte', 'creneau_horaire', 'nombre_produits', 'created_at'
        ]
        read_only_fields = fields

    def get_nombre_produits(self, obj):
        return obj.produits.count()


# ==================== TRACKING - SUIVI COMMANDE ====================

class TrackingProduitSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for product tracking information."""
    services = ClientCommandeProduitServiceSerializer(many=True, read_only=True)
    statut_produit = serializers.SerializerMethodField()
    note_utilisateur = serializers.CharField(read_only=True)
    prix_ttc = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CommandeProduit
        fields = [
            'id', 'marque', 'modele', 'couleur', 'photo',
            'code_collecte', 'date_collecte_effective',
            'statut_produit', 'note_utilisateur', 'prix_ttc', 'services'
        ]

    def get_statut_produit(self, obj):
        """
        Determine product status based on commande status and code_collecte.
        """
        commande = obj.commande

        # If product has collection code, it's collected
        if obj.code_collecte:
            statut_mapping = {
                'collectee': 'Collectée',
                'en_cours': 'En cours de réparation',
                'prete': 'Réparation terminée',
                'en_livraison': 'En cours de livraison',
                'terminee': 'Livrée',
            }
            return statut_mapping.get(commande.statut_commande, commande.get_statut_commande_display())

        # If no code, product is waiting for collection
        return 'En attente de collecte'


class TrackingCommandeSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for commande tracking with detailed product information."""
    produits = TrackingProduitSerializer(many=True, read_only=True)
    statut_libelle = serializers.CharField(source='get_statut_commande_display', read_only=True)
    moyen_paiement_nom = serializers.CharField(source='moyen_paiement.nom', read_only=True)
    timeline = serializers.SerializerMethodField()

    class Meta:
        model = Commande
        fields = [
            'id', 'code_unique', 'statut_commande', 'statut_libelle',
            'montant_final', 'statut_paiement', 'moyen_paiement_nom',
            'date_collecte', 'creneau_horaire', 'date_livraison',
            'code_confirmation_livraison',
            'produits', 'timeline', 'created_at'
        ]

    def get_timeline(self, obj):
        """
        Build a timeline of commande events.
        """
        timeline = []

        # Commande créée
        timeline.append({
            'statut': 'nouvelle',
            'libelle': 'Commande créée',
            'date': obj.created_at,
            'completed': True
        })

        # En attente de collecte
        if obj.date_confirmation_livreur:
            timeline.append({
                'statut': 'en_collecte',
                'libelle': 'En attente de collecte',
                'date': obj.date_confirmation_livreur,
                'completed': True,
                'info': f'Collecte prévue le {obj.date_collecte.strftime("%d/%m/%Y")} - {obj.creneau_horaire}'
            })
        else:
            timeline.append({
                'statut': 'en_collecte',
                'libelle': 'En attente de collecte',
                'date': None,
                'completed': obj.statut_commande in ['en_collecte', 'collectee', 'en_cours', 'prete', 'en_livraison', 'terminee'],
                'info': f'Collecte prévue le {obj.date_collecte.strftime("%d/%m/%Y")} - {obj.creneau_horaire}'
            })

        # Collectée
        if obj.statut_commande in ['collectee', 'en_cours', 'prete', 'en_livraison', 'terminee']:
            # Find the earliest collection date from products
            produits_avec_code = obj.produits.exclude(code_collecte__isnull=True).exclude(code_collecte='')
            if produits_avec_code.exists():
                date_collecte = produits_avec_code.order_by('date_collecte_effective').first().date_collecte_effective
                timeline.append({
                    'statut': 'collectee',
                    'libelle': 'Collectée',
                    'date': date_collecte,
                    'completed': True
                })
            else:
                timeline.append({
                    'statut': 'collectee',
                    'libelle': 'Collectée',
                    'date': None,
                    'completed': True
                })
        else:
            timeline.append({
                'statut': 'collectee',
                'libelle': 'Collectée',
                'date': None,
                'completed': False
            })

        # En cours de réparation
        timeline.append({
            'statut': 'en_cours',
            'libelle': 'En cours de réparation',
            'date': None,
            'completed': obj.statut_commande in ['en_cours', 'prete', 'en_livraison', 'terminee']
        })

        # Réparation terminée
        timeline.append({
            'statut': 'prete',
            'libelle': 'Réparation terminée',
            'date': None,
            'completed': obj.statut_commande in ['prete', 'en_livraison', 'terminee']
        })

        # En cours de livraison
        if obj.date_assignation_livraison:
            timeline.append({
                'statut': 'en_livraison',
                'libelle': 'En cours de livraison',
                'date': obj.date_assignation_livraison,
                'completed': obj.statut_commande in ['en_livraison', 'terminee'],
                'info': f'Livraison prévue le {obj.date_livraison.strftime("%d/%m/%Y")}' if obj.date_livraison else None
            })
        else:
            timeline.append({
                'statut': 'en_livraison',
                'libelle': 'En cours de livraison',
                'date': None,
                'completed': obj.statut_commande in ['en_livraison', 'terminee'],
                'info': f'Livraison prévue le {obj.date_livraison.strftime("%d/%m/%Y")}' if obj.date_livraison else None
            })

        # Livrée
        if obj.date_livraison_effective:
            timeline.append({
                'statut': 'terminee',
                'libelle': 'Livrée',
                'date': obj.date_livraison_effective,
                'completed': True
            })
        else:
            timeline.append({
                'statut': 'terminee',
                'libelle': 'Livrée',
                'date': None,
                'completed': obj.statut_commande == 'terminee'
            })

        return timeline
