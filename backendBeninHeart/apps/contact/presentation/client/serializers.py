"""
DRF Serializers for Contact Client API.
"""
from rest_framework import serializers
from ...models import Contact, ContactInfo


class ClientContactInfoSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """
    Serializer for ContactInfo model (Client view - read only).
    Permet aux clients de récupérer les informations de contact de l'entreprise.
    """
    class Meta:
        model = ContactInfo
        fields = [
            'id', 'adresse', 'ville', 'pays',
            'telephones', 'emails',
            'horaires', 'url_site'
        ]


class ClientContactSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """
    Serializer for Contact model (Client view - creation only).
    Permet aux utilisateurs d'envoyer un message via le formulaire de contact.
    """
    name = serializers.CharField(
        max_length=255,
        help_text="Nom complet de l'expéditeur (ex: 'Jean Dupont')"
    )
    email = serializers.EmailField(
        help_text="Adresse email de l'expéditeur pour recevoir la réponse (ex: 'jean.dupont@example.com')"
    )
    phone = serializers.CharField(
        max_length=20,
        required=False,
        allow_blank=True,
        help_text="Numéro de téléphone de l'expéditeur (optionnel)"
    )
    sujet = serializers.CharField(
        max_length=255,
        help_text="Sujet du message (ex: 'Question sur les services', 'Demande de devis')"
    )
    message = serializers.CharField(
        help_text="Corps du message - Détaillez votre demande ou question"
    )

    class Meta:
        model = Contact
        fields = ['id', 'name', 'email', 'phone', 'sujet', 'message']
