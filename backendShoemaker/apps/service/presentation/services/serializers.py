"""
Serializers for client service endpoints (public)
"""
from rest_framework import serializers
from ...models import Service, ServiceCategory


class ClientServiceSerializer(serializers.ModelSerializer):
    """
    Serializer for client service viewing (public).
    Affiche tous les services disponibles avec leurs tarifs et délais.
    """
    id = serializers.UUIDField(source='uuid', read_only=True)
    category_id = serializers.UUIDField(source='category.uuid', read_only=True, allow_null=True)
    category_name = serializers.CharField(source='category.nom', read_only=True, allow_null=True)
    prix_minimum_ht = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False, read_only=True)
    tva = serializers.DecimalField(max_digits=5, decimal_places=2, coerce_to_string=False, read_only=True)
    prix_minimum_ttc = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False, read_only=True)
    montant_tva = serializers.SerializerMethodField(
        help_text="Montant de la TVA calculé automatiquement (prix_minimum_ht * tva / 100)"
    )

    class Meta:
        model = Service
        fields = [
            'id', 'nom', 'description', 'category_id', 'category_name',
            'prix_minimum_ht', 'tva', 'prix_minimum_ttc', 'montant_tva',
            'delai_minimum_jours', 'delai_maximum_jours',
            'nombre_heures_delai_maximum', 'icone'
        ]
        read_only_fields = fields  # Tous les champs en lecture seule

    def get_montant_tva(self, obj):
        """Retourne le montant de la TVA."""
        montant = obj.calculer_montant_tva()
        return float(montant) if montant else 0


class ClientServiceCategorySerializer(serializers.ModelSerializer):
    """
    Serializer pour les catégories avec leurs services imbriqués (public).
    """
    id = serializers.UUIDField(source='uuid', read_only=True)
    services = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = ServiceCategory
        fields = ['id', 'nom', 'description', 'image', 'services']

    def get_image(self, obj):
        """Retourne l'URL complète de l'image ou None."""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_services(self, obj):
        """Retourne uniquement les services actifs de cette catégorie."""
        active_services = obj.services.filter(statut='actif').order_by('nom')
        return ClientServiceSerializer(active_services, many=True).data
