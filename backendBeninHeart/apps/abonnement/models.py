"""
Abonnement models — Plans tarifaires et souscriptions des membres.
"""
import uuid
from django.db import models
from django.conf import settings
from core.base_models import TimeStampedModel


class PlanAbonnement(TimeStampedModel):
    """
    Plan tarifaire (Gratuit, Premium, VIP Elite).
    Géré depuis l'admin Django. Frontend lit via API publique.
    """
    ICONE_CHOICES = [
        ('heart', 'Heart'),
        ('star', 'Star'),
        ('crown', 'Crown'),
    ]

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    slug = models.SlugField(max_length=50, unique=True, help_text="Ex: gratuit, premium, vip")
    titre = models.CharField(max_length=100)
    description = models.TextField()
    prix = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    prix_affiche = models.CharField(max_length=50, help_text='Ex: "14,99€ / mois"')
    duree = models.CharField(max_length=50, help_text='Ex: "Mensuel", "À vie"')
    fonctionnalites = models.JSONField(default=list)
    fonctionnalites_exclues = models.JSONField(default=list)
    est_populaire = models.BooleanField(default=False)
    icone = models.CharField(max_length=20, choices=ICONE_CHOICES, default='heart')
    ordre = models.PositiveIntegerField(default=0)
    est_actif = models.BooleanField(default=True)

    class Meta:
        db_table = 'plans_abonnement'
        verbose_name = "Plan d'abonnement"
        verbose_name_plural = "Plans d'abonnement"
        ordering = ['ordre', 'prix']

    def __str__(self):
        return f"{self.titre} ({self.prix_affiche})"


class Souscription(TimeStampedModel):
    """
    Souscription d'un membre à un plan.
    Validée manuellement via Django admin (pas de paiement en ligne pour l'instant).
    """
    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('ACTIVE', 'Active'),
        ('EXPIREE', 'Expirée'),
        ('ANNULEE', 'Annulée'),
    ]

    uuid = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='souscriptions'
    )
    plan = models.ForeignKey(
        PlanAbonnement,
        on_delete=models.PROTECT,
        related_name='souscriptions'
    )
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE', db_index=True)
    date_debut = models.DateField(null=True, blank=True)
    date_fin = models.DateField(null=True, blank=True)
    nombre_mois = models.PositiveIntegerField(default=1)

    # Infos facturation saisies au checkout
    prenom = models.CharField(max_length=100, blank=True)
    nom = models.CharField(max_length=100, blank=True)
    telephone = models.CharField(max_length=20, blank=True)
    adresse = models.CharField(max_length=255, blank=True)
    ville = models.CharField(max_length=100, blank=True)
    code_postal = models.CharField(max_length=20, blank=True)
    code_promo = models.CharField(max_length=50, blank=True, null=True)
    notes = models.TextField(blank=True, null=True, help_text='Notes internes (admin)')

    class Meta:
        db_table = 'souscriptions'
        verbose_name = 'Souscription'
        verbose_name_plural = 'Souscriptions'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'statut']),
        ]

    def __str__(self):
        return f"{self.user.email} → {self.plan.titre} ({self.get_statut_display()})"

    @property
    def est_active(self):
        return self.statut == 'ACTIVE'
