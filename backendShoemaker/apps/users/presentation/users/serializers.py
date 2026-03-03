"""
DRF Serializers for Users API.
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from ...models import User, DeliveryPerson


class UserSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for User model."""

    full_name = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'phone', 'role', 'date_of_birth', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RegisterSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for user registration (generic - not used directly)."""

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

    def validate_phone(self, value):
        """Validate phone is provided and unique."""
        if not value:
            raise serializers.ValidationError("Phone number is required")

        # Check if phone already exists
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("This phone number is already registered")

        return value

    def create(self, validated_data):
        """Create user with hashed password (not verified yet)."""
        password = validated_data.pop('password')

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

        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.is_active = False  # User must verify OTP first
        user.save()
        return user


class ClientRegisterSerializer(RegisterSerializer):
    """
    Serializer for CLIENT registration.
    Le rôle CLIENT est automatiquement assigné lors de l'inscription.
    """
    email = serializers.EmailField(help_text="Adresse email unique de l'utilisateur (ex: user@example.com)")
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
        help_text="Mot de passe (minimum 8 caractères)"
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text="Confirmation du mot de passe (doit être identique au mot de passe)"
    )
    first_name = serializers.CharField(
        max_length=150,
        help_text="Prénom de l'utilisateur"
    )
    last_name = serializers.CharField(
        max_length=150,
        help_text="Nom de famille de l'utilisateur"
    )
    phone = serializers.CharField(
        max_length=20,
        help_text="Numéro de téléphone unique (format: +221 XX XXX XXXX)"
    )

    class Meta(RegisterSerializer.Meta):
        fields = ['id', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone']


class DeliveryRegisterSerializer(RegisterSerializer):
    """
    Serializer for DELIVERY registration.
    Le rôle DELIVERY est automatiquement assigné lors de l'inscription.
    """
    email = serializers.EmailField(help_text="Adresse email unique du livreur (ex: livreur@example.com)")
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
        help_text="Mot de passe (minimum 8 caractères)"
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text="Confirmation du mot de passe (doit être identique au mot de passe)"
    )
    first_name = serializers.CharField(
        max_length=150,
        help_text="Prénom du livreur"
    )
    last_name = serializers.CharField(
        max_length=150,
        help_text="Nom de famille du livreur"
    )
    phone = serializers.CharField(
        max_length=20,
        help_text="Numéro de téléphone unique (format: +221 XX XXX XXXX)"
    )

    class Meta(RegisterSerializer.Meta):
        fields = ['id', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone']


class VerifyOTPSerializer(serializers.Serializer):
    """
    Serializer for OTP verification.
    Permet de vérifier le code OTP envoyé par email lors de l'inscription.
    """
    email = serializers.EmailField(
        help_text="Adresse email de l'utilisateur qui a reçu le code OTP"
    )
    otp_code = serializers.CharField(
        max_length=6,
        min_length=6,
        help_text="Code OTP à 6 chiffres reçu par email (ex: 123456)"
    )


class ResendOTPSerializer(serializers.Serializer):
    """Serializer for resending OTP."""

    email = serializers.EmailField()


class ForgotPasswordSerializer(serializers.Serializer):
    """Serializer for forgot password request."""

    identifier = serializers.CharField(help_text="Email or phone number")


class VerifyOTPForgotPasswordSerializer(serializers.Serializer):
    """Serializer for verifying OTP for forgot password."""

    email = serializers.EmailField()
    otp_code = serializers.CharField(max_length=6, min_length=6)


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer for resetting password after OTP verification."""

    email = serializers.EmailField()
    new_password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    new_password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, attrs):
        """Validate passwords match."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password": "Passwords do not match"})
        attrs.pop('new_password_confirm')
        return attrs


class UpdateUserSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for updating user profile."""

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'phone', 'date_of_birth']


class UpdateNameSerializer(serializers.Serializer):
    """Serializer for updating user name."""

    first_name = serializers.CharField(max_length=150, required=False)
    last_name = serializers.CharField(max_length=150, required=False)

    def validate(self, attrs):
        if not attrs.get('first_name') and not attrs.get('last_name'):
            raise serializers.ValidationError("At least one field (first_name or last_name) is required")
        return attrs


