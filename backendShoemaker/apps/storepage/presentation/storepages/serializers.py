"""
Serializers for client endpoints (public)
"""
from rest_framework import serializers
from ...models import HeroBanner


class HeroBannerSerializer(serializers.ModelSerializer):
    """Serializer pour les bannières Hero (public)."""
    image = serializers.SerializerMethodField()

    class Meta:
        model = HeroBanner
        fields = [
            'id',
            'titre',
            'description',
            'image',
            'bouton_texte',
            'bouton_lien',
            'ordre'
        ]
        read_only_fields = fields

    def get_image(self, obj):
        """Retourne l'URL complète de l'image."""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None
