"""
Like models — Likes, Superlikes, Dislikes et Matchs.
"""
import uuid
from django.db import models
from django.conf import settings
from core.base_models import TimeStampedModel


class Like(TimeStampedModel):
    """
    Action d'un utilisateur sur un autre (LIKE, SUPERLIKE, DISLIKE).
    Un match est créé automatiquement si les deux se likent.
    """
    TYPE_CHOICES = [
        ('LIKE', 'Like'),
        ('SUPERLIKE', 'Super Like'),
        ('DISLIKE', 'Dislike'),
    ]

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    expediteur = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='likes_envoyes'
    )
    destinataire = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='likes_recus'
    )
    type_action = models.CharField(max_length=10, choices=TYPE_CHOICES, default='LIKE', db_index=True)

    class Meta:
        db_table = 'likes'
        verbose_name = 'Like'
        verbose_name_plural = 'Likes'
        ordering = ['-created_at']
        # Un utilisateur ne peut évaluer un autre qu'une seule fois
        unique_together = [('expediteur', 'destinataire')]
        indexes = [
            models.Index(fields=['destinataire', 'type_action']),
            models.Index(fields=['expediteur', 'created_at']),
        ]

    def __str__(self):
        return f"{self.expediteur.email} → {self.type_action} → {self.destinataire.email}"


class Match(TimeStampedModel):
    """
    Match mutuel entre deux utilisateurs.
    Créé automatiquement via signal quand les deux se likent.
    """
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    user1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='matchs_user1'
    )
    user2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='matchs_user2'
    )
    est_actif = models.BooleanField(default=True)

    class Meta:
        db_table = 'matchs'
        verbose_name = 'Match'
        verbose_name_plural = 'Matchs'
        ordering = ['-created_at']
        # Un seul match par paire (user1.pk < user2.pk toujours)
        unique_together = [('user1', 'user2')]

    def __str__(self):
        return f"Match {self.user1.email} ↔ {self.user2.email}"

    @classmethod
    def get_or_create_ordered(cls, user_a, user_b):
        """Assure que user1.pk < user2.pk pour éviter les doublons."""
        if user_a.pk > user_b.pk:
            user_a, user_b = user_b, user_a
        return cls.objects.get_or_create(user1=user_a, user2=user_b)
