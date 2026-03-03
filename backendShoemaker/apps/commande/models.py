"""
Commande models
"""
from django.db import models
from django.conf import settings
from core.base_models import TimeStampedModel
from apps.service.models import Service
import uuid


class EmailLog(TimeStampedModel):
    """
    Modèle pour logger tous les emails envoyés par le système.
    """
    STATUT_CHOICES = [
        ('envoye', 'Envoyé'),
        ('echec', 'Échec'),
        ('en_attente', 'En attente'),
    ]

    TYPE_EMAIL_CHOICES = [
        ('nouvelle_commande_admin', 'Nouvelle commande (Admin)'),
        ('confirmation_commande_client', 'Confirmation commande (Client)'),
        ('modification_commande_client', 'Modification commande (Client)'),
        ('assignation_livreur', 'Assignation livreur'),
        ('desassignation_livreur', 'Désassignation livreur'),
        ('en_attente_collecte', 'En attente de collecte (Client)'),
        ('rappel_collecte', 'Rappel collecte (Client)'),
        ('confirmation_livreur_admin', 'Confirmation livreur (Admin)'),
        ('collecte_effectuee_client', 'Collecte effectuée (Client)'),
        ('collecte_effectuee_admin', 'Collecte effectuée (Admin)'),
        ('arrivee_atelier', 'Arrivée atelier (Client)'),
        ('assignation_livreur_livraison', 'Assignation livreur livraison'),
        ('confirmation_livraison_client', 'Confirmation livraison (Client)'),
        ('confirmation_livraison_admin', 'Confirmation livraison (Admin)'),
        ('livraison_effectuee_client', 'Livraison effectuée (Client)'),
        ('livraison_effectuee_admin', 'Livraison effectuée (Admin)'),
        ('contact_form', 'Formulaire de contact'),
    ]

    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        verbose_name="UUID"
    )
    type_email = models.CharField(
        max_length=50,
        choices=TYPE_EMAIL_CHOICES,
        verbose_name="Type d'email"
    )
    destinataire = models.EmailField(verbose_name="Destinataire")
    sujet = models.CharField(max_length=255, verbose_name="Sujet")
    contenu_html = models.TextField(verbose_name="Contenu HTML")
    contenu_text = models.TextField(verbose_name="Contenu texte")
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='en_attente',
        verbose_name="Statut"
    )
    erreur = models.TextField(
        blank=True,
        null=True,
        verbose_name="Message d'erreur"
    )
    commande = models.ForeignKey(
        'Commande',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='emails_logs',
        verbose_name="Commande associée"
    )
    date_envoi = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date d'envoi"
    )

    class Meta:
        db_table = 'email_logs'
        verbose_name = 'Log Email'
        verbose_name_plural = 'Logs Emails'
        ordering = ['-created_at']
        app_label = 'commande'
        indexes = [
            models.Index(fields=['type_email']),
            models.Index(fields=['statut']),
            models.Index(fields=['destinataire']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.get_type_email_display()} → {self.destinataire} ({self.get_statut_display()})"


class MoyenPaiement(TimeStampedModel):
    """
    Modèle pour les moyens de paiement.
    Géré par l'admin.
    """
    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        verbose_name="UUID"
    )
    nom = models.CharField(max_length=100, verbose_name="Nom")
    code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Code",
        help_text="Code unique (ex: carte, especes, paypal)"
    )
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    actif = models.BooleanField(default=True, verbose_name="Actif")
    icone = models.CharField(max_length=255, blank=True, null=True, verbose_name="Icône")

    class Meta:
        db_table = 'moyens_paiement'
        verbose_name = 'Moyen de paiement'
        verbose_name_plural = 'Moyens de Paiement'
        ordering = ['nom']

    def __str__(self):
        return self.nom


