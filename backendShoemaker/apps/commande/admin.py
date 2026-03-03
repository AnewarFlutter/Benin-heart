from django.contrib import admin
from django.utils.html import format_html
from django.urls import path
from django.template.response import TemplateResponse
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from .models import (
    EmailLog, MoyenPaiement, CodePromo, Commande,
    CommandeProduit, CommandeProduitService, CodeCollecte
)


class RevenueChartAdminView(admin.AdminSite):
    """Custom admin view for revenue chart."""
    pass


# Custom admin view for revenue chart
@staff_member_required
def revenue_chart_view(request):
    """View for displaying revenue chart in admin."""
    from django.utils import timezone
    from django.db.models import Sum, Count
    from django.db.models.functions import TruncDay, TruncMonth, TruncYear
    from datetime import datetime, timedelta
    import json

    # Parse query parameters
    days = request.GET.get('days', '31')
    start_date_str = request.GET.get('start_date')
    end_date_str = request.GET.get('end_date')

    today = timezone.now().date()

    # Determine date range
    if start_date_str and end_date_str:
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            start_date = today - timedelta(days=30)
            end_date = today
        period_days = (end_date - start_date).days
        if period_days <= 31:
            group_by = 'day'
        elif period_days <= 365:
            group_by = 'month'
        else:
            group_by = 'year'
    else:
        try:
            days = int(days)
        except ValueError:
            days = 31
        start_date = today - timedelta(days=days - 1)
        end_date = today
        group_by = 'day' if days <= 31 else ('month' if days <= 365 else 'year')

    # Base queryset - only paid orders
    queryset = Commande.objects.filter(
        statut_paiement='paye',
        created_at__date__gte=start_date,
        created_at__date__lte=end_date
    )

    # Group by period
    if group_by == 'day':
        trunc_func = TruncDay('created_at')
        date_format = '%Y-%m-%d'
    elif group_by == 'month':
        trunc_func = TruncMonth('created_at')
        date_format = '%Y-%m'
    else:
        trunc_func = TruncYear('created_at')
        date_format = '%Y'

    # Aggregate revenue by period
    revenue_data = queryset.annotate(
        period=trunc_func
    ).values('period').annotate(
        revenue=Sum('montant_final'),
        count=Count('id', distinct=True)
    ).order_by('period')

    # Format results
    results = []
    for item in revenue_data:
        if item['period']:
            results.append({
                'period': item['period'].strftime(date_format),
                'revenue': float(item['revenue'] or 0),
                'orders_count': item['count']
            })

    total_revenue = sum(item['revenue'] for item in results)
    total_orders = sum(item['orders_count'] for item in results)

    data = {
        'start_date': start_date.strftime('%Y-%m-%d'),
        'end_date': end_date.strftime('%Y-%m-%d'),
        'group_by': group_by,
        'total_revenue': total_revenue,
        'total_orders': total_orders,
        'results': results
    }

    context = {
        **admin.site.each_context(request),
        'title': 'Chiffre d\'affaires',
        'revenue_data': json.dumps(data),
        'current_days': days if not (start_date_str and end_date_str) else 'custom',
    }
    return TemplateResponse(request, 'admin/commande/revenue_chart.html', context)


@admin.register(MoyenPaiement)
class MoyenPaiementAdmin(admin.ModelAdmin):
    list_display = ['nom', 'code', 'actif', 'created_at']
    list_filter = ['actif', 'created_at']
    search_fields = ['nom', 'code']
    ordering = ['nom']


