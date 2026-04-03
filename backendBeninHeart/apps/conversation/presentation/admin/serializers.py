"""
Serializers for admin endpoints
"""
from rest_framework import serializers
from ...models import Conversation


class AdminConversationSerializer(serializers.ModelSerializer):
    """Serializer for admin conversation management."""

    class Meta:
        model = Conversation
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class AdminConversationListSerializer(serializers.ModelSerializer):
    """Serializer for listing conversations (admin)."""

    class Meta:
        model = Conversation
        fields = ['id', 'nom', 'created_at']
