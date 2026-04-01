"""
Temoignage models
"""
import uuid
from django.db import models
from core.base_models import TimeStampedModel


class Temoignage(TimeStampedModel):
    """
    Modèle pour les témoignages clients.
    Stocke les avis et retours d'expérience des clients.
    """
    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        verbose_name="UUID"
    )
    name = models.CharField(
        max_length=255,
        verbose_name="Nom du client",
        help_text="Nom complet du client qui témoigne"
    )
    profession = models.CharField(
        max_length=255,
        verbose_name="Profession",
        help_text="Profession ou titre du client",
        blank=True
    )
    description = models.TextField(
        verbose_name="Témoignage",
        help_text="Contenu du témoignage du client"
    )
    photo = models.ImageField(
        upload_to='temoignages/',
        verbose_name="Photo",
        help_text="Photo du client (optionnel)",
        blank=True,
        null=True
    )

    class Meta:
        db_table = 'temoignages'
        verbose_name = 'Témoignage'
        verbose_name_plural = 'Témoignages'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.profession}" if self.profession else self.name
