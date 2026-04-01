"""
Storepage models
"""
from django.db import models
from core.base_models import TimeStampedModel


class HeroBanner(TimeStampedModel):
    """
    Modèle pour les bannières hero de la page d'accueil.
    Gérable uniquement depuis l'admin Django.
    """
    titre = models.CharField(
        max_length=255,
        verbose_name="Titre",
        help_text="Titre principal affiché sur la bannière"
    )
    description = models.TextField(
        verbose_name="Description",
        help_text="Sous-titre ou description courte",
        blank=True,
        null=True
    )
    image = models.ImageField(
        upload_to='hero_banners/',
        verbose_name="Image de fond",
        help_text="Image de fond de la bannière (recommandé: 1920x800px)"
    )
    bouton_texte = models.CharField(
        max_length=100,
        verbose_name="Texte du bouton",
        default="Découvrir nos services",
        blank=True,
        null=True
    )
    bouton_lien = models.CharField(
        max_length=255,
        verbose_name="Lien du bouton",
        default="https://shoemaker.cireur.test-vps-online.xyz/fr/services",
        blank=True,
        null=True,
        help_text="URL complète vers laquelle le bouton redirige"
    )
    ordre = models.PositiveIntegerField(
        default=0,
        verbose_name="Ordre d'affichage",
        help_text="Les bannières sont affichées par ordre croissant"
    )
    actif = models.BooleanField(
        default=True,
        verbose_name="Actif",
        help_text="Décocher pour masquer cette bannière"
    )

    class Meta:
        db_table = 'hero_banners'
        verbose_name = 'Bannière Hero'
        verbose_name_plural = 'Bannières Hero'
        ordering = ['ordre', '-created_at']

    def __str__(self):
        status = "✓" if self.actif else "✗"
        return f"[{status}] {self.titre}"
