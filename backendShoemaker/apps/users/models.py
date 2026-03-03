"""
Django ORM models for Users app.
This is the infrastructure layer - implements persistence.
"""
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from core.base_models import TimeStampedModel


class Role(models.Model):
    """
    Role model for user roles (CLIENT, DELIVERY, ADMIN, SUPERADMIN).
    Permet à un utilisateur d'avoir plusieurs rôles.
    """
    ROLE_CHOICES = [
        ('CLIENT', 'Client'),
        ('DELIVERY', 'Delivery Person'),
        ('ADMIN', 'Administrator'),
        ('SUPERADMIN', 'Super Administrator'),
    ]

    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        verbose_name="UUID"
    )
    name = models.CharField(max_length=20, choices=ROLE_CHOICES, unique=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'roles'
        verbose_name = 'Role'
        verbose_name_plural = 'Rôles'
        ordering = ['name']

    def __str__(self):
        return self.get_name_display()


class User(AbstractUser, TimeStampedModel):
    """
    Custom User model extending Django's AbstractUser.
    Supporte plusieurs rôles via une relation ManyToMany.
    """
    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        verbose_name="UUID"
    )
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True, unique=True)
    roles = models.ManyToManyField(Role, related_name='users', blank=True)
    date_of_birth = models.DateField(blank=True, null=True)

    # OTP and verification fields
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    # Account status fields
    is_active = models.BooleanField(
        default=True,
        help_text="Indique si l'utilisateur peut se connecter. Décochez pour désactiver le compte sans le supprimer."
    )
    is_blocked = models.BooleanField(default=False, help_text="Compte bloqu\u00e9 temporairement")

    # Soft delete fields
    is_deleted = models.BooleanField(default=False, help_text="Suppression logique du compte")
    deleted_at = models.DateTimeField(blank=True, null=True, help_text="Date de suppression")

    # Email notification preferences (pour ADMIN et SUPERADMIN uniquement)
    recevoir_emails_notifications = models.BooleanField(
        default=True,
        help_text="Recevoir les emails de notifications système (commandes, collectes, livraisons, etc.)"
    )
    recevoir_emails_contact = models.BooleanField(
        default=True,
        help_text="Recevoir les emails provenant du formulaire de contact"
    )

    # Override username to use email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        db_table = 'users'
        verbose_name = 'Utilisateur'
        verbose_name_plural = 'Utilisateurs'
        ordering = ['-created_at']

    def __str__(self):
        roles_str = ", ".join([role.get_name_display() for role in self.roles.all()])
        return f"{self.email} ({roles_str if roles_str else 'No roles'})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    def has_role(self, role_name):
        """
        Vérifie si l'utilisateur possède un rôle spécifique.

        Args:
            role_name (str): Nom du rôle (CLIENT, DELIVERY, ADMIN, SUPERADMIN)

        Returns:
            bool: True si l'utilisateur a ce rôle
        """
        return self.roles.filter(name=role_name).exists()

    def has_any_role(self, role_names):
        """
        Vérifie si l'utilisateur possède au moins un des rôles spécifiés.

        Args:
            role_names (list): Liste des noms de rôles

        Returns:
            bool: True si l'utilisateur a au moins un de ces rôles
        """
        return self.roles.filter(name__in=role_names).exists()

    def add_role(self, role_name):
        """
        Ajoute un rôle à l'utilisateur.

        Args:
            role_name (str): Nom du rôle à ajouter
        """
        role, _ = Role.objects.get_or_create(name=role_name)
        self.roles.add(role)

    def remove_role(self, role_name):
        """
        Retire un rôle de l'utilisateur.

        Args:
            role_name (str): Nom du rôle à retirer
        """
        try:
            role = Role.objects.get(name=role_name)
            self.roles.remove(role)
        except Role.DoesNotExist:
            pass

    def get_roles_list(self):
        """
        Retourne la liste des noms de rôles de l'utilisateur.

        Returns:
            list: Liste des noms de rôles
        """
        return list(self.roles.values_list('name', flat=True))

    @property
    def role(self):
        """
        Propriété de compatibilité pour obtenir le premier rôle.
        Utilisé pour la compatibilité avec l'ancien code.

        Returns:
            str: Nom du premier rôle ou None
        """
        first_role = self.roles.first()
        return first_role.name if first_role else None


class DeliveryPerson(TimeStampedModel):
    """
    Delivery person profile with additional information.
    """
    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        verbose_name="UUID"
    )
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='delivery_profile'
    )

    is_available = models.BooleanField(default=True)
    current_location_lat = models.FloatField(null=True, blank=True)
    current_location_lon = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = 'delivery_persons'
        verbose_name = 'Livreur'
        verbose_name_plural = 'Livreurs'

    def __str__(self):
        return f"{self.user.full_name} - Livreur"