class CodePromo(TimeStampedModel):
    """
    Modèle pour les codes promotionnels.
    Géré par l'admin.
    """
    TYPE_REDUCTION_CHOICES = [
        ('pourcentage', 'Pourcentage'),
        ('montant_fixe', 'Montant fixe'),
    ]

    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        verbose_name="UUID"
    )
    code = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="Code promo",
        help_text="Code unique (ex: NOEL2025)"
    )
    type_reduction = models.CharField(
        max_length=20,
        choices=TYPE_REDUCTION_CHOICES,
        verbose_name="Type de réduction"
    )
    valeur = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Valeur",
        help_text="Pourcentage (ex: 20 pour 20%) ou montant fixe (ex: 50.00)"
    )
    date_debut = models.DateTimeField(verbose_name="Date de début")
    date_fin = models.DateTimeField(verbose_name="Date de fin")
    actif = models.BooleanField(default=True, verbose_name="Actif")
    description = models.TextField(blank=True, null=True, verbose_name="Description")
    utilisation_max = models.IntegerField(
        blank=True,
        null=True,
        verbose_name="Nombre maximum d'utilisations",
        help_text="Nombre maximum total d'utilisations du code promo (tous clients confondus, laisser vide pour illimité)"
    )
    max_uses_per_user = models.IntegerField(
        blank=True,
        null=True,
        verbose_name="Utilisations max par personne",
        help_text="Nombre maximum d'utilisations par utilisateur (laisser vide pour illimité)"
    )
    montant_minimum = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        blank=True,
        null=True,
        verbose_name="Montant minimum",
        help_text="Montant minimum de commande pour appliquer le code promo (laisser vide pour aucun minimum)"
    )

    class Meta:
        db_table = 'codes_promo'
        verbose_name = 'Code promo'
        verbose_name_plural = 'Codes Promo'
        ordering = ['-created_at']

    def __str__(self):
        return self.code

    def est_valide(self):
        """Vérifie si le code promo est valide (actif et dans les dates)."""
        from django.utils import timezone
        now = timezone.now()
        return self.actif and self.date_debut <= now <= self.date_fin

    def utilisations_actuelles(self):
        """
        Retourne le nombre d'utilisations actuelles de ce code promo.

        Returns:
            int: Nombre de fois que ce code promo a été utilisé
        """
        return Commande.objects.filter(code_promo=self).count()

    def peut_etre_utilise_par(self, user, montant_commande=None):
        """
        Vérifie si le code promo peut être utilisé par un utilisateur donné.

        Args:
            user: L'utilisateur qui souhaite utiliser le code
            montant_commande: Le montant total de la commande (optionnel)

        Returns:
            tuple: (bool, str) - (peut_utiliser, message_erreur)
        """
        # Vérifier d'abord si le code est valide (dates + actif)
        if not self.est_valide():
            return False, "Code promo invalide ou expiré"

        # Vérifier le montant minimum
        if self.montant_minimum and montant_commande:
            if montant_commande < self.montant_minimum:
                return False, f"Montant minimum de {self.montant_minimum} FCFA requis pour utiliser ce code promo"

        # Vérifier le nombre total d'utilisations du code promo (tous clients confondus)
        if self.utilisation_max:
            nombre_utilisations_total = Commande.objects.filter(
                code_promo=self
            ).count()

            if nombre_utilisations_total >= self.utilisation_max:
                return False, f"Ce code promo a atteint sa limite d'utilisation ({self.utilisation_max} utilisations maximum)"

        # Vérifier le nombre d'utilisations par cet utilisateur
        if self.max_uses_per_user:
            nombre_utilisations_user = Commande.objects.filter(
                code_promo=self,
                user=user
            ).count()

            if nombre_utilisations_user >= self.max_uses_per_user:
                if self.max_uses_per_user == 1:
                    return False, "Vous avez déjà utilisé ce code promo"
                return False, f"Vous avez atteint la limite d'utilisation de ce code ({self.max_uses_per_user} fois maximum)"

        return True, None


