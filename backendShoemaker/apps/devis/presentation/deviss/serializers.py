"""
Serializers for client endpoints (public)
"""
from rest_framework import serializers
from ...models import Devis


class ClientDevisSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for client devis viewing (public)."""

    class Meta:
        model = Devis
        fields = ['id', 'nom']
        read_only_fields = fields
