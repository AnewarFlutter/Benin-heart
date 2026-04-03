from django.contrib import admin
from .models import PlanAbonnement, Souscription


@admin.register(PlanAbonnement)
class PlanAbonnementAdmin(admin.ModelAdmin):
    list_display = ['titre', 'slug', 'prix_affiche', 'est_populaire', 'est_actif', 'ordre']
    list_editable = ['est_actif', 'ordre', 'est_populaire']
    list_filter = ['est_actif', 'est_populaire']
    search_fields = ['titre', 'slug']
    prepopulated_fields = {'slug': ('titre',)}
    ordering = ['ordre']


@admin.register(Souscription)
class SouscriptionAdmin(admin.ModelAdmin):
    list_display = ['user', 'plan', 'statut', 'date_debut', 'date_fin', 'nombre_mois', 'created_at']
    list_filter = ['statut', 'plan']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'prenom', 'nom']
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    list_editable = ['statut']
    ordering = ['-created_at']
    fieldsets = (
        ('Abonnement', {
            'fields': ('uuid', 'user', 'plan', 'statut', 'date_debut', 'date_fin', 'nombre_mois')
        }),
        ('Facturation', {
            'fields': ('prenom', 'nom', 'telephone', 'adresse', 'ville', 'code_postal', 'code_promo')
        }),
        ('Admin', {
            'fields': ('notes', 'created_at', 'updated_at')
        }),
    )