@admin.register(CodePromo)
class CodePromoAdmin(admin.ModelAdmin):
    list_display = [
        'code', 'type_reduction', 'valeur', 'contraintes_display',
        'date_debut', 'date_fin', 'actif_display'
    ]
    list_filter = ['actif', 'type_reduction', 'created_at']
    search_fields = ['code', 'description']
    ordering = ['-created_at']

    fieldsets = (
        ('Informations', {
            'fields': ('code', 'description')
        }),
        ('Réduction', {
            'fields': ('type_reduction', 'valeur')
        }),
        ('Contraintes d\'utilisation', {
            'fields': ('utilisation_max', 'max_uses_per_user', 'montant_minimum'),
            'description': 'Laissez ces champs vides pour aucune restriction.'
        }),
        ('Validité', {
            'fields': ('date_debut', 'date_fin', 'actif')
        }),
    )

    def actif_display(self, obj):
        """Affiche le statut actif avec couleur."""
        if obj.actif:
            return format_html(
                '<span style="color: green; font-weight: bold;">✓ Actif</span>'
            )
        return format_html(
            '<span style="color: red; font-weight: bold;">✗ Inactif</span>'
        )
    actif_display.short_description = 'Statut'

    def contraintes_display(self, obj):
        """Affiche les contraintes appliquées au code promo."""
        contraintes = []

        if obj.utilisation_max:
            contraintes.append(
                format_html(
                    '<span style="background: #2196F3; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-right: 3px;">'
                    'Max: {}x'
                    '</span>',
                    obj.utilisation_max
                )
            )

        if obj.max_uses_per_user:
            contraintes.append(
                format_html(
                    '<span style="background: #9C27B0; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px; margin-right: 3px;">'
                    '{}x/pers'
                    '</span>',
                    obj.max_uses_per_user
                )
            )

        if obj.montant_minimum:
            contraintes.append(
                format_html(
                    '<span style="background: #FF9800; color: white; padding: 2px 6px; border-radius: 3px; font-size: 10px;">'
                    'Min: {} FCFA'
                    '</span>',
                    obj.montant_minimum
                )
            )

        if not contraintes:
            return format_html(
                '<span style="color: #999; font-style: italic;">Aucune</span>'
            )

        return format_html(' '.join([str(c) for c in contraintes]))
    contraintes_display.short_description = 'Contraintes'


class CommandeProduitServiceInline(admin.TabularInline):
    model = CommandeProduitService
    extra = 0
    readonly_fields = ['service', 'nom_service', 'prix_ht', 'tva', 'montant_tva', 'prix_ttc']


class CommandeProduitInline(admin.TabularInline):
    model = CommandeProduit
    extra = 0
    readonly_fields = ['description', 'marque', 'modele', 'couleur', 'photo', 'note_utilisateur', 'prix_ht', 'tva', 'prix_ttc']


