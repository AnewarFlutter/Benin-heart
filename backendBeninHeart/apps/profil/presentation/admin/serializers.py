"""
Serializers for admin profil endpoints.
"""
from rest_framework import serializers
from ...models import Profil, PhotoProfil


class AdminProfilListSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    age = serializers.IntegerField(read_only=True)

    class Meta:
        model = Profil
        fields = [
            'id', 'uuid', 'prenom', 'user_email', 'age', 'genre',
            'ville', 'statut', 'est_verifie', 'est_en_ligne', 'created_at',
        ]
        read_only_fields = fields


class AdminProfilSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    age = serializers.IntegerField(read_only=True)

    class Meta:
        model = Profil
        fields = [
            'id', 'uuid', 'user', 'user_email', 'prenom', 'date_naissance', 'age',
            'genre', 'recherche', 'bio', 'ville', 'pays', 'latitude', 'longitude',
            'age_min', 'age_max', 'distance_max',
            'photo_principale', 'video_presentation',
            'statut', 'est_verifie', 'est_en_ligne', 'derniere_activite',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'uuid', 'user', 'user_email', 'age', 'created_at', 'updated_at']
