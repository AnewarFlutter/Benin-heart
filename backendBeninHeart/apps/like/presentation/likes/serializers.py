"""
Serializers for client like endpoints.
"""
from rest_framework import serializers
from ...models import Like, Match
from apps.profil.presentation.profils.serializers import ProfilPublicSerializer


class ActionLikeSerializer(serializers.Serializer):
    """POST body pour liker/disliker un profil."""
    profil_uuid = serializers.UUIDField()
    type_action = serializers.ChoiceField(choices=['LIKE', 'SUPERLIKE', 'DISLIKE'])


class LikeReçuSerializer(serializers.ModelSerializer):
    """Un like reçu, avec le profil de l'expéditeur (version simplifiée)."""
    expediteur_prenom = serializers.SerializerMethodField()
    expediteur_photo = serializers.SerializerMethodField()
    expediteur_uuid = serializers.SerializerMethodField()

    class Meta:
        model = Like
        fields = ['uuid', 'type_action', 'expediteur_uuid', 'expediteur_prenom', 'expediteur_photo', 'created_at']
        read_only_fields = fields

    def get_expediteur_uuid(self, obj):
        try:
            return str(obj.expediteur.profil.uuid)
        except Exception:
            return None

    def get_expediteur_prenom(self, obj):
        try:
            return obj.expediteur.profil.prenom
        except Exception:
            return obj.expediteur.first_name

    def get_expediteur_photo(self, obj):
        try:
            if obj.expediteur.profil.photo_principale:
                return obj.expediteur.profil.photo_principale.url
        except Exception:
            pass
        return None


class MatchSerializer(serializers.ModelSerializer):
    """Un match avec les infos de l'autre personne."""
    avec_prenom = serializers.SerializerMethodField()
    avec_uuid = serializers.SerializerMethodField()
    avec_photo = serializers.SerializerMethodField()
    avec_est_en_ligne = serializers.SerializerMethodField()

    class Meta:
        model = Match
        fields = ['uuid', 'avec_uuid', 'avec_prenom', 'avec_photo', 'avec_est_en_ligne', 'est_actif', 'created_at']
        read_only_fields = fields

    def _autre_user(self, obj):
        request_user = self.context.get('request').user if self.context.get('request') else None
        if not request_user:
            return obj.user2
        return obj.user2 if obj.user1 == request_user else obj.user1

    def get_avec_uuid(self, obj):
        try:
            return str(self._autre_user(obj).profil.uuid)
        except Exception:
            return None

    def get_avec_prenom(self, obj):
        try:
            return self._autre_user(obj).profil.prenom
        except Exception:
            return self._autre_user(obj).first_name

    def get_avec_photo(self, obj):
        try:
            photo = self._autre_user(obj).profil.photo_principale
            if photo:
                return photo.url
        except Exception:
            pass
        return None

    def get_avec_est_en_ligne(self, obj):
        try:
            return self._autre_user(obj).profil.est_en_ligne
        except Exception:
            return False


class StatsLikesSerializer(serializers.Serializer):
    total_likes_reçus = serializers.IntegerField()
    total_superlikes_reçus = serializers.IntegerField()
    total_matchs = serializers.IntegerField()
    total_likes_envoyés = serializers.IntegerField()