@admin.register(Commande)
class CommandeAdmin(admin.ModelAdmin):
    list_display = [
        'code_unique', 'user', 'montant_final', 'statut_paiement',
        'statut_commande', 'livreur_collecte_display', 'livreur_livraison_display',
        'date_collecte', 'creneau_display', 'created_at'
    ]
    list_filter = ['statut_paiement', 'statut_commande', 'moyen_paiement', 'delivery_person', 'delivery_person_livraison', 'created_at']
    search_fields = ['code_unique', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['code_unique', 'systeme_creneaux_info', 'created_at', 'updated_at', 'code_confirmation_livraison']
    ordering = ['-created_at']
    inlines = [CommandeProduitInline]
    autocomplete_fields = ['delivery_person', 'delivery_person_livraison']
    change_list_template = 'admin/commande/commande_changelist.html'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('revenue-chart/', self.admin_site.admin_view(revenue_chart_view), name='commande_revenue_chart'),
        ]
        return custom_urls + urls

    # Fieldsets de base (sera modifié dynamiquement par get_fieldsets)
    base_fieldsets = (
        ('Informations générales', {
            'fields': ('code_unique', 'user', 'created_at', 'updated_at')
        }),
        ('Montants', {
            'fields': ('montant_ht', 'montant_tva', 'montant_ttc', 'montant_reduction', 'montant_final')
        }),
        ('Paiement', {
            'fields': ('statut_paiement', 'moyen_paiement', 'code_promo')
        }),
        ('Statut', {
            'fields': ('statut_commande',)
        }),
        ('Livreur - Collecte', {
            'fields': (
                'delivery_person', 'date_assignation', 'date_confirmation_livreur', 'rappel_envoye'
            ),
            'description': 'Assignation et confirmation du livreur pour la collecte'
        }),
        ('Livreur - Livraison', {
            'fields': (
                'delivery_person_livraison', 'date_livraison', 'date_assignation_livraison',
                'date_livraison_effective', 'code_confirmation_livraison'
            ),
            'description': 'Assignation et confirmation du livreur pour la livraison'
        }),
        ('Collecte', {
            'fields': (
                'adresse_collecte', 'latitude', 'longitude',
                'telephone_collecte', 'date_collecte', 'note_collecte'
            )
        }),
    )

    def livreur_collecte_display(self, obj):
        """Affiche le livreur collecte avec statut."""
        if obj.delivery_person:
            if obj.date_confirmation_livreur:
                return format_html(
                    '<span style="color: green;">✓</span> {}',
                    obj.delivery_person.user.full_name
                )
            return format_html(
                '<span style="color: orange;">○</span> {}',
                obj.delivery_person.user.full_name
            )
        return format_html('<span style="color: #999;">—</span>')
    livreur_collecte_display.short_description = 'Livreur collecte'

    def livreur_livraison_display(self, obj):
        """Affiche le livreur livraison avec statut."""
        if obj.delivery_person_livraison:
            if obj.date_livraison_effective:
                return format_html(
                    '<span style="color: green;">✓</span> {}',
                    obj.delivery_person_livraison.user.full_name
                )
            return format_html(
                '<span style="color: blue;">○</span> {}',
                obj.delivery_person_livraison.user.full_name
            )
        return format_html('<span style="color: #999;">—</span>')
    livreur_livraison_display.short_description = 'Livreur livraison'

    def get_fieldsets(self, request, obj=None):
        """
        Ajuste dynamiquement les fieldsets selon la configuration du système de créneaux.
        Si ACTIVÉ: affiche le champ 'creneau' (ForeignKey)
        Si DÉSACTIVÉ: affiche le champ 'creneau_horaire' (texte libre)
        """
        fieldsets = list(self.base_fieldsets)

        try:
            from apps.creneaux.models import CreneauxConfig
            config = CreneauxConfig.get_config()

            if config.actif:
                # Système ACTIVÉ: afficher le champ ForeignKey 'creneau'
                fieldsets.append(
                    ('Créneau horaire', {
                        'fields': ('systeme_creneaux_info', 'creneau'),
                        'description': 'Sélectionnez un créneau dans la liste. Le champ texte sera rempli automatiquement.'
                    })
                )
            else:
                # Système DÉSACTIVÉ: afficher le champ texte 'creneau_horaire'
                fieldsets.append(
                    ('Créneau horaire', {
                        'fields': ('systeme_creneaux_info', 'creneau_horaire'),
                        'description': 'Saisissez le créneau horaire souhaité en texte libre (ex: "14h - 16h", "Entre 9h et 12h").'
                    })
                )
        except Exception:
            # En cas d'erreur, afficher les deux champs
            fieldsets.append(
                ('Créneau horaire', {
                    'fields': ('systeme_creneaux_info', 'creneau', 'creneau_horaire'),
                    'description': 'Erreur lors de la récupération de la configuration.'
                })
            )

        return fieldsets

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """
        Filtre les créneaux disponibles dans la liste déroulante.
        N'affiche que les créneaux futurs et actifs.
        """
        if db_field.name == "creneau":
            from apps.creneaux.models import Creneaux
            from django.utils import timezone

            # Filtrer pour n'afficher que les créneaux futurs et actifs
            kwargs["queryset"] = Creneaux.objects.filter(
                actif=True,
                date__gte=timezone.now().date()
            ).order_by('date', 'heure_debut')

            kwargs["help_text"] = (
                "Seuls les créneaux futurs et actifs sont affichés. "
                "Sélectionnez un créneau avec des places disponibles."
            )

        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def systeme_creneaux_info(self, obj):
        """Affiche l'état actuel du système de créneaux."""
        try:
            from apps.creneaux.models import CreneauxConfig
            config = CreneauxConfig.get_config()

            if config.actif:
                return format_html(
                    '<div style="padding: 10px; background-color: #e8f5e9; border-left: 4px solid #4caf50; margin: 10px 0;">'
                    '<strong style="color: #2e7d32;">✓ Système de créneaux ACTIVÉ</strong><br>'
                    '<span style="color: #555;">Le champ "Créneau" (liste déroulante) doit être rempli.<br>'
                    'Le champ "Créneau horaire" sera rempli automatiquement.</span>'
                    '</div>'
                )
            else:
                return format_html(
                    '<div style="padding: 10px; background-color: #fff3e0; border-left: 4px solid #ff9800; margin: 10px 0;">'
                    '<strong style="color: #e65100;">○ Système de créneaux DÉSACTIVÉ</strong><br>'
                    '<span style="color: #555;">Le champ "Créneau horaire" (texte libre) doit être rempli.<br>'
                    'Le champ "Créneau" peut rester vide.</span>'
                    '</div>'
                )
        except Exception:
            return format_html(
                '<div style="padding: 10px; background-color: #ffebee; border-left: 4px solid #f44336; margin: 10px 0;">'
                '<strong style="color: #c62828;">⚠ Erreur</strong><br>'
                '<span style="color: #555;">Impossible de récupérer la configuration du système de créneaux.</span>'
                '</div>'
            )
    systeme_creneaux_info.short_description = "État du système"

    def creneau_display(self, obj):
        """Affiche le créneau dans la liste avec icône."""
        if obj.creneau:
            # Système de créneaux utilisé
            disponible = obj.creneau.est_disponible()
            if disponible:
                icon = '<span style="color: green;">✓</span>'
            else:
                icon = '<span style="color: red;">✗</span>'
            return format_html(
                '{} {}',
                icon,
                obj.creneau_horaire or f"{obj.creneau.heure_debut.strftime('%H:%M')} - {obj.creneau.heure_fin.strftime('%H:%M')}"
            )
        elif obj.creneau_horaire:
            # Texte libre
            return format_html(
                '<span style="color: #ff9800;">○</span> {}',
                obj.creneau_horaire
            )
        else:
            return format_html('<span style="color: #999;">—</span>')
    creneau_display.short_description = "Créneau"

    def save_model(self, request, obj, form, change):
        """
        Validation avant sauvegarde selon la configuration du système de créneaux.
        Affiche un avertissement si le champ requis n'est pas rempli.
        """
        from django.contrib import messages

        try:
            from apps.creneaux.models import CreneauxConfig
            config = CreneauxConfig.get_config()

            if config.actif:
                # Système ACTIVÉ: creneau (ForeignKey) doit être rempli
                if not obj.creneau:
                    messages.warning(
                        request,
                        "⚠️ Le système de créneaux est activé mais aucun créneau n'a été sélectionné. "
                        "La commande sera sauvegardée mais le client n'aura pas de créneau défini."
                    )
                else:
                    # Vérifier si le créneau est encore disponible
                    if not obj.creneau.est_disponible():
                        messages.warning(
                            request,
                            f"⚠️ Le créneau sélectionné n'est plus disponible "
                            f"(places: {obj.creneau.reservations_actuelles}/{obj.creneau.capacite_max}). "
                            f"La commande sera quand même sauvegardée."
                        )
                    else:
                        messages.success(
                            request,
                            f"✓ Créneau sélectionné: {obj.creneau.date} "
                            f"{obj.creneau.heure_debut.strftime('%H:%M')} - {obj.creneau.heure_fin.strftime('%H:%M')} "
                            f"(Places restantes: {obj.creneau.places_restantes}/{obj.creneau.capacite_max})"
                        )
            else:
                # Système DÉSACTIVÉ: creneau_horaire (texte) doit être rempli
                if not obj.creneau_horaire:
                    messages.warning(
                        request,
                        "⚠️ Le système de créneaux est désactivé mais le champ 'Créneau horaire' est vide. "
                        "La commande sera sauvegardée mais sans information de créneau."
                    )
                else:
                    messages.success(
                        request,
                        f"✓ Créneau horaire (texte libre): {obj.creneau_horaire}"
                    )
        except Exception as e:
            messages.error(
                request,
                f"❌ Erreur lors de la vérification du système de créneaux: {str(e)}"
            )

        super().save_model(request, obj, form, change)


