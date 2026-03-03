"""
DRF Serializers for FAQ Client API.
"""
from rest_framework import serializers
from ...models import FAQ


class ClientFaqSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """
    Serializer for FAQ model (Client - Read Only).
    Affiche les questions fréquemment posées avec leurs réponses.
    """
    question = serializers.CharField(
        help_text="Question fréquemment posée"
    )
    answer = serializers.CharField(
        help_text="Réponse détaillée à la question"
    )

    class Meta:
        model = FAQ
        fields = [
            'id', 'question', 'answer', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'question', 'answer', 'created_at', 'updated_at']
