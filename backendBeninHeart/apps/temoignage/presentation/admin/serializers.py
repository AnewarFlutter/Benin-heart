"""
DRF Serializers for Temoignage Admin API.
"""
from rest_framework import serializers
from ...models import Temoignage


class AdminTemoignageSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """
    Serializer for Temoignage model (Admin - Full CRUD).
    Permet aux administrateurs de gérer les témoignages.
    """
    name = serializers.CharField(
        max_length=255,
        help_text="Nom complet du client (ex: 'Marie Diallo')"
    )
    profession = serializers.CharField(
        max_length=255,
        required=False,
        allow_blank=True,
        help_text="Profession ou titre du client (ex: 'Chef d'entreprise', 'Étudiant')"
    )
    description = serializers.CharField(
        help_text="Contenu du témoignage - Retour d'expérience du client sur nos services"
    )
    photo = serializers.ImageField(
        required=False,
        allow_null=True,
        help_text="Photo du client (optionnel) - Format d'upload multipart/form-data"
    )

    class Meta:
        model = Temoignage
        fields = [
            'id', 'name', 'profession', 'description', 'photo',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
