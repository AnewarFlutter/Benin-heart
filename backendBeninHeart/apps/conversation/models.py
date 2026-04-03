"""
Conversation models — Messagerie entre membres matchés.
"""
import uuid
from django.db import models
from django.conf import settings
from core.base_models import TimeStampedModel


class Conversation(TimeStampedModel):
    """
    Canal de messagerie entre deux membres ayant un match.
    Liée à un Match (one-to-one).
    """
    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    match = models.OneToOneField(
        'like.Match',
        on_delete=models.CASCADE,
        related_name='conversation',
        null=True,
        blank=True,
    )
    participant1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='conversations_p1'
    )
    participant2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='conversations_p2'
    )
    # Dernier message (dénormalisé pour éviter les requêtes N+1 dans la liste)
    dernier_message_texte = models.CharField(max_length=500, blank=True)
    dernier_message_at = models.DateTimeField(null=True, blank=True, db_index=True)
    est_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'conversations'
        verbose_name = 'Conversation'
        verbose_name_plural = 'Conversations'
        ordering = ['-dernier_message_at', '-created_at']
        unique_together = [('participant1', 'participant2')]

    def __str__(self):
        return f"Conv {self.participant1.email} ↔ {self.participant2.email}"

    def autre_participant(self, user):
        return self.participant2 if self.participant1 == user else self.participant1

    @classmethod
    def get_or_create_ordered(cls, user_a, user_b, match=None):
        """Assure que participant1.pk < participant2.pk."""
        if user_a.pk > user_b.pk:
            user_a, user_b = user_b, user_a
        return cls.objects.get_or_create(
            participant1=user_a,
            participant2=user_b,
            defaults={'match': match}
        )


class Message(TimeStampedModel):
    """
    Message dans une conversation.
    """
    TYPE_CHOICES = [
        ('TEXTE', 'Texte'),
        ('IMAGE', 'Image'),
    ]

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    auteur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='messages_envoyes')
    type_message = models.CharField(max_length=10, choices=TYPE_CHOICES, default='TEXTE')
    texte = models.TextField(blank=True)
    image = models.ImageField(upload_to='conversations/images/', null=True, blank=True)
    lu = models.BooleanField(default=False, db_index=True)
    lu_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'messages'
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
            models.Index(fields=['conversation', 'lu']),
        ]

    def __str__(self):
        return f"[{self.conversation.uuid}] {self.auteur.email}: {self.texte[:50]}"
