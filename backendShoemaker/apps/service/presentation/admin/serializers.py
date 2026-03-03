"""
Serializers for admin service endpoints
"""
from rest_framework import serializers
from ...models import Service, ServiceCategory


class AdminServiceSerializer(serializers.ModelSerializer):
    """Serializer for admin service management."""
    id = serializers.UUIDField(source='uuid', read_only=True)
    category_id = serializers.SlugRelatedField(
        source='category',
        slug_field='uuid',
        queryset=ServiceCategory.objects.all(),
        required=False,
        allow_null=True
    )
    category_name = serializers.CharField(source='category.nom', read_only=True, allow_null=True)
    prix_minimum_ht = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
    tva = serializers.DecimalField(max_digits=5, decimal_places=2, coerce_to_string=False)
    prix_minimum_ttc = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False, read_only=True)
    montant_tva = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            'id', 'nom', 'description', 'category_id', 'category_name',
            'prix_minimum_ht', 'tva', 'prix_minimum_ttc', 'montant_tva',
            'delai_minimum_jours', 'delai_maximum_jours',
            'nombre_heures_delai_maximum', 'statut', 'icone',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'prix_minimum_ttc', 'montant_tva', 'category_name', 'created_at', 'updated_at']

    def get_montant_tva(self, obj):
        """Retourne le montant de la TVA."""
        montant = obj.calculer_montant_tva()
        return float(montant) if montant else 0

    def validate(self, attrs):
        """Validate service data."""
        delai_min = attrs.get('delai_minimum_jours')
        delai_max = attrs.get('delai_maximum_jours')

        if delai_max and delai_max < delai_min:
            raise serializers.ValidationError({
                'delai_maximum_jours': 'Le délai maximum doit être supérieur au délai minimum.'
            })

        return attrs


class AdminServiceUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating services (admin) - tous les champs optionnels."""
    id = serializers.UUIDField(source='uuid', read_only=True)
    category_id = serializers.SlugRelatedField(
        source='category',
        slug_field='uuid',
        queryset=ServiceCategory.objects.all(),
        required=False,
        allow_null=True
    )
    category_name = serializers.CharField(source='category.nom', read_only=True, allow_null=True)
    prix_minimum_ht = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False, required=False)
    tva = serializers.DecimalField(max_digits=5, decimal_places=2, coerce_to_string=False, required=False)
    prix_minimum_ttc = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False, read_only=True)
    montant_tva = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            'id', 'nom', 'description', 'category_id', 'category_name',
            'prix_minimum_ht', 'tva', 'prix_minimum_ttc', 'montant_tva',
            'delai_minimum_jours', 'delai_maximum_jours',
            'nombre_heures_delai_maximum', 'statut', 'icone',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'prix_minimum_ttc', 'montant_tva', 'category_name', 'created_at', 'updated_at']
        extra_kwargs = {
            'nom': {'required': False},
            'description': {'required': False},
            'delai_minimum_jours': {'required': False},
            'nombre_heures_delai_maximum': {'required': False},
        }

    def get_montant_tva(self, obj):
        """Retourne le montant de la TVA."""
        montant = obj.calculer_montant_tva()
        return float(montant) if montant else 0

    def validate(self, attrs):
        """Validate service data."""
        # Pour la validation, utiliser les valeurs existantes si non fournies
        instance = self.instance
        delai_min = attrs.get('delai_minimum_jours', instance.delai_minimum_jours if instance else None)
        delai_max = attrs.get('delai_maximum_jours', instance.delai_maximum_jours if instance else None)

        if delai_max and delai_min and delai_max < delai_min:
            raise serializers.ValidationError({
                'delai_maximum_jours': 'Le délai maximum doit être supérieur au délai minimum.'
            })

        return attrs


class AdminServiceListSerializer(serializers.ModelSerializer):
    """Serializer for listing services (admin)."""
    id = serializers.UUIDField(source='uuid', read_only=True)
    category_id = serializers.UUIDField(source='category.uuid', read_only=True, allow_null=True)
    category_name = serializers.CharField(source='category.nom', read_only=True, allow_null=True)
    prix_minimum_ht = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False, read_only=True)
    tva = serializers.DecimalField(max_digits=5, decimal_places=2, coerce_to_string=False, read_only=True)
    prix_minimum_ttc = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False, read_only=True)

    class Meta:
        model = Service
        fields = [
            'id', 'nom', 'category_id', 'category_name', 'prix_minimum_ht', 'tva', 'prix_minimum_ttc',
            'delai_minimum_jours', 'delai_maximum_jours', 'statut', 'created_at'
        ]


# ==================== SERVICE CATEGORIES ====================

class ServiceMinimalSerializer(serializers.ModelSerializer):
    """Serializer minimal pour les services dans les catégories."""
    id = serializers.UUIDField(source='uuid', read_only=True)

    class Meta:
        model = Service
        fields = ['id', 'nom', 'description']


class AdminServiceCategorySerializer(serializers.ModelSerializer):
    """Serializer for admin service category management."""
    id = serializers.UUIDField(source='uuid', read_only=True)
    services_ids = serializers.SerializerMethodField()
    services = serializers.SerializerMethodField()

    class Meta:
        model = ServiceCategory
        fields = [
            'id', 'nom', 'description', 'image', 'statut',
            'services_ids', 'services', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'services_ids', 'services', 'created_at', 'updated_at']
        extra_kwargs = {
            'image': {'required': False},
        }

    def to_representation(self, instance):
        """Retourne l'URL complète de l'image dans la réponse."""
        data = super().to_representation(instance)
        if instance.image:
            request = self.context.get('request')
            if request:
                data['image'] = request.build_absolute_uri(instance.image.url)
            else:
                data['image'] = instance.image.url
        else:
            data['image'] = None
        return data

    def get_services_ids(self, obj):
        """Retourne les UUIDs des services de cette catégorie."""
        return [str(service.uuid) for service in obj.services.all()]

    def get_services(self, obj):
        """Retourne les 3 premiers services de cette catégorie."""
        services = obj.services.filter(statut='actif')[:3]
        return ServiceMinimalSerializer(services, many=True).data


class AdminServiceCategoryUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating service categories (admin) - tous les champs optionnels."""
    id = serializers.UUIDField(source='uuid', read_only=True)
    services_ids = serializers.SerializerMethodField()

    class Meta:
        model = ServiceCategory
        fields = [
            'id', 'nom', 'description', 'image', 'statut',
            'services_ids', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'services_ids', 'created_at', 'updated_at']
        extra_kwargs = {
            'nom': {'required': False},
            'description': {'required': False},
            'image': {'required': False},
            'statut': {'required': False},
        }

    def get_services_ids(self, obj):
        """Retourne les UUIDs des services de cette catégorie."""
        return [str(service.uuid) for service in obj.services.all()]

    def to_representation(self, instance):
        """Retourne l'URL complète de l'image dans la réponse."""
        data = super().to_representation(instance)
        if instance.image:
            request = self.context.get('request')
            if request:
                data['image'] = request.build_absolute_uri(instance.image.url)
            else:
                data['image'] = instance.image.url
        else:
            data['image'] = None
        return data
