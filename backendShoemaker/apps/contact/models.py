import uuid
from django.db import models
from django.core.exceptions import ValidationError


class ContactInfo(models.Model):
    """
    Informations de contact de l'entreprise.
    Il ne peut y avoir qu'une seule instance de ce modèle (singleton).
    """
    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        verbose_name="UUID"
    )
    adresse = models.CharField(max_length=255, verbose_name="Adresse")
    ville = models.CharField(max_length=100, verbose_name="Ville")
    pays = models.CharField(max_length=100, verbose_name="Pays", default="France")

    # Liste des téléphones: ["+33 1 23 45 67 89", "+33 6 12 34 56 78"]
    telephones = models.JSONField(
        verbose_name="Téléphones",
        default=list,
        help_text="Liste des numéros de téléphone"
    )

    # Liste des emails: ["contact@example.com", "info@example.com"]
    emails = models.JSONField(
        verbose_name="Emails",
        default=list,
        help_text="Liste des adresses email"
    )

    # Liste des emails qui recevront les formulaires de contact
    emails_destinataires_contact = models.JSONField(
        verbose_name="Emails destinataires des formulaires de contact",
        default=list,
        help_text="Liste des adresses email qui recevront les notifications de formulaire de contact"
    )

    # Horaires d'ouverture
    # Format: {"Lun - Ven": "9h00 - 18h00", "Sam": "10h00 - 16h00", "Dim": "Fermé"}
    horaires = models.JSONField(
        verbose_name="Horaires d'ouverture",
        default=dict,
        help_text="Horaires d'ouverture par jour ou période"
    )

    url_site = models.URLField(verbose_name="URL du site web", max_length=500, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'contact_info'
        verbose_name = 'Information de Contact'
        verbose_name_plural = 'Informations de Contact'

    def save(self, *args, **kwargs):
        """S'assurer qu'il n'y a qu'une seule instance."""
        if not self.pk and ContactInfo.objects.exists():
            raise ValidationError('Il ne peut y avoir qu\'une seule instance de ContactInfo.')
        return super().save(*args, **kwargs)

    @classmethod
    def get_instance(cls):
        """Récupérer l'instance unique ou en créer une nouvelle."""
        instance, created = cls.objects.get_or_create(pk=1)
        return instance

    def __str__(self):
        return f"Coordonnées - {self.adresse}, {self.ville}"


class Contact(models.Model):
    id = models.AutoField(primary_key=True)
    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        verbose_name="UUID"
    )
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    sujet = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'contacts'
        verbose_name = 'Contact'
        verbose_name_plural = 'Contacts'
        ordering = ['-created_at']

    def __str__(self):
        return f"Contact from {self.name} <{self.email}>"