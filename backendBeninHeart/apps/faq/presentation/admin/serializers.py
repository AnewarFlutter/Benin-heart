"""
DRF Serializers for FAQ Admin API.
"""
from rest_framework import serializers
from ...models import FAQ


class AdminFaqSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """
    Serializer for FAQ model (Admin - Full CRUD).
    Permet aux administrateurs de créer, modifier et supprimer des FAQ.
    """
    question = serializers.CharField(
        max_length=500,
        help_text="Question fréquemment posée (ex: 'Quels sont vos délais de livraison ?')"
    )
    answer = serializers.CharField(
        help_text="Réponse complète et détaillée à la question"
    )

    class Meta:
        model = FAQ
        fields = [
            'id', 'question', 'answer', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
