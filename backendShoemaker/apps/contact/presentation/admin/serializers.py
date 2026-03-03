"""
DRF Serializers for Contact Admin API.
"""
from rest_framework import serializers
from ...models import Contact, ContactInfo


class AdminContactSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for Contact model (Admin view)."""
    class Meta:
        model = Contact
        fields = [
            'id', 'name', 'email', 'phone', 'sujet', 'message',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AdminContactInfoSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for ContactInfo model (Admin view)."""
    class Meta:
        model = ContactInfo
        fields = [
            'id', 'adresse', 'ville', 'pays',
            'telephones', 'emails',
            'horaires', 'url_site',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
