"""
Serializers for delivery endpoints
"""
from rest_framework import serializers
from ...models import Commande, CommandeProduit, CommandeProduitService, CodeCollecte
from math import radians, sin, cos, sqrt, atan2


# ==================== UTILITY FUNCTIONS ====================

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate distance between two GPS coordinates using Haversine formula.
    Returns distance in kilometers.
    """
    if not all([lat1, lon1, lat2, lon2]):
        return None

    # Convert to radians
    lat1, lon1, lat2, lon2 = map(radians, [float(lat1), float(lon1), float(lat2), float(lon2)])

    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))

    # Earth radius in kilometers
    radius = 6371
    distance = radius * c

    return round(distance, 2)


# ==================== NESTED SERIALIZERS ====================

class DeliveryCommandeProduitServiceSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for services in a product (delivery view)."""
    prix_ttc = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False, read_only=True)

    class Meta:
        model = CommandeProduitService
        fields = ['id', 'nom_service', 'prix_ttc']


class DeliveryCommandeProduitSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for products in a commande (delivery view)."""
    services = DeliveryCommandeProduitServiceSerializer(many=True, read_only=True)
    prix_ttc = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False, read_only=True)

    class Meta:
        model = CommandeProduit
        fields = [
            'id', 'description', 'marque', 'modele', 'couleur',
            'photo', 'note_utilisateur', 'prix_ttc', 'services',
            'code_collecte', 'date_collecte_effective'
        ]


# ==================== COMMANDE SERIALIZERS ====================

class DeliveryCommandeListSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for listing commandes assigned to delivery person."""
    client_nom = serializers.SerializerMethodField()
    nombre_produits = serializers.SerializerMethodField()
    distance_km = serializers.SerializerMethodField()
    montant_final = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False, read_only=True)

    class Meta:
        model = Commande
        fields = [
            'id', 'code_unique', 'client_nom', 'montant_final',
            'statut_commande', 'date_collecte', 'creneau_horaire',
            'adresse_collecte', 'latitude', 'longitude', 'nombre_produits',
            'distance_km', 'date_assignation'
        ]

    def get_client_nom(self, obj):
        return obj.user.get_full_name() or obj.user.email

    def get_nombre_produits(self, obj):
        return obj.produits.count()

    def get_distance_km(self, obj):
        """
        Calculate distance between delivery person and collection address.
        Requires 'livreur_lat' and 'livreur_lon' in context.
        """
        context = self.context
        livreur_lat = context.get('livreur_lat')
        livreur_lon = context.get('livreur_lon')

        if not all([livreur_lat, livreur_lon, obj.latitude, obj.longitude]):
            return None

        return calculate_distance(livreur_lat, livreur_lon, obj.latitude, obj.longitude)


class DeliveryCommandeDetailSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for detailed view of a commande (delivery)."""
    client_nom = serializers.CharField(source='user.get_full_name', read_only=True)
    client_email = serializers.EmailField(source='user.email', read_only=True)
    client_telephone = serializers.CharField(source='user.telephone', read_only=True)
    produits = DeliveryCommandeProduitSerializer(many=True, read_only=True)
    montant_final = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False, read_only=True)
    monnaie = serializers.DecimalField(source='monnaie_collecte', max_digits=10, decimal_places=2, coerce_to_string=False, read_only=True, allow_null=True)
    montant_a_ramener = serializers.SerializerMethodField()

    class Meta:
        model = Commande
        fields = [
            'id', 'code_unique', 'client_nom', 'client_email', 'client_telephone',
            'montant_final', 'monnaie', 'montant_a_ramener', 'statut_commande', 'statut_paiement',
            'date_collecte', 'creneau_horaire', 'adresse_collecte',
            'latitude', 'longitude', 'telephone_collecte', 'note_collecte',
            'produits', 'date_assignation', 'date_confirmation_livreur', 'created_at'
        ]

    def get_montant_a_ramener(self, obj):
        """Calcule le montant à ramener (montant_final + monnaie)."""
        from decimal import Decimal
        montant = obj.montant_final or Decimal('0')
        monnaie = obj.monnaie_collecte or Decimal('0')
        return float(montant + monnaie)


# ==================== CODES COLLECTE ====================

class DeliveryCodeCollecteSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for code collecte (delivery view)."""
    
    class Meta:
        model = CodeCollecte
        fields = ['id', 'code', 'utilise', 'created_at']
        read_only_fields = ['id', 'utilise', 'created_at']


