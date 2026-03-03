"""
DRF Serializers for Devis Admin API.
"""
from rest_framework import serializers
from ...models import Devis, DevisProduit
from apps.service.models import Service


class AdminDevisProduitSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """
    Serializer complet pour les produits de devis (Admin).
    """
    services_souhaites_display = serializers.SerializerMethodField(
        help_text="Affichage lisible des services"
    )

    class Meta:
        model = DevisProduit
        fields = [
            'id', 'marque', 'type_chaussure', 'photo', 'services_souhaites',
            'services_souhaites_display', 'description',
            'prix_unitaire_ht', 'prix_unitaire_ttc', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_services_souhaites_display(self, obj):
        """Retourne les informations complètes des services."""
        if not obj.services_souhaites:
            return []

        # Récupérer les services depuis la base de données
        services = Service.objects.filter(uuid__in=obj.services_souhaites)

        # Retourner les informations complètes
        return [
            {
                'id': str(service.uuid),
                'nom': service.nom,
                'description': service.description,
                'prix_minimum_ht': float(service.prix_minimum_ht) if service.prix_minimum_ht else 0,
                'prix_minimum_ttc': float(service.prix_minimum_ttc) if service.prix_minimum_ttc else 0,
                'delai_minimum_jours': service.delai_minimum_jours,
                'delai_maximum_jours': service.delai_maximum_jours,
                'statut': service.statut
            }
            for service in services
        ]


class AdminDevisListSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """
    Serializer pour la liste des devis (Admin).
    """
    nombre_produits = serializers.SerializerMethodField(
        help_text="Nombre de paires de chaussures"
    )
    statut_display = serializers.CharField(
        source='get_statut_display',
        read_only=True
    )

    class Meta:
        model = Devis
        fields = [
            'id', 'code_devis', 'nom_complet', 'email', 'telephone',
            'statut', 'statut_display', 'nombre_produits',
            'montant_total_ttc', 'created_at'
        ]
        read_only_fields = fields

    def get_nombre_produits(self, obj):
        """Retourne le nombre de produits."""
        return obj.produits.count()


class AdminDevisDetailSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """
    Serializer pour les détails complets d'un devis (Admin).
    """
    produits = AdminDevisProduitSerializer(many=True, read_only=True)
    statut_display = serializers.CharField(
        source='get_statut_display',
        read_only=True
    )
    traite_par = serializers.SlugRelatedField(
        slug_field='uuid',
        read_only=True
    )
    traite_par_nom = serializers.SerializerMethodField()

    class Meta:
        model = Devis
        fields = [
            'id', 'code_devis', 'nom_complet', 'email', 'telephone',
            'informations_supplementaires', 'statut', 'statut_display',
            'montant_total_ht', 'montant_total_ttc', 'message_admin',
            'date_reponse', 'date_expiration', 'traite_par', 'traite_par_nom',
            'produits', 'created_at', 'updated_at'
        ]
        read_only_fields = fields

    def get_traite_par_nom(self, obj):
        """Retourne le nom de l'admin qui a traité."""
        if obj.traite_par:
            return obj.traite_par.get_full_name() or obj.traite_par.email
        return None


class ProduitPrixSerializer(serializers.Serializer):
    """
    Serializer pour définir le prix d'un produit lors de la réponse.
    """
    id = serializers.UUIDField(help_text="UUID du produit")
    prix_unitaire_ht = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        coerce_to_string=False,
        help_text="Prix HT pour ce produit"
    )
    prix_unitaire_ttc = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        coerce_to_string=False,
        help_text="Prix TTC pour ce produit"
    )


class AdminRepondreDevisSerializer(serializers.Serializer):
    """
    Serializer pour répondre à un devis.
    """
    montant_total_ht = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        coerce_to_string=False,
        help_text="Montant total HT du devis"
    )
    montant_total_ttc = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        coerce_to_string=False,
        help_text="Montant total TTC du devis"
    )
    message_admin = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Message personnalisé pour le client"
    )
    date_expiration = serializers.DateField(
        help_text="Date d'expiration du devis (format: YYYY-MM-DD)"
    )
    produits = ProduitPrixSerializer(
        many=True,
        help_text="Prix pour chaque produit"
    )

    def validate_produits(self, value):
        """Valide que tous les produits ont un prix."""
        if not value or len(value) == 0:
            raise serializers.ValidationError("Vous devez définir les prix pour tous les produits.")
        return value
