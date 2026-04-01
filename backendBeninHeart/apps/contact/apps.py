"""
Django app configuration for Contact app.
"""
from django.apps import AppConfig


class ContactConfig(AppConfig):
    """Configuration for the Contact application."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.contact'
    verbose_name = 'Contact'

    def ready(self):
        """
        Import signals when the app is ready.
        This ensures that signal handlers are registered.
        """
        import apps.contact.infrastructure.signals  # noqa: F401
