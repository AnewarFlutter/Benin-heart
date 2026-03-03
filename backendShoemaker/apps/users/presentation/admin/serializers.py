"""
DRF Serializers for Admin API.
"""
from rest_framework import serializers
from ...models import User, DeliveryPerson, Role


class UserSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for User model - Admin version with all fields."""

    full_name = serializers.ReadOnlyField()
    roles = serializers.SerializerMethodField()
    delivery_person_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'phone', 'roles', 'delivery_person_id', 'is_active', 'is_verified', 'is_staff', 'is_superuser',
            'is_blocked', 'is_deleted', 'deleted_at',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'deleted_at']

    def get_roles(self, obj):
        """Retourne la liste des noms de rôles de l'utilisateur."""
        return obj.get_roles_list()

    def get_delivery_person_id(self, obj):
        """Retourne le delivery_person_id si l'utilisateur a le rôle DELIVERY (même avec plusieurs rôles)."""
        if obj.has_role('DELIVERY') and hasattr(obj, 'delivery_profile') and obj.delivery_profile:
            return str(obj.delivery_profile.uuid)
        return None


class UserListSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for listing users (lighter version)."""

    full_name = serializers.ReadOnlyField()
    roles = serializers.SerializerMethodField()
    delivery_person_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'roles', 'delivery_person_id', 'is_active', 'is_verified', 'is_blocked',
            'is_deleted', 'created_at'
        ]

    def get_roles(self, obj):
        """Retourne la liste des noms de rôles de l'utilisateur."""
        return obj.get_roles_list()

    def get_delivery_person_id(self, obj):
        """Retourne le delivery_person_id si l'utilisateur a le rôle DELIVERY (même avec plusieurs rôles)."""
        if obj.has_role('DELIVERY') and hasattr(obj, 'delivery_profile') and obj.delivery_profile:
            return str(obj.delivery_profile.uuid)
        return None


class ManageRolesSerializer(serializers.Serializer):
    """Serializer for adding/removing roles."""

    roles = serializers.MultipleChoiceField(
        choices=Role.ROLE_CHOICES,
        help_text="Liste des r\u00f4les \u00e0 ajouter ou retirer"
    )
    action = serializers.ChoiceField(
        choices=['add', 'remove', 'set'],
        help_text="Action: 'add' (ajouter), 'remove' (retirer), 'set' (d\u00e9finir exactement)"
    )

    def validate_roles(self, value):
        """Validate that roles list is not empty."""
        if not value:
            raise serializers.ValidationError("Au moins un r\u00f4le doit \u00eatre sp\u00e9cifi\u00e9.")
        return value


class BlockUnblockUserSerializer(serializers.Serializer):
    """Serializer for blocking/unblocking user account."""

    is_blocked = serializers.BooleanField(
        help_text="True pour bloquer, False pour d\u00e9bloquer"
    )
    reason = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Raison du blocage (optionnel)"
    )


class ActivateDeactivateUserSerializer(serializers.Serializer):
    """Serializer for activating/deactivating user account."""

    is_active = serializers.BooleanField(
        help_text="True pour activer, False pour d\u00e9sactiver"
    )


class ValidateOTPSerializer(serializers.Serializer):
    """Serializer for admin OTP validation override."""

    is_verified = serializers.BooleanField(
        help_text="True pour valider l'OTP, False pour invalider"
    )
    clear_otp = serializers.BooleanField(
        default=True,
        help_text="Si True, efface le code OTP apr\u00e8s validation"
    )


class AdminResetPasswordSerializer(serializers.Serializer):
    """Serializer for admin password reset."""

    new_password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
        help_text="Nouveau mot de passe (minimum 8 caract\u00e8res)"
    )
    new_password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text="Confirmation du nouveau mot de passe"
    )
    send_email = serializers.BooleanField(
        default=True,
        help_text="Envoyer un email de notification \u00e0 l'utilisateur"
    )

    def validate(self, attrs):
        """Validate passwords match."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "Les mots de passe ne correspondent pas."
            })
        attrs.pop('new_password_confirm')
        return attrs


class AdminChangePasswordSerializer(serializers.Serializer):
    """Serializer for admin changing user password (with current password check)."""

    current_password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text="Mot de passe actuel de l'utilisateur"
    )
    new_password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
        help_text="Nouveau mot de passe"
    )
    new_password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text="Confirmation du nouveau mot de passe"
    )

    def validate(self, attrs):
        """Validate passwords match."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password": "Les mots de passe ne correspondent pas."
            })
        attrs.pop('new_password_confirm')
        return attrs


class RolesField(serializers.ListField):
    """Custom field to handle roles as a list for both reading and writing."""

    def __init__(self, **kwargs):
        super().__init__(
            child=serializers.ChoiceField(choices=[choice[0] for choice in Role.ROLE_CHOICES]),
            **kwargs
        )

    def to_representation(self, value):
        """Convert ManyRelatedManager to list of role names."""
        if hasattr(value, 'all'):
            return list(value.values_list('name', flat=True))
        return value

    def to_internal_value(self, data):
        """Validate the input list."""
        return super().to_internal_value(data)


class AdminCreateUserSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for creating users via admin panel."""

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
        help_text="Mot de passe (minimum 8 caractères)"
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text="Confirmation du mot de passe"
    )
    roles = RolesField(
        required=False,
        help_text="Liste des rôles à assigner (CLIENT, DELIVERY, ADMIN, SUPERADMIN)"
    )

    class Meta:
        model = User
        fields = [
            'id', 'email', 'password', 'password_confirm', 'first_name', 'last_name',
            'phone', 'roles', 'is_active', 'is_verified', 'date_of_birth'
        ]

    def validate(self, attrs):
        """Validate passwords match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas"})
        attrs.pop('password_confirm')
        return attrs

    def create(self, validated_data):
        """Create user with hashed password and roles."""
        password = validated_data.pop('password')
        roles_data = validated_data.pop('roles', [])

        # Generate unique username from email
        email = validated_data.get('email')
        username = email.split('@')[0]  # Ex: john@example.com -> john

        # Ensure username is unique
        original_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{original_username}{counter}"
            counter += 1

        validated_data['username'] = username

        # Create user
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()

        # Add roles
        if roles_data:
            for role_name in roles_data:
                user.add_role(role_name)
        else:
            # Default role if none specified
            user.add_role('CLIENT')

        # Create DeliveryPerson profile automatically if DELIVERY role is assigned
        if 'DELIVERY' in roles_data:
            # Vérifier si le profil n'existe pas déjà
            if not hasattr(user, 'delivery_profile'):
                DeliveryPerson.objects.create(
                    user=user,
                    is_available=True  # Par défaut, le livreur est disponible
                )

        return user


class RegisterSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for user registration (deprecated - use AdminCreateUserSerializer)."""

    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['id', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone']

    def validate(self, attrs):
        """Validate passwords match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        attrs.pop('password_confirm')
        return attrs

    def create(self, validated_data):
        """Create user with hashed password."""
        password = validated_data.pop('password')

        # Generate unique username from email
        email = validated_data.get('email')
        username = email.split('@')[0]
        original_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{original_username}{counter}"
            counter += 1
        validated_data['username'] = username

        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class AdminUpdateUserSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for updating basic user information via admin panel.

    Note: Pour modifier les rôles, le statut actif, la vérification ou le blocage,
    utilisez les endpoints dédiés:
    - Rôles: POST /api/admin/users/{id}/manage_roles/
    - Actif/Inactif: POST /api/admin/users/{id}/activate_deactivate/
    - Vérifié: POST /api/admin/users/{id}/validate_otp/
    - Bloqué: POST /api/admin/users/{id}/block_unblock/
    """

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone', 'date_of_birth'
        ]
        extra_kwargs = {
            'email': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
            'phone': {'required': False},
        }


class UpdateUserSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for updating user profile (deprecated - use AdminUpdateUserSerializer)."""

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'phone']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password."""

    old_password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    new_password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        """Validate passwords."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Passwords do not match"})
        attrs.pop('new_password_confirm')
        return attrs


class DeliveryPersonSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='user.uuid', read_only=True)
    """Serializer for DeliveryPerson model."""

    # Flatten user fields at the root level
    delivery_person_id = serializers.UUIDField(source='uuid', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    phone = serializers.CharField(source='user.phone', read_only=True)
    is_verified = serializers.BooleanField(source='user.is_verified', read_only=True)
    is_active = serializers.BooleanField(source='user.is_active', read_only=True)

    class Meta:
        model = DeliveryPerson
        fields = [
            'id', 'delivery_person_id', 'email', 'username', 'first_name', 'last_name', 'full_name', 'phone',
            'is_verified', 'is_active', 'is_available',
            'current_location_lat', 'current_location_lon',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'delivery_person_id', 'created_at', 'updated_at']


class CreateDeliveryPersonSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for creating delivery person profile."""

    class Meta:
        model = DeliveryPerson
        fields = ['id']


class UpdateLocationSerializer(serializers.Serializer):
    """Serializer for updating delivery person location."""

    latitude = serializers.FloatField(min_value=-90, max_value=90)
    longitude = serializers.FloatField(min_value=-180, max_value=180)


class AdminProfileSerializer(serializers.ModelSerializer):
    """Serializer pour afficher le profil de l'admin."""

    class Meta:
        model = User
        fields = [
            'uuid', 'email', 'phone', 'first_name', 'last_name',
            'date_of_birth', 'created_at'
        ]
        read_only_fields = ['uuid', 'email', 'phone', 'created_at']


class AdminProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour mettre à jour le profil de l'admin."""
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


class AdminSelfChangePasswordSerializer(serializers.Serializer):
    """Serializer pour changer le mot de passe de l'admin connecté."""
    from django.contrib.auth.password_validation import validate_password

    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("L'ancien mot de passe est incorrect.")
        return value

    def validate_new_password(self, value):
        from django.contrib.auth.password_validation import validate_password
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