class Commande(TimeStampedModel):
    """
    Modèle principal pour les commandes.
    Créé uniquement au moment du checkout.
    """
    STATUT_PAIEMENT_CHOICES = [
        ('en_attente', 'En attente'),
        ('paye', 'Payé'),
        ('echoue', 'Échoué'),
        ('rembourse', 'Remboursé'),
    ]

    STATUT_COMMANDE_CHOICES = [
        ('nouvelle', 'Nouvelle'),
        ('en_collecte', 'En collecte'),
        ('collectee', 'Collectée'),
        ('en_cours', 'En cours'),
        ('prete', 'Prête'),
        ('en_livraison', 'En livraison'),
        ('terminee', 'Terminée'),
        ('annulee', 'Annulée'),
    ]

    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        verbose_name="UUID"
    )
    # Code unique de la commande
    code_unique = models.CharField(
        max_length=50,
        unique=True,
        editable=False,
        verbose_name="Code commande"
    )

    # Utilisateur
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='commandes',
        verbose_name="Client"
    )

    # Montants financiers (calculés serveur)
    montant_ht = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Montant HT"
    )
    montant_tva = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Montant TVA"
    )
    montant_ttc = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Montant TTC"
    )
    montant_reduction = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Montant réduction"
    )
    montant_final = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Montant final"
    )

    # Paiement
    statut_paiement = models.CharField(
        max_length=20,
        choices=STATUT_PAIEMENT_CHOICES,
        default='en_attente',
        verbose_name="Statut paiement"
    )
    moyen_paiement = models.ForeignKey(
        MoyenPaiement,
        on_delete=models.PROTECT,
        related_name='commandes',
        verbose_name="Moyen de paiement"
    )

    # Statut global
    statut_commande = models.CharField(
        max_length=20,
        choices=STATUT_COMMANDE_CHOICES,
        default='nouvelle',
        verbose_name="Statut commande"
    )

    # Code promo (optionnel)
    code_promo = models.ForeignKey(
        CodePromo,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='commandes',
        verbose_name="Code promo"
    )

    # Livreur assigné pour la collecte (optionnel)
    delivery_person = models.ForeignKey(
        'users.DeliveryPerson',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='commandes_collecte',
        verbose_name="Livreur collecte"
    )
    date_assignation = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date d'assignation collecte"
    )
    date_confirmation_livreur = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de confirmation livreur collecte"
    )
    rappel_envoye = models.BooleanField(
        default=False,
        verbose_name="Rappel 1h avant envoyé"
    )

    # Livreur assigné pour la livraison (optionnel)
    delivery_person_livraison = models.ForeignKey(
        'users.DeliveryPerson',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='commandes_livraison',
        verbose_name="Livreur livraison"
    )
    date_livraison = models.DateField(
        null=True,
        blank=True,
        verbose_name="Date de livraison prévue"
    )
    date_assignation_livraison = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date d'assignation livraison"
    )
    date_livraison_effective = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de livraison effective"
    )
    code_confirmation_livraison = models.CharField(
        max_length=10,
        blank=True,
        null=True,
        verbose_name="Code de confirmation livraison",
        help_text="Code unique généré lors de la confirmation de livraison par le livreur"
    )

    # Informations de collecte
    adresse_collecte = models.TextField(verbose_name="Adresse de collecte")
    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
        verbose_name="Latitude"
    )
    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True,
        verbose_name="Longitude"
    )
    telephone_collecte = models.CharField(max_length=20, verbose_name="Téléphone")
    date_collecte = models.DateField(verbose_name="Date de collecte")

    # Système de créneaux
    creneau = models.ForeignKey(
        'creneaux.Creneaux',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='commandes',
        verbose_name="Créneau",
        help_text="Créneau horaire sélectionné (si système de créneaux activé)"
    )
    creneau_horaire = models.CharField(
        max_length=50,
        verbose_name="Créneau horaire",
        help_text="Horaire en texte (rempli automatiquement depuis le créneau ou manuellement si système désactivé)"
    )
    note_collecte = models.TextField(
        blank=True,
        null=True,
        verbose_name="Note collecte"
    )
    monnaie_collecte = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Monnaie collecte",
        help_text="Montant de monnaie remis au livreur pour la collecte"
    )

    class Meta:
        db_table = 'commandes'
        verbose_name = 'Commande'
        verbose_name_plural = 'Commandes'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code_unique} - {self.user.email}"

    def save(self, *args, **kwargs):
        """Génère automatiquement un code unique si pas présent."""
        if not self.code_unique:
            # Format: CMD-YYYY-XXXXXX (6 chiffres aléatoires)
            from django.utils import timezone
            year = timezone.now().year
            random_part = str(uuid.uuid4().int)[:6]
            self.code_unique = f"CMD-{year}-{random_part}"

        # Remplir automatiquement creneau_horaire depuis le créneau si disponible
        # Force la mise à jour même si creneau_horaire contient déjà une valeur
        if self.creneau:
            self.creneau_horaire = f"{self.creneau.heure_debut.strftime('%H:%M')} - {self.creneau.heure_fin.strftime('%H:%M')}"

        super().save(*args, **kwargs)


