"""
Django Admin configuration for Users app.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserChangeForm
from .models import User, Role


class CustomUserChangeForm(UserChangeForm):
    """Formulaire personnalisé pour modifier le texte d'aide du champ usable_password."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Personnaliser le texte d'aide pour le champ usable_password
        if 'usable_password' in self.fields:
            self.fields['usable_password'].help_text = (
                "Indique si cet utilisateur peut se connecter avec un mot de passe. "
                "Décochez pour désactiver l'authentification par mot de passe pour cet utilisateur."
            )


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    """Admin configuration for Role model."""

    list_display = ['name', 'get_name_display', 'description']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for User model."""

    form = CustomUserChangeForm

    list_display = [
        'email', 'full_name', 'get_roles_display', 'is_verified', 'is_active', 'is_staff',
        'get_email_notifs_display', 'get_email_contact_display', 'created_at'
    ]
    list_filter = [
        'roles', 'is_verified', 'is_active', 'is_staff', 'is_blocked', 'is_deleted',
        'recevoir_emails_notifications', 'recevoir_emails_contact', 'created_at'
    ]
    search_fields = ['email', 'first_name', 'last_name', 'phone']
    ordering = ['-created_at']
    filter_horizontal = ['roles', 'groups', 'user_permissions']

    def get_roles_display(self, obj):
        """Affiche les rôles de l'utilisateur."""
        return ", ".join([role.get_name_display() for role in obj.roles.all()])
    get_roles_display.short_description = 'Roles'

    def get_email_notifs_display(self, obj):
        """Affiche la préférence email notifications seulement pour les admins."""
        from django.utils.html import format_html
        if obj.has_any_role(['ADMIN', 'SUPERADMIN']):
            if obj.recevoir_emails_notifications:
                return format_html('<span style="color: green;">✓</span>')
            else:
                return format_html('<span style="color: red;">✗</span>')
        return format_html('<span style="color: gray;">—</span>')
    get_email_notifs_display.short_description = 'Emails Notifs'

    def get_email_contact_display(self, obj):
        """Affiche la préférence email contact seulement pour les admins."""
        from django.utils.html import format_html
        if obj.has_any_role(['ADMIN', 'SUPERADMIN']):
            if obj.recevoir_emails_contact:
                return format_html('<span style="color: green;">✓</span>')
            else:
                return format_html('<span style="color: red;">✗</span>')
        return format_html('<span style="color: gray;">—</span>')
    get_email_contact_display.short_description = 'Emails Contact'

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone', 'date_of_birth')}),
        ('OTP & Verification', {'fields': ('is_verified', 'otp_code', 'otp_created_at')}),
        ('Roles & Permissions', {'fields': ('roles', 'is_active', 'is_blocked', 'is_deleted', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Email Notifications (Admin/SuperAdmin)', {
            'fields': ('recevoir_emails_notifications', 'recevoir_emails_contact'),
            'description': 'Configure les préférences de réception des emails pour les administrateurs. '
                          'Les deux options sont indépendantes : vous pouvez recevoir les notifications système, '
                          'les emails de contact, les deux, ou aucun.'
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined', 'deleted_at', 'created_at', 'updated_at')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'first_name', 'last_name', 'roles'),
        }),
    )

    readonly_fields = ['created_at', 'updated_at', 'last_login', 'date_joined', 'otp_created_at', 'deleted_at']
