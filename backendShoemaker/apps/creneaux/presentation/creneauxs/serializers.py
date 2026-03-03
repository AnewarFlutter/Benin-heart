"""
Serializers for client endpoints (public)
"""
from rest_framework import serializers
from ...models import Creneaux, CreneauxConfig


class ClientCreneauxSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for client creneaux viewing (public) - read only."""

    places_restantes = serializers.ReadOnlyField()
    est_disponible = serializers.SerializerMethodField()

    class Meta:
        model = Creneaux
        fields = [
            'id', 'date', 'heure_debut', 'heure_fin',
            'places_restantes', 'est_disponible'
        ]
        read_only_fields = fields

    def get_est_disponible(self, obj):
        """Retourne si le créneau est disponible."""
        return obj.est_disponible()


class CreneauxConfigSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for creneaux configuration (public, read-only)."""

    class Meta:
        model = CreneauxConfig
        fields = ['id', 'actif', 'message_desactivation']
        read_only_fields = fields

    def to_representation(self, instance):
        """Exclure message_desactivation si actif=True."""
        data = super().to_representation(instance)
        if instance.actif:
            data.pop('message_desactivation', None)
        return data
