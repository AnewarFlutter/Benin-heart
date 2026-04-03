"""
Profil models — Profils de rencontre Benin Heart.
"""
import uuid
from django.db import models
from django.conf import settings
from core.base_models import TimeStampedModel


class Profil(TimeStampedModel):
    """
    Profil de rencontre d'un membre.
    Un user n'a qu'un seul profil (OneToOne).
    """
    GENRE_CHOICES = [
        ('HOMME', 'Homme'),
        ('FEMME', 'Femme'),
        ('AUTRE', 'Autre'),
    ]
    RECHERCHE_CHOICES = [
        ('HOMME', 'Homme'),
        ('FEMME', 'Femme'),
        ('TOUS', 'Tous'),
    ]
    STATUT_CHOICES = [
        ('ACTIF', 'Actif'),
        ('INACTIF', 'Inactif'),
        ('SUSPENDU', 'Suspendu'),
        ('BANNI', 'Banni'),
    ]

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='profil'
    )
    prenom = models.CharField(max_length=100)
    date_naissance = models.DateField()
    genre = models.CharField(max_length=10, choices=GENRE_CHOICES, db_index=True)
    recherche = models.CharField(max_length=10, choices=RECHERCHE_CHOICES, default='TOUS')
    bio = models.TextField(max_length=500, blank=True)
    ville = models.CharField(max_length=100, blank=True)
    pays = models.CharField(max_length=100, default='Bénin')
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Préférences
    age_min = models.PositiveSmallIntegerField(default=18)
    age_max = models.PositiveSmallIntegerField(default=50)
    distance_max = models.PositiveIntegerField(default=50, help_text='km')

    # Médias
    photo_principale = models.ImageField(upload_to='profils/photos/', null=True, blank=True)
    video_presentation = models.FileField(upload_to='profils/videos/', null=True, blank=True)

    # Statut
    statut = models.CharField(max_length=15, choices=STATUT_CHOICES, default='ACTIF', db_index=True)
    est_verifie = models.BooleanField(default=False)
    est_en_ligne = models.BooleanField(default=False, db_index=True)
    derniere_activite = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'profils'
        verbose_name = 'Profil'
        verbose_name_plural = 'Profils'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['genre', 'recherche', 'statut']),
            models.Index(fields=['statut', 'est_en_ligne']),
        ]

    def __str__(self):
        return f"{self.prenom} ({self.user.email})"

    @property
    def age(self):
        from datetime import date
        today = date.today()
        born = self.date_naissance
        return today.year - born.year - ((today.month, today.day) < (born.month, born.day))


class PhotoProfil(TimeStampedModel):
    """
    Photos supplémentaires du profil (max 6).
    """
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    profil = models.ForeignKey(Profil, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to='profils/photos/')
    ordre = models.PositiveSmallIntegerField(default=0)
    est_principale = models.BooleanField(default=False)

    class Meta:
        db_table = 'photos_profil'
        verbose_name = 'Photo de profil'
        verbose_name_plural = 'Photos de profil'
        ordering = ['ordre']

    def __str__(self):
        return f"Photo {self.ordre} — {self.profil.prenom}"