class CodeCollecte(TimeStampedModel):
    """
    Codes uniques générés pour la collecte des chaussures.
    Chaque code est utilisé pour identifier une paire de chaussures.
    """
    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        verbose_name="UUID"
    )
    code = models.CharField(
        max_length=20,
        unique=True,
        verbose_name="Code unique"
    )
    genere_par = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='codes_generes',
        verbose_name="Généré par"
    )
    utilise = models.BooleanField(
        default=False,
        verbose_name="Utilisé"
    )
    date_utilisation = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date d'utilisation"
    )
    commande_produit = models.OneToOneField(
        'CommandeProduit',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='code_collecte_obj',
        verbose_name="Produit associé"
    )

    class Meta:
        db_table = 'codes_collecte'
        verbose_name = 'Code de collecte'
        verbose_name_plural = 'Codes de Collecte'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['utilise']),
        ]

    def __str__(self):
        return f"{self.code} {'(utilisé)' if self.utilise else '(disponible)'}"


class CommandeProduit(TimeStampedModel):
    """
    Modèle pour les produits (chaussures) dans une commande.
    Snapshot des informations uploadées par l'utilisateur.
    """
    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        verbose_name="UUID"
    )
    commande = models.ForeignKey(
        Commande,
        on_delete=models.CASCADE,
        related_name='produits',
        verbose_name="Commande"
    )

    # Informations uploadées par l'utilisateur (snapshot figé)
    description = models.TextField(verbose_name="Description")
    marque = models.CharField(max_length=100, verbose_name="Marque")
    modele = models.CharField(max_length=100, verbose_name="Modèle")
    couleur = models.CharField(max_length=50, verbose_name="Couleur")
    photo = models.ImageField(
        upload_to='commandes/produits/%Y/%m/',
        verbose_name="Photo"
    )
    note_utilisateur = models.TextField(
        blank=True,
        null=True,
        verbose_name="Note utilisateur"
    )

    # Code de collecte (assigné par le livreur lors de la collecte)
    code_collecte = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name="Code de collecte",
        help_text="Code unique collé sur la paire de chaussures"
    )
    date_collecte_effective = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Date de collecte effective",
        help_text="Date à laquelle le code a été assigné et la paire collectée"
    )

    # Prix du produit (généralement 0 si pas de prix de base)
    prix_ht = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Prix HT"
    )
    tva = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=20.00,
        verbose_name="TVA (%)"
    )
    prix_ttc = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Prix TTC"
    )

    class Meta:
        db_table = 'commande_produits'
        verbose_name = 'Produit de commande'
        verbose_name_plural = 'Produits de Commande'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.marque} {self.modele} - {self.commande.code_unique}"


class CommandeProduitService(TimeStampedModel):
    """
    Modèle pour les services appliqués à un produit dans une commande.
    Snapshot des prix au moment de la commande.
    """
    uuid = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        db_index=True,
        verbose_name="UUID"
    )
    commande_produit = models.ForeignKey(
        CommandeProduit,
        on_delete=models.CASCADE,
        related_name='services',
        verbose_name="Produit"
    )
    service = models.ForeignKey(
        Service,
        on_delete=models.PROTECT,
        related_name='commande_services',
        verbose_name="Service (référence)"
    )

    # Snapshot du service au moment de la commande
    nom_service = models.CharField(max_length=255, verbose_name="Nom du service")
    prix_ht = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Prix HT"
    )
    tva = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        verbose_name="TVA (%)"
    )
    montant_tva = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Montant TVA"
    )
    prix_ttc = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Prix TTC"
    )

    class Meta:
        db_table = 'commande_produit_services'
        verbose_name = 'Service de produit'
        verbose_name_plural = 'Services de Produit'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.nom_service} - {self.commande_produit}"