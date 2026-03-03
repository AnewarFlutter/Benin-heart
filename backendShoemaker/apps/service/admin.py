from django.contrib import admin
from .models import Service, ServiceCategory


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ['nom', 'ordre', 'image_preview', 'description', 'statut', 'services_count', 'created_at']
    list_filter = ['statut', 'created_at']
    search_fields = ['nom', 'description']
    list_editable = ['ordre']
    ordering = ['ordre', 'nom']

    fieldsets = (
        ('Informations générales', {
            'fields': ('nom', 'description', 'image', 'statut', 'ordre')
        }),
    )

    def services_count(self, obj):
        return obj.services.count()
    services_count.short_description = 'Nombre de services'

    def image_preview(self, obj):
        if obj.image:
            from django.utils.html import format_html
            return format_html('<img src="{}" style="max-height: 50px; max-width: 80px; object-fit: cover; border-radius: 4px;" />', obj.image.url)
        return '-'
    image_preview.short_description = 'Image'


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = [
       'nom', 'category', 'prix_minimum_ht', 'tva', 'prix_minimum_ttc',
        'delai_minimum_jours', 'delai_maximum_jours', 'statut', 'created_at'
    ]
    list_filter = ['statut', 'category', 'created_at']
    search_fields = ['nom', 'description']
    ordering = ['-created_at']
    readonly_fields = ['prix_minimum_ttc']

    fieldsets = (
        ('Informations générales', {
            'fields': ('nom', 'description', 'category', 'icone', 'statut')
        }),
        ('Tarification', {
            'fields': ('prix_minimum_ht', 'tva', 'prix_minimum_ttc'),
            'description': 'Le prix TTC est calculé automatiquement : HT × (1 + TVA/100)'
        }),
        ('Délais', {
            'fields': (
                'delai_minimum_jours',
                'delai_maximum_jours',
                'nombre_heures_delai_maximum'
            )
        }),
    )
