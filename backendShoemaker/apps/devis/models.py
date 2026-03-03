"""
Modèles pour les devis.
"""
from django.db import models
from django.conf import settings
from core.base_models import TimeStampedModel
import uuid


class Devis(TimeStampedModel):
    """
    Modèle pour les demandes de devis.
    """
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('en_cours', 'En cours de traitement'),
        ('envoye', 'Devis envoyé'),
        ('accepte', 'Accepté'),
        ('refuse', 'Refusé'),
        ('expire', 'Expiré'),
    ]

    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        verbose_name="UUID"
    )
    # Code unique du devis
    code_devis = models.CharField(
        max_length=50,
        unique=True,
        editable=False,
        verbose_name="Code devis"
    )

    # Informations client
    nom_complet = models.CharField(
        max_length=255,
        verbose_name="Nom complet"
    )
    email = models.EmailField(verbose_name="Email")
    telephone = models.CharField(
        max_length=20,
        verbose_name="Téléphone"
    )

    # Informations supplémentaires
    informations_supplementaires = models.TextField(
        blank=True,
        null=True,
        verbose_name="Informations supplémentaires"
    )

    # Statut du devis
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='en_attente',
        verbose_name="Statut"
    )

    # Réponse admin
    montant_total_ht = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Montant total HT"
    )
    montant_total_ttc = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Montant total TTC"
    )
    message_admin = models.TextField(
        blank=True,
        null=True,
        verbose_name="Message de l'admin"
    )
    date_reponse = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de réponse"
    )
    date_expiration = models.DateField(
        null=True,
        blank=True,
        verbose_name="Date d'expiration"
    )

    # Traité par
    traite_par = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='devis_traites',
        verbose_name="Traité par"
    )

    class Meta:
        db_table = 'devis'
        verbose_name = 'Devis'
        verbose_name_plural = 'Devis'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code_devis} - {self.nom_complet}"

    def save(self, *args, **kwargs):
        """Génère automatiquement un code unique si pas présent."""
        if not self.code_devis:
            from django.utils import timezone
            year = timezone.now().year
            random_part = str(uuid.uuid4().int)[:6]
            self.code_devis = f"DEV-{year}-{random_part}"
        super().save(*args, **kwargs)


class DevisProduit(TimeStampedModel):
    """
    Modèle pour les produits (chaussures) dans une demande de devis.
    """
    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        verbose_name="UUID"
    )
    devis = models.ForeignKey(
        Devis,
        on_delete=models.CASCADE,
        related_name='produits',
        verbose_name="Devis"
    )

    # Informations de la chaussure
    marque = models.CharField(
        max_length=100,
        verbose_name="Marque"
    )
    type_chaussure = models.CharField(
        max_length=100,
        verbose_name="Type"
    )
    photo = models.ImageField(
        upload_to='devis/produits/%Y/%m/',
        verbose_name="Photo",
        blank=True,
        null=True
    )

    # Services demandés (stockés comme liste JSON d'UUIDs)
    services_souhaites = models.JSONField(
        default=list,
        verbose_name="Services souhaités",
        help_text="Liste des UUIDs des services sélectionnés (référence au modèle Service)"
    )

    # Description/État
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name="Description/État"
    )

    # Prix unitaire (rempli par l'admin)
    prix_unitaire_ht = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Prix unitaire HT"
    )
    prix_unitaire_ttc = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Prix unitaire TTC"
    )

    class Meta:
        db_table = 'devis_produits'
        verbose_name = 'Produit de devis'
        verbose_name_plural = 'Produits de Devis'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.marque} {self.type_chaussure} - {self.devis.code_devis}"
