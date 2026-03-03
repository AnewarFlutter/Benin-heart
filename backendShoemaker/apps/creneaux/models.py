"""
Creneaux models
"""
import uuid
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from core.base_models import TimeStampedModel


class Creneaux(TimeStampedModel):
    """
    Modèle pour la gestion des créneaux horaires.
    Permet de définir des créneaux avec une capacité maximale et une durée limite avant le début.
    """
    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        verbose_name="UUID"
    )
    date = models.DateField(
        verbose_name="Date du créneau",
        help_text="Date du créneau"
    )
    heure_debut = models.TimeField(
        verbose_name="Heure de début",
        help_text="Heure de début du créneau (ex: 09:00)"
    )
    heure_fin = models.TimeField(
        verbose_name="Heure de fin",
        help_text="Heure de fin du créneau (ex: 12:00)"
    )
    duree_limite_minutes = models.IntegerField(
        verbose_name="Durée limite (minutes)",
        help_text="Durée limite avant le début du créneau (en minutes). Le créneau devient indisponible une fois cette durée atteinte.",
        default=30
    )
    capacite_max = models.IntegerField(
        verbose_name="Capacité maximale",
        help_text="Nombre maximum de réservations autorisées pour ce créneau",
        default=10
    )
    reservations_actuelles = models.IntegerField(
        verbose_name="Réservations actuelles",
        help_text="Nombre de réservations actuelles pour ce créneau",
        default=0
    )
    actif = models.BooleanField(
        default=True,
        verbose_name="Actif",
        help_text="Si False, le créneau n'est plus disponible pour les réservations"
    )

    class Meta:
        db_table = 'creneaux'
        verbose_name = 'Créneau horaire'
        verbose_name_plural = 'Créneaux horaires'
        ordering = ['date', 'heure_debut']
        unique_together = [['date', 'heure_debut', 'heure_fin']]
        indexes = [
            models.Index(fields=['date', 'actif']),
            models.Index(fields=['date', 'heure_debut']),
        ]

    def __str__(self):
        return f"{self.date} {self.heure_debut.strftime('%H:%M')}-{self.heure_fin.strftime('%H:%M')} ({self.reservations_actuelles}/{self.capacite_max})"

    def clean(self):
        """Validation du modèle."""
        if self.heure_fin <= self.heure_debut:
            raise ValidationError({
                'heure_fin': "L'heure de fin doit être après l'heure de début."
            })

        if self.duree_limite_minutes < 0:
            raise ValidationError({
                'duree_limite_minutes': "La durée limite ne peut pas être négative."
            })

        if self.capacite_max < 1:
            raise ValidationError({
                'capacite_max': "La capacité maximale doit être au moins 1."
            })

        if self.reservations_actuelles < 0:
            raise ValidationError({
                'reservations_actuelles': "Le nombre de réservations actuelles ne peut pas être négatif."
            })

        if self.reservations_actuelles > self.capacite_max:
            raise ValidationError({
                'reservations_actuelles': f"Le nombre de réservations actuelles ({self.reservations_actuelles}) dépasse la capacité maximale ({self.capacite_max})."
            })

    def save(self, *args, **kwargs):
        """Override save to run validation."""
        self.clean()
        super().save(*args, **kwargs)

    def est_disponible(self):
        """
        Vérifie si le créneau est disponible pour une nouvelle réservation.

        Retourne False si:
        - Le créneau n'est pas actif
        - La capacité maximale est atteinte
        - La durée limite avant le début est dépassée

        Returns:
            bool: True si le créneau est disponible, False sinon
        """
        # Vérifier si le créneau est actif
        if not self.actif:
            return False

        # Vérifier si la capacité maximale est atteinte
        if self.reservations_actuelles >= self.capacite_max:
            return False

        # Vérifier si la durée limite avant le début est dépassée
        if self.est_delai_depasse():
            return False

        return True

    def est_delai_depasse(self):
        """
        Vérifie si la durée limite avant le début du créneau est dépassée.

        Exemple: Si le créneau commence à 12:00 et la durée limite est 30 minutes,
        le créneau devient indisponible à partir de 11:30.

        Returns:
            bool: True si le délai est dépassé, False sinon
        """
        from datetime import datetime, timedelta

        now = timezone.now()

        # Combiner la date et l'heure de début pour créer un datetime
        creneau_debut_datetime = timezone.make_aware(
            datetime.combine(self.date, self.heure_debut)
        )

        # Calculer l'heure limite (début du créneau - durée limite)
        heure_limite = creneau_debut_datetime - timedelta(minutes=self.duree_limite_minutes)

        # Le délai est dépassé si l'heure actuelle est après l'heure limite
        return now >= heure_limite

    def est_passe(self):
        """
        Vérifie si le créneau est déjà passé.

        Returns:
            bool: True si le créneau est passé, False sinon
        """
        from datetime import datetime

        now = timezone.now()
        creneau_fin_datetime = timezone.make_aware(
            datetime.combine(self.date, self.heure_fin)
        )

        return now >= creneau_fin_datetime

    def incrementer_reservations(self):
        """
        Incrémente le nombre de réservations actuelles.

        Raises:
            ValidationError: Si la capacité maximale est déjà atteinte
        """
        if self.reservations_actuelles >= self.capacite_max:
            raise ValidationError(
                f"La capacité maximale ({self.capacite_max}) est déjà atteinte pour ce créneau."
            )

        self.reservations_actuelles += 1
        self.save()

    def decrementer_reservations(self):
        """
        Décrémente le nombre de réservations actuelles.

        Raises:
            ValidationError: Si le nombre de réservations est déjà à 0
        """
        if self.reservations_actuelles <= 0:
            raise ValidationError(
                "Le nombre de réservations actuelles est déjà à 0."
            )

        self.reservations_actuelles -= 1
        self.save()

    @property
    def places_restantes(self):
        """
        Retourne le nombre de places restantes.

        Returns:
            int: Nombre de places restantes
        """
        return self.capacite_max - self.reservations_actuelles

    @property
    def taux_occupation(self):
        """
        Retourne le taux d'occupation en pourcentage.

        Returns:
            float: Taux d'occupation (0-100)
        """
        if self.capacite_max == 0:
            return 0
        return (self.reservations_actuelles / self.capacite_max) * 100

    @classmethod
    def get_creneaux_disponibles(cls, date_debut=None, date_fin=None):
        """
        Retourne les créneaux disponibles pour une période donnée.

        Args:
            date_debut: Date de début (par défaut: aujourd'hui)
            date_fin: Date de fin (optionnel)

        Returns:
            QuerySet: Créneaux disponibles
        """
        from datetime import date as date_type

        if date_debut is None:
            date_debut = timezone.now().date()

        queryset = cls.objects.filter(
            date__gte=date_debut,
            actif=True
        )

        if date_fin:
            queryset = queryset.filter(date__lte=date_fin)

        # Filtrer pour ne garder que les créneaux disponibles
        # Note: Le filtrage du délai se fait côté application
        creneaux_disponibles = []
        for creneau in queryset:
            if creneau.est_disponible():
                creneaux_disponibles.append(creneau.id)

        return queryset.filter(id__in=creneaux_disponibles)