class UpdateUsernameSerializer(serializers.Serializer):
    """Serializer for updating username."""

    username = serializers.CharField(max_length=150)

    def validate_username(self, value):
        # Check if username already exists
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken")
        return value


class UpdateDateOfBirthSerializer(serializers.Serializer):
    """Serializer for updating date of birth."""

    date_of_birth = serializers.DateField()

    def validate_date_of_birth(self, value):
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError("Date of birth cannot be in the future")
        return value


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
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for DeliveryPerson model."""

    user = UserSerializer(read_only=True)

    class Meta:
        model = DeliveryPerson
        fields = [
            'id', 'user', 'vehicle_type', 'license_number', 'is_available',
            'current_location_lat', 'current_location_lon',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CreateDeliveryPersonSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(source='uuid', read_only=True)
    """Serializer for creating delivery person profile."""

    class Meta:
        model = DeliveryPerson
        fields = ['id', 'vehicle_type', 'license_number']


class UpdateLocationSerializer(serializers.Serializer):
    """Serializer for updating delivery person location."""

    latitude = serializers.FloatField(min_value=-90, max_value=90)
    longitude = serializers.FloatField(min_value=-180, max_value=180)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer to allow login with email OR phone.
    Includes context (role) verification for security.
    """
    username_field = 'identifier'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['identifier'] = serializers.CharField(
            help_text="Email ou numéro de téléphone de l'utilisateur (ex: user@example.com ou +221773831255)"
        )
        self.fields['password'] = serializers.CharField(
            write_only=True,
            style={'input_type': 'password'},
            help_text="Mot de passe de l'utilisateur"
        )
        self.fields['context'] = serializers.ChoiceField(
            choices=['CLIENT', 'DELIVERY', 'ADMIN', 'SUPERADMIN'],
            required=True,
            help_text="Contexte de connexion - Rôle de l'utilisateur. Choix possibles: CLIENT (client), DELIVERY (livreur), ADMIN (administrateur), SUPERADMIN (super administrateur)"
        )
        self.fields.pop('username', None)

    def validate(self, attrs):
        identifier = attrs.get('identifier')
        password = attrs.get('password')
        context = attrs.get('context')

        if not identifier or not password:
            raise serializers.ValidationError('Must include "identifier" and "password".')

        if not context:
            raise serializers.ValidationError('Must include "context" (role).')

        # Try to find user by email or phone
        user = None
        try:
            # First try email
            if '@' in identifier:
                user = User.objects.get(email=identifier)
            else:
                # Try phone
                user = User.objects.get(phone=identifier)
        except User.DoesNotExist:
            raise serializers.ValidationError('Mot de passe ou email incorrect')

        # Check password
        if not user.check_password(password):
            raise serializers.ValidationError('Mot de passe ou email incorrect')

        # ✅ Verify role matches context (ADMIN/SUPERADMIN can access any context)
        if not (user.has_role(context) or user.has_any_role(['ADMIN', 'SUPERADMIN'])):
            raise serializers.ValidationError(
                f'Vous n\'êtes pas autorisé à vous connecter en tant que {context}. '
                f'Veuillez utiliser l\'interface de connexion appropriée pour votre rôle.'
            )

        # Check if user is verified
        if not user.is_verified:
            raise serializers.ValidationError('Compte non vérifié. Veuillez vérifier votre email avec le code OTP.')

        # Check if user is blocked
        if user.is_blocked:
            raise serializers.ValidationError('Votre compte a été bloqué. Veuillez contacter l\'administrateur pour plus d\'informations.')

        # Check if user is active
        if not user.is_active:
            raise serializers.ValidationError('Compte désactivé. Veuillez contacter l\'administrateur.')

        # Generate tokens
        refresh = self.get_token(user)

        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': str(user.uuid),
                'email': user.email,
                'phone': user.phone,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
            }
        }

        return data


class LogoutSerializer(serializers.Serializer):
    """
    Serializer for logout request.
    Requires refresh_token to blacklist both access and refresh tokens.
    """
    refresh_token = serializers.CharField(required=True, help_text="Refresh token to blacklist")