@admin.register(CommandeProduit)
class CommandeProduitAdmin(admin.ModelAdmin):
    list_display = ['commande', 'marque', 'modele', 'couleur', 'code_collecte_display', 'prix_ttc', 'created_at']
    list_filter = ['created_at', 'marque']
    search_fields = ['commande__code_unique', 'marque', 'modele', 'description', 'uuid']
    readonly_fields = ['created_at', 'updated_at', 'code_collecte_info']
    inlines = [CommandeProduitServiceInline]

    fieldsets = (
        ('Commande', {
            'fields': ('commande',)
        }),
        ('Produit', {
            'fields': ('description', 'marque', 'modele', 'couleur', 'photo', 'note_utilisateur')
        }),
        ('Tarification', {
            'fields': ('prix_ht', 'tva', 'prix_ttc')
        }),
        ('Code de collecte', {
            'fields': ('code_collecte_info',),
            'description': 'Code assigné à ce produit lors de la collecte'
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    def code_collecte_display(self, obj):
        """Affiche le code collecte assigné."""
        code = obj.code_collecte.first() if hasattr(obj, 'code_collecte') else None
        if code:
            return format_html(
                '<span style="background: #4CAF50; color: white; padding: 2px 6px; border-radius: 3px;">{}</span>',
                code.code
            )
        return format_html('<span style="color: #999;">—</span>')
    code_collecte_display.short_description = 'Code'

    def code_collecte_info(self, obj):
        """Affiche les informations du code collecte."""
        code = obj.code_collecte.first() if hasattr(obj, 'code_collecte') else None
        if code:
            return format_html(
                '<div style="padding: 10px; background: #e8f5e9; border-radius: 5px;">'
                '<strong>Code:</strong> {} <br>'
                '<strong>Généré par:</strong> {} <br>'
                '<strong>Date:</strong> {}'
                '</div>',
                code.code,
                code.genere_par.full_name if code.genere_par else '-',
                code.date_utilisation or code.created_at
            )
        return format_html('<span style="color: #999;">Aucun code assigné</span>')
    code_collecte_info.short_description = 'Code de collecte'


@admin.register(CommandeProduitService)
class CommandeProduitServiceAdmin(admin.ModelAdmin):
    list_display = ['commande_produit', 'nom_service', 'prix_ttc', 'created_at']
    list_filter = ['created_at']
    search_fields = ['commande_produit__commande__code_unique', 'nom_service']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CodeCollecte)
class CodeCollecteAdmin(admin.ModelAdmin):
    list_display = ['code', 'statut_display', 'genere_par_display', 'commande_produit_display', 'date_utilisation', 'created_at']
    list_filter = ['utilise', 'created_at', 'date_utilisation']
    search_fields = ['code', 'genere_par__email', 'commande_produit__commande__code_unique']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    autocomplete_fields = ['commande_produit']

    fieldsets = (
        ('Code de collecte', {
            'fields': ('code', 'genere_par', 'created_at'),
            'description': 'Code généré par le livreur lors de la collecte'
        }),
        ('Assignation au produit', {
            'fields': ('commande_produit', 'utilise', 'date_utilisation'),
            'description': 'Assignez ce code à un produit de commande'
        }),
    )

    def statut_display(self, obj):
        """Affiche le statut avec couleur."""
        if obj.utilise:
            return format_html(
                '<span style="background: #4CAF50; color: white; padding: 3px 8px; border-radius: 3px;">✓ Utilisé</span>'
            )
        return format_html(
            '<span style="background: #FF9800; color: white; padding: 3px 8px; border-radius: 3px;">○ Disponible</span>'
        )
    statut_display.short_description = 'Statut'

    def genere_par_display(self, obj):
        """Affiche le livreur qui a généré le code."""
        if obj.genere_par:
            return obj.genere_par.full_name
        return '-'
    genere_par_display.short_description = 'Généré par'

    def commande_produit_display(self, obj):
        """Affiche le produit assigné avec lien."""
        if obj.commande_produit:
            return format_html(
                '<a href="/admin/commande/commandeproduit/{}/change/">{} - {}</a>',
                obj.commande_produit.pk,
                obj.commande_produit.commande.code_unique,
                obj.commande_produit.marque or 'Produit'
            )
        return format_html('<span style="color: #999;">Non assigné</span>')
    commande_produit_display.short_description = 'Produit'
                

@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display = [
        'type_email_colored', 'destinataire', 'sujet_truncated',
        'statut_colored', 'date_envoi', 'created_at'
    ]
    list_filter = ['statut', 'type_email', 'created_at', 'date_envoi']
    search_fields = ['destinataire', 'sujet', 'contenu_text']
    readonly_fields = [
        'type_email', 'destinataire', 'sujet', 'contenu_html_preview',
        'contenu_text', 'statut', 'erreur', 'commande', 'date_envoi',
        'created_at', 'updated_at'
    ]
    ordering = ['-created_at']

    # Disable add/edit permissions - logs are read-only
    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        # Only superadmins can delete logs
        return request.user.is_superuser

    fieldsets = (
        ('Informations', {
            'fields': ('type_email', 'destinataire', 'sujet', 'commande')
        }),
        ('Contenu', {
            'fields': ('contenu_html_preview', 'contenu_text'),
            'classes': ('collapse',)
        }),
        ('Statut', {
            'fields': ('statut', 'date_envoi', 'erreur')
        }),
        ('Dates', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def type_email_colored(self, obj):
        """Display type with color coding."""
        colors = {
            'nouvelle_commande_admin': '#2196F3',
            'confirmation_commande_client': '#4CAF50',
            'assignation_livreur': '#FF9800',
            'en_attente_collecte': '#9C27B0',
            'rappel_collecte': '#F44336',
            'confirmation_livreur_admin': '#00BCD4',
            'collecte_effectuee_client': '#8BC34A',
            'collecte_effectuee_admin': '#3F51B5',
            'arrivee_atelier': '#FFC107',
            'assignation_livreur_livraison': '#FF5722',
            'livraison_effectuee_client': '#4CAF50',
            'livraison_effectuee_admin': '#009688',
            'contact_form': '#607D8B',
        }
        color = colors.get(obj.type_email, '#757575')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
            color,
            obj.get_type_email_display()
        )
    type_email_colored.short_description = 'Type'

    def statut_colored(self, obj):
        """Display status with color coding."""
        colors = {
            'envoye': '#4CAF50',
            'echec': '#F44336',
            'en_attente': '#FF9800',
        }
        color = colors.get(obj.statut, '#757575')
        return format_html(
            '<span style="color: {}; font-weight: bold;">● {}</span>',
            color,
            obj.get_statut_display()
        )
    statut_colored.short_description = 'Statut'

    def sujet_truncated(self, obj):
        """Truncate subject for list display."""
        if len(obj.sujet) > 50:
            return f"{obj.sujet[:50]}..."
        return obj.sujet
    sujet_truncated.short_description = 'Sujet'

    def contenu_html_preview(self, obj):
        """Display HTML content as preview."""
        return format_html(
            '<div style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; background: #f9f9f9;">{}</div>',
            obj.contenu_html
        )
    contenu_html_preview.short_description = 'Aperçu HTML'
