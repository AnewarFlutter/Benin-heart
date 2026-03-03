from django.contrib import admin
from django.utils.html import format_html
from .models import Creneaux, CreneauxConfig


@admin.register(CreneauxConfig)
class CreneauxConfigAdmin(admin.ModelAdmin):
    """Admin pour la configuration du système de créneaux."""

    list_display = ['statut_display', 'updated_at']
    fieldsets = (
        ('Configuration du système', {
            'fields': ('actif', 'message_desactivation'),
            'description': 'Activez ou désactivez le système de créneaux prédéfinis. '
                          'Quand désactivé, les clients peuvent saisir leur créneau horaire en texte libre.'
        }),
    )

    def has_add_permission(self, request):
        """Empêcher l'ajout de nouvelles configurations (singleton)."""
        return not CreneauxConfig.objects.exists()

    def has_delete_permission(self, request, obj=None):
        """Empêcher la suppression de la configuration."""
        return False

    def statut_display(self, obj):
        """Affiche le statut avec couleur."""
        if obj.actif:
            return format_html('<span style="color: green; font-weight: bold;">✓ ACTIVÉ - Créneaux prédéfinis requis</span>')
        return format_html('<span style="color: orange; font-weight: bold;">○ DÉSACTIVÉ - Saisie libre</span>')
    statut_display.short_description = "Statut du système"


@admin.register(Creneaux)
class CreneauxAdmin(admin.ModelAdmin):
    """Admin pour la gestion des créneaux horaires."""

    list_display = [
        'date', 'heure_debut', 'heure_fin',
        'capacite_display', 'taux_occupation_display',
        'actif_display', 'disponible_display', 'created_at'
    ]
    list_filter = ['actif', 'date', 'created_at']
    search_fields = ['date']
    ordering = ['date', 'heure_debut']
    date_hierarchy = 'date'

    fieldsets = (
        ('Informations du créneau', {
            'fields': ('date', 'heure_debut', 'heure_fin')
        }),
        ('Capacité et réservations', {
            'fields': ('capacite_max', 'reservations_actuelles', 'duree_limite_minutes')
        }),
        ('Statut', {
            'fields': ('actif',)
        }),
        ('Informations système', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['created_at', 'updated_at']

    def capacite_display(self, obj):
        """Affiche la capacité sous forme fraction."""
        return f"{obj.reservations_actuelles}/{obj.capacite_max}"
    capacite_display.short_description = "Réservations"

    def taux_occupation_display(self, obj):
        """Affiche le taux d'occupation avec couleur."""
        taux = obj.taux_occupation
        if taux >= 90:
            color = 'red'
        elif taux >= 70:
            color = 'orange'
        else:
            color = 'green'
        # Formater le float avant de le passer à format_html
        taux_formatte = f"{taux:.1f}"
        return format_html(
            '<span style="color: {};">{}%</span>',
            color, taux_formatte
        )
    taux_occupation_display.short_description = "Taux d'occupation"

    def actif_display(self, obj):
        """Affiche le statut actif avec icône."""
        if obj.actif:
            return format_html('<span style="color: green;">✓ Actif</span>')
        return format_html('<span style="color: red;">✗ Inactif</span>')
    actif_display.short_description = "Statut"

    def disponible_display(self, obj):
        """Affiche la disponibilité avec icône."""
        if obj.est_disponible():
            return format_html('<span style="color: green;">✓ Disponible</span>')
        elif obj.est_delai_depasse():
            return format_html('<span style="color: red;">✗ Délai dépassé</span>')
        elif obj.reservations_actuelles >= obj.capacite_max:
            return format_html('<span style="color: red;">✗ Complet</span>')
        else:
            return format_html('<span style="color: red;">✗ Indisponible</span>')
    disponible_display.short_description = "Disponibilité"

    actions = ['activer_creneaux', 'desactiver_creneaux']

    def activer_creneaux(self, request, queryset):
        """Action pour activer des créneaux."""
        updated = queryset.update(actif=True)
        self.message_user(request, f"{updated} créneau(x) activé(s).")
    activer_creneaux.short_description = "Activer les créneaux sélectionnés"

    def desactiver_creneaux(self, request, queryset):
        """Action pour désactiver des créneaux."""
        updated = queryset.update(actif=False)
        self.message_user(request, f"{updated} créneau(x) désactivé(s).")
    desactiver_creneaux.short_description = "Désactiver les créneaux sélectionnés"
