"""
Django Admin configuration for Devis app.
"""
from django.contrib import admin
from .models import Devis, DevisProduit


class DevisProduitInline(admin.TabularInline):
    """Inline pour afficher les produits dans le devis."""
    model = DevisProduit
    extra = 0
    fields = ['marque', 'type_chaussure', 'services_souhaites', 'description', 'prix_unitaire_ht', 'prix_unitaire_ttc']
    readonly_fields = ['marque', 'type_chaussure', 'services_souhaites', 'description']


@admin.register(Devis)
class DevisAdmin(admin.ModelAdmin):
    """Admin pour les devis."""
    list_display = ['code_devis', 'nom_complet', 'email', 'statut', 'montant_total_ttc', 'created_at']
    list_filter = ['statut', 'created_at', 'date_reponse']
    search_fields = ['code_devis', 'nom_complet', 'email', 'telephone']
    readonly_fields = ['code_devis', 'nom_complet', 'email', 'telephone', 'informations_supplementaires', 'created_at', 'updated_at']
    inlines = [DevisProduitInline]
    ordering = ['-created_at']

    fieldsets = (
        ('Informations client', {
            'fields': ('code_devis', 'nom_complet', 'email', 'telephone', 'informations_supplementaires')
        }),
        ('Statut', {
            'fields': ('statut', 'traite_par', 'date_reponse')
        }),
        ('Réponse admin', {
            'fields': ('montant_total_ht', 'montant_total_ttc', 'message_admin', 'date_expiration')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(DevisProduit)
class DevisProduitAdmin(admin.ModelAdmin):
    """Admin pour les produits de devis."""
    list_display = ['devis', 'marque', 'type_chaussure', 'services_list', 'prix_unitaire_ttc']
    list_filter = ['created_at']
    search_fields = ['devis__code_devis', 'marque', 'type_chaussure']
    readonly_fields = ['devis', 'marque', 'type_chaussure', 'services_souhaites', 'description', 'created_at']

    def services_list(self, obj):
        """Affiche la liste des services."""
        return ', '.join(obj.services_souhaites)
    services_list.short_description = 'Services'
