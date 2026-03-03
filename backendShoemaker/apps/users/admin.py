"""
Django Admin configuration for Users app.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserChangeForm
from .models import User, DeliveryPerson, Role


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


@admin.register(DeliveryPerson)
class DeliveryPersonAdmin(admin.ModelAdmin):
    """Admin configuration for DeliveryPerson model."""
    from django.utils.html import format_html

    list_display = ['user', 'is_available', 'commandes_collecte_count', 'commandes_livraison_count', 'created_at']
    list_filter = ['is_available', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'uuid']
    ordering = ['-created_at']

    fieldsets = (
        ('Utilisateur', {'fields': ('user',)}),
        ('Disponibilité', {'fields': ('is_available',)}),
        ('Localisation', {'fields': ('current_location_lat', 'current_location_lon')}),
        ('Statistiques', {
            'fields': ('commandes_collecte_info', 'commandes_livraison_info'),
            'description': 'Résumé des commandes assignées à ce livreur'
        }),
        ('Dates', {'fields': ('created_at', 'updated_at')}),
    )

    readonly_fields = ['created_at', 'updated_at', 'commandes_collecte_info', 'commandes_livraison_info']

    def commandes_collecte_count(self, obj):
        """Nombre de commandes collecte assignées."""
        count = obj.commandes_collecte.count()
        en_attente = obj.commandes_collecte.filter(statut_commande='en_attente_collecte').count()
        if en_attente > 0:
            from django.utils.html import format_html
            return format_html('{} <span style="color: orange; font-weight: bold;">({} en attente)</span>', count, en_attente)
        return count
    commandes_collecte_count.short_description = 'Collectes'

    def commandes_livraison_count(self, obj):
        """Nombre de commandes livraison assignées."""
        count = obj.commandes_livraison.count()
        en_cours = obj.commandes_livraison.filter(statut_commande='en_cours_livraison').count()
        if en_cours > 0:
            from django.utils.html import format_html
            return format_html('{} <span style="color: blue; font-weight: bold;">({} en cours)</span>', count, en_cours)
        return count
    commandes_livraison_count.short_description = 'Livraisons'

    def commandes_collecte_info(self, obj):
        """Affiche les commandes collecte assignées."""
        from django.utils.html import format_html
        commandes = obj.commandes_collecte.all().order_by('-created_at')[:10]
        if not commandes:
            return "Aucune commande de collecte assignée"

        html = '<table style="width:100%; border-collapse: collapse;">'
        html += '<tr style="background: #f5f5f5;"><th style="padding: 8px; text-align: left;">Code</th><th style="padding: 8px;">Client</th><th style="padding: 8px;">Statut</th><th style="padding: 8px;">Date collecte</th></tr>'

        for cmd in commandes:
            statut_color = {
                'en_attente_collecte': '#FF9800',
                'collecte_effectuee': '#4CAF50',
            }.get(cmd.statut_commande, '#999')

            html += f'<tr style="border-bottom: 1px solid #ddd;">'
            html += f'<td style="padding: 8px;"><a href="/admin/commande/commande/{cmd.pk}/change/">{cmd.code_unique}</a></td>'
            html += f'<td style="padding: 8px;">{cmd.user.full_name if cmd.user else "-"}</td>'
            html += f'<td style="padding: 8px;"><span style="color: {statut_color}; font-weight: bold;">{cmd.get_statut_commande_display()}</span></td>'
            html += f'<td style="padding: 8px;">{cmd.date_collecte}</td>'
            html += '</tr>'

        html += '</table>'
        return format_html(html)
    commandes_collecte_info.short_description = 'Commandes collecte récentes'

    def commandes_livraison_info(self, obj):
        """Affiche les commandes livraison assignées."""
        from django.utils.html import format_html
        commandes = obj.commandes_livraison.all().order_by('-created_at')[:10]
        if not commandes:
            return "Aucune commande de livraison assignée"

        html = '<table style="width:100%; border-collapse: collapse;">'
        html += '<tr style="background: #f5f5f5;"><th style="padding: 8px; text-align: left;">Code</th><th style="padding: 8px;">Client</th><th style="padding: 8px;">Statut</th><th style="padding: 8px;">Date livraison</th></tr>'

        for cmd in commandes:
            statut_color = {
                'en_cours_livraison': '#2196F3',
                'livraison_effectuee': '#4CAF50',
            }.get(cmd.statut_commande, '#999')

            html += f'<tr style="border-bottom: 1px solid #ddd;">'
            html += f'<td style="padding: 8px;"><a href="/admin/commande/commande/{cmd.pk}/change/">{cmd.code_unique}</a></td>'
            html += f'<td style="padding: 8px;">{cmd.user.full_name if cmd.user else "-"}</td>'
            html += f'<td style="padding: 8px;"><span style="color: {statut_color}; font-weight: bold;">{cmd.get_statut_commande_display()}</span></td>'
            html += f'<td style="padding: 8px;">{cmd.date_livraison or "-"}</td>'
            html += '</tr>'

        html += '</table>'
        return format_html(html)
    commandes_livraison_info.short_description = 'Commandes livraison récentes'
