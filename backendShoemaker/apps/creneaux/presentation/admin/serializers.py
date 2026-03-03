"""
Serializers for admin creneaux endpoints
"""
from rest_framework import serializers
from ...models import Creneaux, CreneauxConfig


class AdminCreneauxSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for admin creneaux management (full details)."""

    places_restantes = serializers.ReadOnlyField()
    taux_occupation = serializers.ReadOnlyField()
    est_disponible = serializers.SerializerMethodField()
    est_delai_depasse = serializers.SerializerMethodField()
    est_passe = serializers.SerializerMethodField()

    class Meta:
        model = Creneaux
        fields = [
            'id', 'date', 'heure_debut', 'heure_fin',
            'duree_limite_minutes', 'capacite_max', 'reservations_actuelles',
            'actif', 'places_restantes', 'taux_occupation',
            'est_disponible', 'est_delai_depasse', 'est_passe',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_est_disponible(self, obj):
        """Retourne si le créneau est disponible."""
        return obj.est_disponible()

    def get_est_delai_depasse(self, obj):
        """Retourne si le délai est dépassé."""
        return obj.est_delai_depasse()

    def get_est_passe(self, obj):
        """Retourne si le créneau est passé."""
        return obj.est_passe()

    def validate(self, attrs):
        """Validate creneaux data."""
        heure_debut = attrs.get('heure_debut')
        heure_fin = attrs.get('heure_fin')

        if heure_fin and heure_debut and heure_fin <= heure_debut:
            raise serializers.ValidationError({
                'heure_fin': "L'heure de fin doit être après l'heure de début."
            })

        duree_limite = attrs.get('duree_limite_minutes')
        if duree_limite is not None and duree_limite < 0:
            raise serializers.ValidationError({
                'duree_limite_minutes': "La durée limite ne peut pas être négative."
            })

        capacite_max = attrs.get('capacite_max')
        if capacite_max is not None and capacite_max < 1:
            raise serializers.ValidationError({
                'capacite_max': "La capacité maximale doit être au moins 1."
            })

        reservations_actuelles = attrs.get('reservations_actuelles', 0)
        if reservations_actuelles < 0:
            raise serializers.ValidationError({
                'reservations_actuelles': "Le nombre de réservations actuelles ne peut pas être négatif."
            })

        # Si on modifie un créneau existant
        if self.instance:
            capacite_max = capacite_max or self.instance.capacite_max
            reservations_actuelles = reservations_actuelles or self.instance.reservations_actuelles

        if capacite_max and reservations_actuelles > capacite_max:
            raise serializers.ValidationError({
                'reservations_actuelles': f"Le nombre de réservations actuelles ({reservations_actuelles}) dépasse la capacité maximale ({capacite_max})."
            })

        return attrs


class AdminCreneauxListSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for listing creneaux (admin) - lighter version."""

    places_restantes = serializers.ReadOnlyField()
    est_disponible = serializers.SerializerMethodField()

    class Meta:
        model = Creneaux
        fields = [
            'id', 'date', 'heure_debut', 'heure_fin',
            'duree_limite_minutes', 'capacite_max', 'reservations_actuelles', 'places_restantes',
            'actif', 'est_disponible', 'created_at', 'updated_at'
        ]

    def get_est_disponible(self, obj):
        """Retourne si le créneau est disponible."""
        return obj.est_disponible()


class AdminCreneauxCreateUpdateSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for creating/updating creneaux (admin)."""

    class Meta:
        model = Creneaux
        fields = [
            'id', 'date', 'heure_debut', 'heure_fin',
            'duree_limite_minutes', 'capacite_max', 'reservations_actuelles',
            'actif'
        ]

    def validate(self, attrs):
        """Validate creneaux data."""
        heure_debut = attrs.get('heure_debut')
        heure_fin = attrs.get('heure_fin')

        if heure_fin and heure_debut and heure_fin <= heure_debut:
            raise serializers.ValidationError({
                'heure_fin': "L'heure de fin doit être après l'heure de début."
            })

        duree_limite = attrs.get('duree_limite_minutes')
        if duree_limite is not None and duree_limite < 0:
            raise serializers.ValidationError({
                'duree_limite_minutes': "La durée limite ne peut pas être négative."
            })

        capacite_max = attrs.get('capacite_max')
        if capacite_max is not None and capacite_max < 1:
            raise serializers.ValidationError({
                'capacite_max': "La capacité maximale doit être au moins 1."
            })

        return attrs


class AdminCreneauxUpdateSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for updating creneaux (all fields optional for PATCH)."""

    places_restantes = serializers.ReadOnlyField()
    taux_occupation = serializers.ReadOnlyField()
    est_disponible = serializers.SerializerMethodField()
    est_delai_depasse = serializers.SerializerMethodField()
    est_passe = serializers.SerializerMethodField()

    class Meta:
        model = Creneaux
        fields = [
            'id', 'date', 'heure_debut', 'heure_fin',
            'duree_limite_minutes', 'capacite_max', 'reservations_actuelles',
            'actif', 'places_restantes', 'taux_occupation',
            'est_disponible', 'est_delai_depasse', 'est_passe',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'date': {'required': False},
            'heure_debut': {'required': False},
            'heure_fin': {'required': False},
            'duree_limite_minutes': {'required': False},
            'capacite_max': {'required': False},
            'reservations_actuelles': {'required': False},
        }

    def get_est_disponible(self, obj):
        """Retourne si le créneau est disponible."""
        return obj.est_disponible()

    def get_est_delai_depasse(self, obj):
        """Retourne si le délai est dépassé."""
        return obj.est_delai_depasse()

    def get_est_passe(self, obj):
        """Retourne si le créneau est passé."""
        return obj.est_passe()

    def validate(self, attrs):
        """Validate creneaux data with existing instance values."""
        instance = self.instance

        # Utiliser les valeurs existantes si non fournies
        heure_debut = attrs.get('heure_debut', instance.heure_debut if instance else None)
        heure_fin = attrs.get('heure_fin', instance.heure_fin if instance else None)

        if heure_fin and heure_debut and heure_fin <= heure_debut:
            raise serializers.ValidationError({
                'heure_fin': "L'heure de fin doit être après l'heure de début."
            })

        duree_limite = attrs.get('duree_limite_minutes')
        if duree_limite is not None and duree_limite < 0:
            raise serializers.ValidationError({
                'duree_limite_minutes': "La durée limite ne peut pas être négative."
            })

        capacite_max = attrs.get('capacite_max', instance.capacite_max if instance else None)
        if capacite_max is not None and capacite_max < 1:
            raise serializers.ValidationError({
                'capacite_max': "La capacité maximale doit être au moins 1."
            })

        reservations_actuelles = attrs.get('reservations_actuelles', instance.reservations_actuelles if instance else 0)
        if reservations_actuelles < 0:
            raise serializers.ValidationError({
                'reservations_actuelles': "Le nombre de réservations actuelles ne peut pas être négatif."
            })

        if capacite_max and reservations_actuelles > capacite_max:
            raise serializers.ValidationError({
                'reservations_actuelles': f"Le nombre de réservations actuelles ({reservations_actuelles}) dépasse la capacité maximale ({capacite_max})."
            })

        return attrs


class AdminCreneauxConfigSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for admin creneaux configuration management."""

    class Meta:
        model = CreneauxConfig
        fields = ['id', 'actif', 'message_desactivation', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_representation(self, instance):
        """Exclure message_desactivation si actif=True."""
        data = super().to_representation(instance)
        if instance.actif:
            data.pop('message_desactivation', None)
        return data
