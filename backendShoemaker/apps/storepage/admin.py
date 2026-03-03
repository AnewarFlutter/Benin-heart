"""
Admin configuration for Storepage app
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import HeroBanner


@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    """Admin pour les bannières Hero."""

    list_display = [
        'ordre',
        'titre',
        'image_preview',
        'bouton_texte',
        'actif',
        'created_at'
    ]
    list_display_links = ['titre']
    list_filter = ['actif', 'created_at']
    search_fields = ['titre', 'description']
    list_editable = ['ordre', 'actif']
    ordering = ['ordre']

    fieldsets = (
        ('Contenu', {
            'fields': ('titre', 'description', 'image', 'image_preview_large')
        }),
        ('Bouton (optionnel)', {
            'fields': ('bouton_texte', 'bouton_lien'),
            'description': 'Par défaut: "Découvrir nos services" → https://shoemaker.cireur.test-vps-online.xyz/fr/services'
        }),
        ('Paramètres', {
            'fields': ('ordre', 'actif')
        }),
    )

    readonly_fields = ['image_preview_large']

    def image_preview(self, obj):
        """Prévisualisation miniature de l'image dans la liste."""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 100px; object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return '-'
    image_preview.short_description = 'Aperçu'

    def image_preview_large(self, obj):
        """Prévisualisation grande de l'image dans le formulaire."""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 200px; max-width: 400px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />',
                obj.image.url
            )
        return 'Aucune image'
    image_preview_large.short_description = 'Aperçu de l\'image'
