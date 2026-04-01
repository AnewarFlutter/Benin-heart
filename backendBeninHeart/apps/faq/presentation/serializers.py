"""
DRF Serializers for Services API.
"""
from rest_framework import serializers
from ..models import FAQ


class FaqSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for FAQ model."""

    class Meta:
        model = FAQ
        fields = [
            'id', 'question', 'answer', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
