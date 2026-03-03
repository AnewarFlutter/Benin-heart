"""
Celery tasks for async operations (email sending, notifications, etc.)
"""
from celery import shared_task
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_otp_email_task(self, email: str, otp_code: str, user_name: str, is_password_reset: bool = False):
    """
    Tâche asynchrone pour envoyer un email OTP avec template HTML.

    Args:
        email (str): Adresse email du destinataire
        otp_code (str): Code OTP à 6 chiffres
        user_name (str): Nom de l'utilisateur
        is_password_reset (bool): True si c'est pour réinitialisation de mot de passe

    Returns:
        dict: Résultat de l'envoi
    """
    try:
        # Choisir le template et le sujet selon le type
        if is_password_reset:
            template_name = 'emails/password_reset.html'
            subject = 'Réinitialisation de mot de passe - Shoemaker'
        else:
            template_name = 'emails/otp_verification.html'
            subject = 'Code de vérification - Shoemaker'

        # Contexte pour le template
        context = {
            'user_name': user_name,
            'otp_code': otp_code,
            'expiry_minutes': 10,  # Durée d'expiration du code
        }

        # Rendre le template HTML
        html_content = render_to_string(template_name, context)

        # Créer l'email
        email_message = EmailMessage(
            subject=subject,
            body=html_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )
        email_message.content_subtype = 'html'  # Important pour envoyer du HTML

        # Envoyer l'email
        email_message.send(fail_silently=False)

        logger.info(f"✅ OTP email envoyé avec succès à {email} (template: {template_name})")
        return {
            'status': 'success',
            'email': email,
            'message': 'Email envoyé avec succès',
            'template': template_name
        }

    except Exception as exc:
        logger.error(f"❌ Erreur lors de l'envoi de l'email OTP à {email}: {exc}")

        # Retry the task
        try:
            raise self.retry(exc=exc)
        except self.MaxRetriesExceededError:
            logger.error(f"❌ Nombre maximum de tentatives atteint pour {email}")
            return {
                'status': 'failed',
                'email': email,
                'error': str(exc)
            }


@shared_task
def send_welcome_email_task(email: str, user_name: str):
    """
    Tâche asynchrone pour envoyer un email de bienvenue après vérification du compte.

    Args:
        email (str): Adresse email du destinataire
        user_name (str): Nom de l'utilisateur
    """
    try:
        subject = 'Bienvenue sur Shoemaker - Compte activé'
        template_name = 'emails/welcome.html'

        # Contexte pour le template
        context = {
            'user_name': user_name,
        }

        # Rendre le template HTML
        html_content = render_to_string(template_name, context)

        # Créer et envoyer l'email
        email_message = EmailMessage(
            subject=subject,
            body=html_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )
        email_message.content_subtype = 'html'
        email_message.send(fail_silently=False)

        logger.info(f"✅ Email de bienvenue envoyé à {email}")
        return {
            'status': 'success',
            'email': email,
            'template': template_name
        }

    except Exception as exc:
        logger.error(f"❌ Erreur lors de l'envoi de l'email de bienvenue à {email}: {exc}")
        return {
            'status': 'failed',
            'email': email,
            'error': str(exc)
        }


@shared_task
def send_password_reset_confirmation_email_task(email: str, user_name: str):
    """
    Tâche asynchrone pour envoyer un email de confirmation après réinitialisation du mot de passe.

    Args:
        email (str): Adresse email du destinataire
        user_name (str): Nom de l'utilisateur
    """
    try:
        subject = 'Mot de passe réinitialisé - Shoemaker'
        template_name = 'emails/password_reset_confirmation.html'

        # Contexte pour le template
        context = {
            'user_name': user_name,
        }

        # Rendre le template HTML
        html_content = render_to_string(template_name, context)

        # Créer et envoyer l'email
        email_message = EmailMessage(
            subject=subject,
            body=html_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )
        email_message.content_subtype = 'html'
        email_message.send(fail_silently=False)

        logger.info(f"✅ Email de confirmation de réinitialisation envoyé à {email}")
        return {
            'status': 'success',
            'email': email,
            'template': template_name
        }

    except Exception as exc:
        logger.error(f"❌ Erreur lors de l'envoi de l'email de confirmation à {email}: {exc}")
        return {
            'status': 'failed',
            'email': email,
            'error': str(exc)
        }
