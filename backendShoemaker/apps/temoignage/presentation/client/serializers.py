"""
DRF Serializers for Temoignage Client API.
"""
from rest_framework import serializers
from ...models import Temoignage


class ClientTemoignageSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """
    Serializer for Temoignage model (Client - Read Only).
    Affiche les témoignages publiés sur le site.
    """
    name = serializers.CharField(
        help_text="Nom du client"
    )
    profession = serializers.CharField(
        help_text="Profession du client"
    )
    description = serializers.CharField(
        help_text="Contenu du témoignage"
    )
    photo = serializers.ImageField(
        help_text="Photo du client"
    )

    class Meta:
        model = Temoignage
        fields = [
            'id', 'name', 'profession', 'description', 'photo', 'created_at'
        ]
        read_only_fields = fields
