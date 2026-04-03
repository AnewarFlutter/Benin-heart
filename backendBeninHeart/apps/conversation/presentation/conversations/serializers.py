"""
Serializers for client conversation endpoints.
"""
from rest_framework import serializers
from ...models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    auteur_id = serializers.IntegerField(source='auteur.pk', read_only=True)
    est_mien = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['uuid', 'auteur_id', 'est_mien', 'texte', 'image', 'type_message', 'lu', 'lu_at', 'created_at']
        read_only_fields = fields

    def get_est_mien(self, obj):
        request = self.context.get('request')
        return request and obj.auteur == request.user


class EnvoyerMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['texte', 'image', 'type_message']

    def validate(self, attrs):
        if attrs.get('type_message') == 'IMAGE' and not attrs.get('image'):
            raise serializers.ValidationError("Une image est requise pour le type IMAGE.")
        if attrs.get('type_message', 'TEXTE') == 'TEXTE' and not attrs.get('texte', '').strip():
            raise serializers.ValidationError("Le texte ne peut pas être vide.")
        return attrs


class ConversationSerializer(serializers.ModelSerializer):
    """Conversation dans la liste — avec infos de l'autre participant."""
    autre_prenom = serializers.SerializerMethodField()
    autre_uuid = serializers.SerializerMethodField()
    autre_photo = serializers.SerializerMethodField()
    autre_est_en_ligne = serializers.SerializerMethodField()
    messages_non_lus = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'uuid', 'autre_uuid', 'autre_prenom', 'autre_photo', 'autre_est_en_ligne',
            'dernier_message_texte', 'dernier_message_at', 'messages_non_lus',
            'est_active', 'created_at',
        ]
        read_only_fields = fields

    def _autre(self, obj):
        request = self.context.get('request')
        return obj.autre_participant(request.user) if request else obj.participant2

    def get_autre_uuid(self, obj):
        try:
            return str(self._autre(obj).profil.uuid)
        except Exception:
            return None

    def get_autre_prenom(self, obj):
        try:
            return self._autre(obj).profil.prenom
        except Exception:
            return self._autre(obj).first_name

    def get_autre_photo(self, obj):
        try:
            photo = self._autre(obj).profil.photo_principale
            return photo.url if photo else None
        except Exception:
            return None

    def get_autre_est_en_ligne(self, obj):
        try:
            return self._autre(obj).profil.est_en_ligne
        except Exception:
            return False

    def get_messages_non_lus(self, obj):
        request = self.context.get('request')
        if not request:
            return 0
        return obj.messages.filter(lu=False).exclude(auteur=request.user).count()