class AssignCodeSerializer(serializers.Serializer):
    """Serializer for assigning a code to a product."""
    produit_id = serializers.UUIDField(
        help_text="UUID du produit (chaussure) auquel assigner le code"
    )
    code = serializers.CharField(
        max_length=20,
        help_text="Code de collecte à assigner"
    )


class ValidateLivraisonSerializer(serializers.Serializer):
    """Serializer for validating delivery with confirmation code."""
    code_confirmation = serializers.CharField(
        max_length=10,
        help_text="Code de confirmation fourni par le client"
    )


# ==================== HISTORIQUE ====================

class DeliveryHistoriqueProduitSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for products in historique with absolute URLs for photos."""
    services = DeliveryCommandeProduitServiceSerializer(many=True, read_only=True)
    prix_ttc = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False, read_only=True)
    photo = serializers.SerializerMethodField()

    class Meta:
        model = CommandeProduit
        fields = [
            'id', 'description', 'marque', 'modele', 'couleur',
            'photo', 'note_utilisateur', 'prix_ttc', 'services',
            'code_collecte', 'date_collecte_effective'
        ]

    def get_photo(self, obj):
        """Return absolute URL for photo"""
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None


class DeliveryHistoriqueSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for completed missions history."""
    client_nom = serializers.SerializerMethodField()
    client_telephone = serializers.SerializerMethodField()
    produits = DeliveryHistoriqueProduitSerializer(many=True, read_only=True)
    montant_final = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False, read_only=True)
    monnaie = serializers.DecimalField(source='monnaie_collecte', max_digits=10, decimal_places=2, coerce_to_string=False, read_only=True, allow_null=True)
    montant_a_ramener = serializers.SerializerMethodField()
    date_completion = serializers.SerializerMethodField()
    type_mission = serializers.SerializerMethodField()

    class Meta:
        model = Commande
        fields = [
            'id', 'code_unique', 'client_nom', 'client_telephone',
            'montant_final', 'monnaie', 'montant_a_ramener', 'statut_commande', 'type_mission',
            'adresse_collecte', 'note_collecte', 'produits',
            'date_completion', 'created_at'
        ]

    def get_client_nom(self, obj):
        return obj.user.get_full_name() or obj.user.email

    def get_client_telephone(self, obj):
        """Return telephone_collecte (commande field) or fallback to user.telephone"""
        return obj.telephone_collecte or getattr(obj.user, 'telephone', None) or 'Non renseigné'

    def get_date_completion(self, obj):
        """Return the completion date based on status."""
        if obj.statut_commande == 'collectee':
            # For collecte, use the date_collecte_effective from the first product
            first_produit = obj.produits.first()
            if first_produit and first_produit.date_collecte_effective:
                return first_produit.date_collecte_effective
        elif obj.statut_commande == 'terminee':
            # For livraison, use date_livraison_effective
            return obj.date_livraison_effective
        return None

    def get_type_mission(self, obj):
        """Return 'collecte' or 'livraison' based on status."""
        if obj.statut_commande == 'collectee':
            return 'collecte'
        elif obj.statut_commande == 'terminee':
            return 'livraison'
        return None

    def get_montant_a_ramener(self, obj):
        """Calcule le montant à ramener (montant_final + monnaie)."""
        from decimal import Decimal
        montant = obj.montant_final or Decimal('0')
        monnaie = obj.monnaie_collecte or Decimal('0')
        return float(montant + monnaie)
