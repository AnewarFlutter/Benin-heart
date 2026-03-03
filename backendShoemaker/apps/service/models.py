"""
Service models
"""
import uuid
from django.db import models
from core.base_models import TimeStampedModel


class ServiceCategory(TimeStampedModel):
    """
    Modèle pour les catégories de services.
    """
    STATUT_CHOICES = [
        ('actif', 'Actif'),
        ('inactif', 'Inactif'),
    ]

    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        verbose_name="UUID"
    )
    nom = models.CharField(max_length=255, verbose_name="Nom de la catégorie")
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name="Description"
    )
    image = models.ImageField(
        upload_to='categories/',
        blank=True,
        null=True,
        verbose_name="Image de la catégorie",
        help_text="Image représentative de la catégorie (recommandé: 800x600px)"
    )
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='actif',
        verbose_name="Statut"
    )
    ordre = models.PositiveIntegerField(
        default=0,
        verbose_name="Ordre d'affichage",
        help_text="Les catégories sont classées par ordre croissant"
    )

    class Meta:
        db_table = 'service_categories'
        verbose_name = 'Catégorie de service'
        verbose_name_plural = 'Catégories de services'
        ordering = ['ordre', 'nom']

    def __str__(self):
        return self.nom


class Service(TimeStampedModel):
    """
    Modèle pour les services proposés.
    """
    STATUT_CHOICES = [
        ('actif', 'Actif'),
        ('inactif', 'Inactif'),
        ('brouillon', 'Brouillon'),
    ]

    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        verbose_name="UUID"
    )
    nom = models.CharField(max_length=255, verbose_name="Nom du service")
    description = models.TextField(verbose_name="Description")
    category = models.ForeignKey(
        ServiceCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='services',
        verbose_name="Catégorie"
    )

    # Tarification
    prix_minimum_ht = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Prix minimum HT",
        help_text="Prix minimum hors taxe"
    )
    tva = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name="TVA (%)",
        help_text="Taux de TVA en pourcentage (ex: 20.00 pour 20%)"
    )
    prix_minimum_ttc = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Prix minimum TTC",
        help_text="Prix minimum toutes taxes comprises",
        blank=True,
        null=True
    )

    # Délais
    delai_minimum_jours = models.IntegerField(
        verbose_name="Délai minimum (jours)",
        help_text="Délai minimum en jours"
    )
    delai_maximum_jours = models.IntegerField(
        null=True,
        blank=True,
        verbose_name="Délai maximum (jours)",
        help_text="Délai maximum en jours (optionnel)"
    )
    nombre_heures_delai_maximum = models.IntegerField(
        verbose_name="Nombre d'heures (délai maximum)",
        help_text="Heures calculées depuis delai_max ou delai_min"
    )
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='brouillon',
        verbose_name="Statut"
    )
    icone = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Icône"
    )

    class Meta:
        db_table = 'services'
        verbose_name = 'Service'
        verbose_name_plural = 'Services de Réparation'
        ordering = ['-created_at']

    def __str__(self):
        return self.nom

    def save(self, *args, **kwargs):
        """
        Calcule automatiquement le prix TTC à partir du HT et de la TVA.
        """
        if self.prix_minimum_ht is not None and self.tva is not None:
            self.prix_minimum_ttc = self.prix_minimum_ht * (1 + self.tva / 100)
        super().save(*args, **kwargs)

    def calculer_montant_tva(self):
        """
        Retourne le montant de la TVA.
        """
        if self.prix_minimum_ht and self.tva:
            return self.prix_minimum_ht * (self.tva / 100)
        return 0
 
   