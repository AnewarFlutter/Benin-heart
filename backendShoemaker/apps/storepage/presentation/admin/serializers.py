"""
Serializers for admin endpoints
"""
from rest_framework import serializers
from ...models import Storepage


class AdminStorepageSerializer(serializers.ModelSerializer):
    """Serializer for admin storepage management."""

    class Meta:
        model = Storepage
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class AdminStorepageListSerializer(serializers.ModelSerializer):
    """Serializer for listing storepages (admin)."""

    class Meta:
        model = Storepage
        fields = ['id', 'nom', 'created_at']
