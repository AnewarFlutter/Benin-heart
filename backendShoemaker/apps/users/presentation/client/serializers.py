"""
Serializers for client user profile endpoints
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from apps.users.models import User


class ClientProfileSerializer(serializers.ModelSerializer):
    """Serializer pour afficher le profil du client."""

    class Meta:
        model = User
        fields = [
            'uuid', 'email', 'phone', 'first_name', 'last_name',
            'date_of_birth', 'created_at'
        ]
        read_only_fields = ['uuid', 'email', 'phone', 'created_at']


class ClientProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour mettre à jour le profil du client."""
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    date_of_birth = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'date_of_birth']

    def validate_first_name(self, value):
        if value and len(value) > 0 and len(value) < 2:
            raise serializers.ValidationError("Le prénom doit contenir au moins 2 caractères.")
        return value

    def validate_last_name(self, value):
        if value and len(value) > 0 and len(value) < 2:
            raise serializers.ValidationError("Le nom doit contenir au moins 2 caractères.")
        return value


class ClientChangePasswordSerializer(serializers.Serializer):
    """Serializer pour changer le mot de passe du client."""

    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("L'ancien mot de passe est incorrect.")
        return value

    def validate_new_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': "Les mots de passe ne correspondent pas."
            })

        if attrs['old_password'] == attrs['new_password']:
            raise serializers.ValidationError({
                'new_password': "Le nouveau mot de passe doit être différent de l'ancien."
            })

        return attrs
