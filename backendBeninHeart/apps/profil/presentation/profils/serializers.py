"""
Serializers for client profil endpoints.
"""
from rest_framework import serializers
from ...models import Profil, PhotoProfil


class PhotoProfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhotoProfil
        fields = ['uuid', 'image', 'ordre', 'est_principale']
        read_only_fields = ['uuid']


class ProfilPublicSerializer(serializers.ModelSerializer):
    """Profil vu par les autres membres (swipe, suggestion)."""
    photos = PhotoProfilSerializer(many=True, read_only=True)
    age = serializers.IntegerField(read_only=True)

    class Meta:
        model = Profil
        fields = [
            'uuid', 'prenom', 'age', 'genre', 'ville', 'pays',
            'bio', 'photo_principale', 'photos', 'est_verifie', 'est_en_ligne',
        ]
        read_only_fields = fields


class MonProfilSerializer(serializers.ModelSerializer):
    """Profil complet de l'utilisateur connecté."""
    photos = PhotoProfilSerializer(many=True, read_only=True)
    age = serializers.IntegerField(read_only=True)

    class Meta:
        model = Profil
        fields = [
            'uuid', 'prenom', 'date_naissance', 'age', 'genre', 'recherche',
            'bio', 'ville', 'pays', 'latitude', 'longitude',
            'age_min', 'age_max', 'distance_max',
            'photo_principale', 'video_presentation',
            'photos', 'est_verifie', 'est_en_ligne', 'derniere_activite',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'uuid', 'age', 'est_verifie', 'est_en_ligne',
            'derniere_activite', 'created_at', 'updated_at',
        ]


class CreerProfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profil
        fields = [
            'prenom', 'date_naissance', 'genre', 'recherche',
            'bio', 'ville', 'pays', 'latitude', 'longitude',
            'age_min', 'age_max', 'distance_max',
        ]

    def validate_date_naissance(self, value):
        from datetime import date
        today = date.today()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise serializers.ValidationError("Vous devez avoir au moins 18 ans.")
        return value


class UploadPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhotoProfil
        fields = ['image', 'ordre', 'est_principale']

    def validate(self, attrs):
        profil = self.context['profil']
        if profil.photos.count() >= 6:
            raise serializers.ValidationError("Vous ne pouvez pas avoir plus de 6 photos.")
        return attrs
