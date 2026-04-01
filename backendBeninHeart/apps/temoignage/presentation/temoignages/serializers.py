"""
Serializers for client endpoints (public)
"""
from rest_framework import serializers
from ...models import Temoignage


class ClientTemoignageSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for client temoignage viewing (public)."""

    class Meta:
        model = Temoignage
        fields = ['id', 'nom']
        read_only_fields = fields
