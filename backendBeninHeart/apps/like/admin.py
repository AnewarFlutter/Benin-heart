from django.contrib import admin
from .models import Like, Match


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ['expediteur', 'type_action', 'destinataire', 'created_at']
    list_filter = ['type_action', 'created_at']
    search_fields = ['expediteur__email', 'destinataire__email']
    ordering = ['-created_at']
    readonly_fields = ['uuid', 'created_at', 'updated_at']


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ['user1', 'user2', 'est_actif', 'created_at']
    list_filter = ['est_actif']
    search_fields = ['user1__email', 'user2__email']
    ordering = ['-created_at']
    readonly_fields = ['uuid', 'created_at', 'updated_at']