class CreneauxConfig(TimeStampedModel):
    """
    Configuration globale du système de créneaux.
    Singleton - une seule instance pour toute l'application.
    """
    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        verbose_name="UUID"
    )
    actif = models.BooleanField(
        default=True,
        verbose_name="Système de créneaux actif",
        help_text="Si désactivé, les clients peuvent saisir un créneau horaire en texte libre sans sélectionner un créneau prédéfini"
    )
    message_desactivation = models.TextField(
        blank=True,
        null=True,
        verbose_name="Message lors de la désactivation",
        help_text="Message affiché aux clients quand le système de créneaux est désactivé (optionnel)"
    )

    class Meta:
        db_table = 'creneaux_config'
        verbose_name = 'Configuration des créneaux'
        verbose_name_plural = 'Configuration des créneaux'

    def __str__(self):
        return f"Système de créneaux: {'Activé' if self.actif else 'Désactivé'}"

    def save(self, *args, **kwargs):
        """S'assurer qu'il n'y a qu'une seule instance (singleton)."""
        if not self.pk and CreneauxConfig.objects.exists():
            raise ValidationError('Il ne peut y avoir qu\'une seule configuration de créneaux.')
        # Force l'ID à 1 pour le singleton
        self.pk = 1
        return super().save(*args, **kwargs)

    @classmethod
    def get_config(cls):
        """Récupérer ou créer l'instance unique de configuration."""
        config, created = cls.objects.get_or_create(pk=1, defaults={'actif': True})
        return config

    @classmethod
    def is_actif(cls):
        """Vérifie rapidement si le système de créneaux est actif."""
        config = cls.get_config()
        return config.actif
