from django.contrib import admin
from .models import Profil, PhotoProfil


class PhotoProfilInline(admin.TabularInline):
    model = PhotoProfil
    extra = 0
    fields = ['image', 'ordre', 'est_principale']


@admin.register(Profil)
class ProfilAdmin(admin.ModelAdmin):
    list_display = ['prenom', 'user', 'genre', 'ville', 'statut', 'est_verifie', 'est_en_ligne', 'created_at']
    list_filter = ['genre', 'statut', 'est_verifie', 'est_en_ligne', 'pays']
    search_fields = ['prenom', 'user__email', 'ville']
    readonly_fields = ['uuid', 'created_at', 'updated_at', 'derniere_activite']
    list_editable = ['statut', 'est_verifie']
    ordering = ['-created_at']
    inlines = [PhotoProfilInline]
    fieldsets = (
        ('Identité', {
            'fields': ('uuid', 'user', 'prenom', 'date_naissance', 'genre', 'recherche')
        }),
        ('Localisation', {
            'fields': ('ville', 'pays', 'latitude', 'longitude')
        }),
        ('Présentation', {
            'fields': ('bio', 'photo_principale', 'video_presentation')
        }),
        ('Préférences', {
            'fields': ('age_min', 'age_max', 'distance_max')
        }),
        ('Statut', {
            'fields': ('statut', 'est_verifie', 'est_en_ligne', 'derniere_activite', 'created_at', 'updated_at')
        }),
    )


@admin.register(PhotoProfil)
class PhotoProfilAdmin(admin.ModelAdmin):
    list_display = ['profil', 'ordre', 'est_principale', 'created_at']
    list_filter = ['est_principale']
    ordering = ['profil', 'ordre']
