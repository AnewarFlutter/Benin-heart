"""
Serializers for admin endpoints
"""
from rest_framework import serializers
from ...models import Like


class AdminLikeSerializer(serializers.ModelSerializer):
    """Serializer for admin like management."""

    class Meta:
        model = Like
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class AdminLikeListSerializer(serializers.ModelSerializer):
    """Serializer for listing likes (admin)."""

    class Meta:
        model = Like
        fields = ['id', 'nom', 'created_at']
