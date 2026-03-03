"""
Django Admin configuration for Contact app.
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Contact, ContactInfo


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    """Admin configuration for Contact model."""

    list_display = [
        'name', 'email', 'sujet', 'message_preview', 'created_at'
    ]
    list_filter = ['created_at']
    search_fields = ['name', 'email', 'sujet', 'message']
    readonly_fields = ['created_at', 'updated_at', 'message_full']
    ordering = ['-created_at']

    fieldsets = (
        ('Informations de contact', {
            'fields': ('name', 'email', 'sujet')
        }),
        ('Message', {
            'fields': ('message_full',)
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    def has_add_permission(self, request):
        """Disable adding contacts from admin (should come from website form)."""
        return False

    def has_change_permission(self, request, obj=None):
        """Allow viewing but not editing."""
        return False

    def has_delete_permission(self, request, obj=None):
        """Only superusers can delete contact messages."""
        return request.user.is_superuser

    def message_preview(self, obj):
        """Show first 50 characters of message."""
        if len(obj.message) > 50:
            return f"{obj.message[:50]}..."
        return obj.message
    message_preview.short_description = 'Message (aperçu)'

    def message_full(self, obj):
        """Display full message in read-only format."""
        return obj.message
    message_full.short_description = 'Message complet'


@admin.register(ContactInfo)
class ContactInfoAdmin(admin.ModelAdmin):
    """Admin configuration for ContactInfo model (singleton)."""

    list_display = [
        'adresse', 'ville', 'pays', 'updated_at'
    ]
    readonly_fields = ['created_at', 'updated_at']

    fieldsets = (
        ('Adresse', {
            'fields': ('adresse', 'ville', 'pays')
        }),
        ('Contact', {
            'fields': ('telephones', 'emails'),
            'description': 'Utilisez le format JSON. Ex: ["tel1", "tel2"]'
        }),
        ('Destinataires des formulaires de contact', {
            'fields': ('emails_destinataires_contact',),
            'description': 'Liste des emails qui recevront les notifications de formulaire de contact. Format JSON: ["email1@example.com", "email2@example.com"]'
        }),
        ('Informations complémentaires', {
            'fields': ('horaires', 'url_site'),
            'description': 'Horaires au format JSON. Ex: {"Lun - Ven": "9h00 - 18h00"}'
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    def has_add_permission(self, request):
        """Empêcher l'ajout si une instance existe déjà (singleton)."""
        if ContactInfo.objects.exists():
            return False
        return super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        """Empêcher la suppression (il doit toujours y avoir une instance)."""
        return False
