"""
Celery tasks for commande app
"""
from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags
from django.utils import timezone
from apps.users.models import User


def get_admins_for_notifications():
    """
    Get list of admins/superadmins who should receive notification emails.

    Returns:
        QuerySet of User objects filtered by email preferences
    """
    admins = User.objects.filter(
        roles__name__in=['ADMIN', 'SUPERADMIN'],
        recevoir_emails_notifications=True
    ).distinct()

    return admins


def get_emails_for_contact_form():
    """
    Get list of emails that should receive contact form notifications.

    Returns:
        List of email addresses from ContactInfo model
    """
    from apps.contact.models import ContactInfo

    try:
        contact_info = ContactInfo.get_instance()
        return contact_info.emails_destinataires_contact if contact_info.emails_destinataires_contact else []
    except Exception:
        return []


def log_and_send_email(type_email, destinataire, sujet, html_message, plain_message, commande_id=None):
    """
    Log email and send it. Handles both success and failure cases.

    Args:
        type_email: Type d'email (from EmailLog.TYPE_EMAIL_CHOICES)
        destinataire: Email address of recipient
        sujet: Email subject
        html_message: HTML content
        plain_message: Plain text content
        commande_id: Optional commande ID to link to

    Returns:
        EmailLog object
    """
    from .models import EmailLog, Commande

    # Create email log entry
    email_log = EmailLog.objects.create(
        type_email=type_email,
        destinataire=destinataire,
        sujet=sujet,
        contenu_html=html_message,
        contenu_text=plain_message,
        statut='en_attente',
        commande_id=commande_id
    )

    try:
        # Send email
        email = EmailMultiAlternatives(
            subject=sujet,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[destinataire]
        )
        email.attach_alternative(html_message, "text/html")
        email.send()

        # Update log as success
        email_log.statut = 'envoye'
        email_log.date_envoi = timezone.now()
        email_log.save()

    except Exception as e:
        # Update log as failed
        email_log.statut = 'echec'
        email_log.erreur = str(e)
        email_log.save()
        raise

    return email_log


@shared_task(bind=True, max_retries=3)
def send_new_commande_notification_to_admins(self, commande_id):
    """
    Send email notification to all admins and superadmins when a new commande is created.
    """
    try:
        from .models import Commande

        commande = Commande.objects.select_related('user', 'moyen_paiement').get(id=commande_id)

        # Get admins who should receive notifications
        admins = get_admins_for_notifications()

        if not admins.exists():
            return "No admins found with notification preferences enabled"

        # Render email template
        context = {
            'commande': commande,
            'user': commande.user,
            'montant_final': commande.montant_final,
            'code_unique': commande.code_unique,
            'nombre_produits': commande.produits.count(),
            'site_url': settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost:8000'
        }

        html_message = render_to_string('commande/emails/nouvelle_commande_admin.html', context)
        plain_message = strip_tags(html_message)
        subject = f'Nouvelle commande #{commande.code_unique}'

        # Send to each admin and log
        sent_count = 0
        for admin in admins:
            if admin.email:
                log_and_send_email(
                    type_email='nouvelle_commande_admin',
                    destinataire=admin.email,
                    sujet=subject,
                    html_message=html_message,
                    plain_message=plain_message,
                    commande_id=commande_id
                )
                sent_count += 1

        return f"Email sent to {sent_count} admins"

    except Exception as exc:
        # Retry after 60 seconds if failed
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_commande_confirmation_to_client(self, commande_id):
    """
    Send order confirmation email to the client.
    """
    try:
        from .models import Commande

        commande = Commande.objects.select_related(
            'user',
            'moyen_paiement',
            'code_promo'
        ).prefetch_related('produits__services').get(id=commande_id)

        if not commande.user.email:
            return "Client has no email"

        # Render email template
        context = {
            'commande': commande,
            'user': commande.user,
            'produits': commande.produits.all(),
            'site_url': settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost:8000'
        }

        html_message = render_to_string('commande/emails/confirmation_commande_client.html', context)
        plain_message = strip_tags(html_message)
        subject = f'Confirmation de votre commande #{commande.code_unique}'

        # Send and log
        log_and_send_email(
            type_email='confirmation_commande_client',
            destinataire=commande.user.email,
            sujet=subject,
            html_message=html_message,
            plain_message=plain_message,
            commande_id=commande_id
        )

        return f"Confirmation email sent to {commande.user.email}"

    except Exception as exc:
        # Retry after 60 seconds if failed
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_delivery_assignment_notification(self, commande_id):
    """
    Send email notification to delivery person when assigned to a commande.
    """
    try:
        from .models import Commande

        commande = Commande.objects.select_related(
            'user',
            'delivery_person__user',
            'moyen_paiement'
        ).prefetch_related('produits').get(id=commande_id)

        if not commande.delivery_person:
            return "No delivery person assigned"

        delivery_person_email = commande.delivery_person.user.email

        if not delivery_person_email:
            return "Delivery person has no email"

        # Render email template
        context = {
            'commande': commande,
            'livreur': commande.delivery_person,
            'client': commande.user,
            'nombre_produits': commande.produits.count(),
            'site_url': settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost:8000'
        }

        html_message = render_to_string('commande/emails/assignation_livreur.html', context)
        plain_message = strip_tags(html_message)

        subject = f'Nouvelle commande assignée #{commande.code_unique}'

        # Create email with HTML content
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[delivery_person_email]
        )
        email.attach_alternative(html_message, "text/html")
        email.send()

        return f"Assignment notification sent to {delivery_person_email}"

    except Exception as exc:
        # Retry after 60 seconds if failed
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_waiting_for_pickup_notification(self, commande_id):
    """
    Send email to client when delivery person confirms and commande is waiting for pickup.
    """
    try:
        from .models import Commande

        commande = Commande.objects.select_related(
            'user',
            'delivery_person__user'
        ).get(id=commande_id)

        if not commande.user.email:
            return "Client has no email"

        # Render email template
        context = {
            'commande': commande,
            'user': commande.user,
            'livreur': commande.delivery_person,
            'site_url': settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost:8000'
        }

        html_message = render_to_string('commande/emails/en_attente_collecte.html', context)
        plain_message = strip_tags(html_message)

        subject = f'Votre commande #{commande.code_unique} - En attente de collecte'

        # Create email with HTML content
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[commande.user.email]
        )
        email.attach_alternative(html_message, "text/html")
        email.send()

        return f"Waiting for pickup notification sent to {commande.user.email}"

    except Exception as exc:
        # Retry after 60 seconds if failed
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_pickup_reminder(self, commande_id):
    """
    Send reminder email to client 1 hour before scheduled pickup.
    """
    try:
        from .models import Commande

        commande = Commande.objects.select_related(
            'user',
            'delivery_person__user'
        ).get(id=commande_id)

        # Check if reminder was already sent
        if commande.rappel_envoye:
            return "Reminder already sent"

        if not commande.user.email:
            return "Client has no email"

        # Render email template
        context = {
            'commande': commande,
            'user': commande.user,
            'livreur': commande.delivery_person,
            'site_url': settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost:8000'
        }

        html_message = render_to_string('commande/emails/rappel_collecte.html', context)
        plain_message = strip_tags(html_message)

        subject = f'Rappel - Collecte dans 1h pour votre commande #{commande.code_unique}'

        # Create email with HTML content
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[commande.user.email]
        )
        email.attach_alternative(html_message, "text/html")
        email.send()

        # Mark reminder as sent
        commande.rappel_envoye = True
        commande.save()

        return f"Pickup reminder sent to {commande.user.email}"

    except Exception as exc:
        # Retry after 60 seconds if failed
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_delivery_confirmation_to_admins(self, commande_id):
    """
    Send email notification to admins when delivery person confirms the commande.
    """
    try:
        from .models import Commande

        commande = Commande.objects.select_related(
            'user',
            'delivery_person__user',
            'moyen_paiement'
        ).get(id=commande_id)

        # Get all admins and superadmins
        admins = User.objects.filter(roles__name__in=['ADMIN', 'SUPERADMIN']).distinct()

        if not admins.exists():
            return "No admins found"

        admin_emails = [admin.email for admin in admins if admin.email]

        if not admin_emails:
            return "No admin emails found"

        # Render email template
        context = {
            'commande': commande,
            'client': commande.user,
            'livreur': commande.delivery_person,
            'site_url': settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost:8000'
        }

        html_message = render_to_string('commande/emails/confirmation_livreur_admin.html', context)
        plain_message = strip_tags(html_message)

        subject = f'Commande #{commande.code_unique} confirmée par le livreur'

        # Create email with HTML content
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=admin_emails
        )
        email.attach_alternative(html_message, "text/html")
        email.send()

        return f"Delivery confirmation sent to {len(admin_emails)} admins"

    except Exception as exc:
        # Retry after 60 seconds if failed
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_collection_completed_notification_to_client(self, commande_id):
    """
    Send email to client when collection is completed.
    """
    try:
        from .models import Commande

        commande = Commande.objects.select_related(
            'user',
            'delivery_person__user'
        ).prefetch_related('produits').get(id=commande_id)

        if not commande.user.email:
            return "Client has no email"

        # Render email template
        context = {
            'commande': commande,
            'user': commande.user,
            'livreur': commande.delivery_person,
            'nombre_produits': commande.produits.count(),
            'site_url': settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost:8000'
        }

        html_message = render_to_string('commande/emails/collecte_effectuee_client.html', context)
        plain_message = strip_tags(html_message)

        subject = f'Votre commande #{commande.code_unique} - Collecte effectuée'

        # Create email with HTML content
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[commande.user.email]
        )
        email.attach_alternative(html_message, "text/html")
        email.send()

        return f"Collection completed notification sent to {commande.user.email}"

    except Exception as exc:
        # Retry after 60 seconds if failed
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_collection_completed_notification_to_admins(self, commande_id):
    """
    Send email notification to admins when collection is completed.
    """
    try:
        from .models import Commande

        commande = Commande.objects.select_related(
            'user',
            'delivery_person__user',
            'moyen_paiement'
        ).prefetch_related('produits').get(id=commande_id)

        # Get all admins and superadmins
        admins = User.objects.filter(roles__name__in=['ADMIN', 'SUPERADMIN']).distinct()

        if not admins.exists():
            return "No admins found"

        admin_emails = [admin.email for admin in admins if admin.email]

        if not admin_emails:
            return "No admin emails found"

        # Render email template
        context = {
            'commande': commande,
            'client': commande.user,
            'livreur': commande.delivery_person,
            'nombre_produits': commande.produits.count(),
            'site_url': settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost:8000'
        }

        html_message = render_to_string('commande/emails/collecte_effectuee_admin.html', context)
        plain_message = strip_tags(html_message)

        subject = f'Commande #{commande.code_unique} - Collecte effectuée'

        # Create email with HTML content
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=admin_emails
        )
        email.attach_alternative(html_message, "text/html")
        email.send()

        return f"Collection completed notification sent to {len(admin_emails)} admins"

    except Exception as exc:
        # Retry after 60 seconds if failed
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_workshop_arrival_notification(self, commande_id):
    """
    Send email to client when commande arrives at workshop (status changes to 'en_cours').
    """
    try:
        from .models import Commande

        commande = Commande.objects.select_related(
            'user'
        ).prefetch_related('produits').get(id=commande_id)

        if not commande.user.email:
            return "Client has no email"

        # Render email template
        context = {
            'commande': commande,
            'user': commande.user,
            'nombre_produits': commande.produits.count(),
            'site_url': settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost:8000'
        }

        html_message = render_to_string('commande/emails/arrivee_atelier.html', context)
        plain_message = strip_tags(html_message)

        subject = f'Votre commande #{commande.code_unique} - Prise en charge à l\'atelier'

        # Create email with HTML content
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[commande.user.email]
        )
        email.attach_alternative(html_message, "text/html")
        email.send()

        return f"Workshop arrival notification sent to {commande.user.email}"

    except Exception as exc:
        # Retry after 60 seconds if failed
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_delivery_assignment_notification_livraison(self, commande_id):
    """
    Send email notification to delivery person when assigned to deliver a commande.
    """
    try:
        from .models import Commande

        commande = Commande.objects.select_related(
            'user',
            'delivery_person_livraison__user',
            'moyen_paiement'
        ).prefetch_related('produits').get(id=commande_id)

        if not commande.delivery_person_livraison:
            return "No delivery person assigned for delivery"

        delivery_person_email = commande.delivery_person_livraison.user.email

        if not delivery_person_email:
            return "Delivery person has no email"

        # Render email template
        context = {
            'commande': commande,
            'livreur': commande.delivery_person_livraison,
            'client': commande.user,
            'nombre_produits': commande.produits.count(),
            'site_url': settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost:8000'
        }

        html_message = render_to_string('commande/emails/assignation_livreur_livraison.html', context)
        plain_message = strip_tags(html_message)

        subject = f'Livraison assignée - Commande #{commande.code_unique}'

        # Create email with HTML content
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[delivery_person_email]
        )
        email.attach_alternative(html_message, "text/html")
        email.send()

        return f"Delivery assignment notification sent to {delivery_person_email}"

    except Exception as exc:
        # Retry after 60 seconds if failed
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_delivery_completed_notification_to_client(self, commande_id):
    """
    Send email to client when delivery is completed.
    """
    try:
        from .models import Commande

        commande = Commande.objects.select_related(
            'user',
            'delivery_person_livraison__user'
        ).prefetch_related('produits').get(id=commande_id)

        if not commande.user.email:
            return "Client has no email"

        # Render email template
        context = {
            'commande': commande,
            'user': commande.user,
            'livreur': commande.delivery_person_livraison,
            'nombre_produits': commande.produits.count(),
            'site_url': settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost:8000'
        }

        html_message = render_to_string('commande/emails/livraison_effectuee_client.html', context)
        plain_message = strip_tags(html_message)

        subject = f'Votre commande #{commande.code_unique} - Livraison effectuée'

        # Create email with HTML content
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[commande.user.email]
        )
        email.attach_alternative(html_message, "text/html")
        email.send()

        return f"Delivery completed notification sent to {commande.user.email}"

    except Exception as exc:
        # Retry after 60 seconds if failed
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_delivery_completed_notification_to_admins(self, commande_id):
    """
    Send email notification to admins when delivery is completed.
    """
    try:
        from .models import Commande

        commande = Commande.objects.select_related(
            'user',
            'delivery_person_livraison__user',
            'moyen_paiement'
        ).prefetch_related('produits').get(id=commande_id)

        # Get all admins and superadmins
        admins = User.objects.filter(roles__name__in=['ADMIN', 'SUPERADMIN']).distinct()

        if not admins.exists():
            return "No admins found"

        admin_emails = [admin.email for admin in admins if admin.email]

        if not admin_emails:
            return "No admin emails found"

        # Render email template
        context = {
            'commande': commande,
            'client': commande.user,
            'livreur': commande.delivery_person_livraison,
            'nombre_produits': commande.produits.count(),
            'site_url': settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost:8000'
        }

        html_message = render_to_string('commande/emails/livraison_effectuee_admin.html', context)
        plain_message = strip_tags(html_message)

        subject = f'Commande #{commande.code_unique} - Livraison effectuée'

        # Create email with HTML content
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=admin_emails
        )
        email.attach_alternative(html_message, "text/html")
        email.send()

        return f"Delivery completed notification sent to {len(admin_emails)} admins"

    except Exception as exc:
        # Retry after 60 seconds if failed
        raise self.retry(exc=exc, countdown=60)


@shared_task
def check_and_send_pickup_reminders():
    """
    Periodic task to check for commandes that need pickup reminder (1 hour before).
    This task should be run every 15 minutes by Celery Beat.
    """
    from django.utils import timezone
    from datetime import timedelta
    from .models import Commande

    now = timezone.now()

    # Find commandes where pickup is in approximately 1 hour
    # Check for pickups between 55 minutes and 1 hour 5 minutes from now
    start_time = now + timedelta(minutes=55)
    end_time = now + timedelta(minutes=65)

    commandes = Commande.objects.filter(
        statut_commande='en_collecte',
        rappel_envoye=False,
        date_collecte=start_time.date()
    ).select_related('user', 'delivery_person__user')

    count = 0
    for commande in commandes:
        # Parse creneau_horaire to get start time
        # Expected format: "HH:MM-HH:MM" or "HHhMM-HHhMM"
        try:
            creneau_start = commande.creneau_horaire.split('-')[0].strip()
            # Handle both "09:00" and "09h00" formats
            creneau_start = creneau_start.replace('h', ':')
            hour, minute = map(int, creneau_start.split(':'))

            # Combine date and time
            from datetime import datetime
            pickup_datetime = timezone.make_aware(
                datetime.combine(commande.date_collecte, datetime.min.time().replace(hour=hour, minute=minute))
            )

            # Check if pickup is within our time window
            if start_time <= pickup_datetime <= end_time:
                send_pickup_reminder.delay(commande.id)
                count += 1
        except (ValueError, IndexError, AttributeError):
            # Skip if creneau format is invalid
            continue

    return f"Sent {count} pickup reminders"


@shared_task(bind=True, max_retries=3)
def send_contact_form_to_admins(self, contact_id):
    """
    Send contact form notification to configured email addresses.

    Args:
        contact_id: ID of the Contact instance
    """
    from apps.contact.models import Contact

    try:
        contact = Contact.objects.get(id=contact_id)
    except Contact.DoesNotExist:
        return f"Contact {contact_id} not found"

    # Get email addresses configured to receive contact form notifications
    destinataire_emails = get_emails_for_contact_form()

    if not destinataire_emails:
        return "No email addresses configured to receive contact form notifications"

    sent_count = 0
    for destinataire_email in destinataire_emails:
        context = {
            'contact_name': contact.name,
            'contact_email': contact.email,
            'contact_phone': contact.phone,
            'contact_sujet': contact.sujet,
            'contact_message': contact.message,
            'contact_created_at': contact.created_at,
        }

        html_message = render_to_string('emails/contact_form_admin.html', context)
        plain_message = strip_tags(html_message)

        try:
            log_and_send_email(
                type_email='contact_form',
                destinataire=destinataire_email,
                sujet=f'Nouveau message de contact - {contact.sujet}',
                html_message=html_message,
                plain_message=plain_message,
                commande_id=None
            )
            sent_count += 1
        except Exception as e:
            # Log error but continue sending to other emails
            print(f"Failed to send contact form email to {destinataire_email}: {str(e)}")
            continue

    return f"Contact form notification sent to {sent_count} recipient(s)"


@shared_task(bind=True, max_retries=3)
def send_contact_confirmation_to_client(self, contact_id):
    """
    Send confirmation email to client that their contact message was received.

    Args:
        contact_id: ID of the Contact instance
    """
    from apps.contact.models import Contact

    try:
        contact = Contact.objects.get(id=contact_id)
    except Contact.DoesNotExist:
        return f"Contact {contact_id} not found"

    context = {
        'contact_name': contact.name,
        'contact_sujet': contact.sujet,
        'contact_message': contact.message,
    }

    html_message = render_to_string('emails/contact_confirmation_client.html', context)
    plain_message = strip_tags(html_message)

    try:
        log_and_send_email(
            type_email='contact_form',
            destinataire=contact.email,
            sujet='Confirmation de réception de votre message',
            html_message=html_message,
            plain_message=plain_message,
            commande_id=None
        )
        return f"Contact confirmation sent to {contact.email}"
    except Exception as exc:
        # Retry after 60 seconds if failed
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_commande_modification_notification_to_client(self, commande_id, modifications_summary):
    """
    Send email notification to client when their commande is modified by admin.

    Args:
        commande_id: ID of the modified Commande
        modifications_summary: Dict containing the changes made
    """
    try:
        from .models import Commande

        commande = Commande.objects.select_related(
            'user',
            'moyen_paiement',
            'code_promo',
            'delivery_person__user',
            'creneau'
        ).prefetch_related('produits__services').get(id=commande_id)

        if not commande.user.email:
            return "Client has no email"

        # Render email template
        context = {
            'commande': commande,
            'user': commande.user,
            'modifications': modifications_summary,
            'site_url': settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost:8000'
        }

        html_message = render_to_string('commande/emails/modification_commande_client.html', context)
        plain_message = strip_tags(html_message)

        subject = f'Votre commande #{commande.code_unique} a été modifiée'

        # Send and log
        log_and_send_email(
            type_email='modification_commande_client',
            destinataire=commande.user.email,
            sujet=subject,
            html_message=html_message,
            plain_message=plain_message,
            commande_id=commande_id
        )

        return f"Modification notification sent to {commande.user.email}"

    except Exception as exc:
        # Retry after 60 seconds if failed
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_delivery_unassignment_notification(self, commande_id, ancien_livreur_id, type_assignation='collecte'):
    """
    Send email notification to delivery person when they are unassigned from a commande.

    Args:
        commande_id: ID of the Commande
        ancien_livreur_id: ID of the delivery person being unassigned
        type_assignation: 'collecte' or 'livraison'
    """
    try:
        from .models import Commande
        from apps.users.models import DeliveryPerson

        commande = Commande.objects.select_related('user').get(id=commande_id)
        ancien_livreur = DeliveryPerson.objects.select_related('user').get(id=ancien_livreur_id)

        if not ancien_livreur.user.email:
            return "Ancien livreur has no email"

        # Render email template
        context = {
            'commande': commande,
            'livreur': ancien_livreur,
            'type_assignation': type_assignation,
            'site_url': settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost:8000'
        }

        html_message = render_to_string('commande/emails/desassignation_livreur.html', context)
        plain_message = strip_tags(html_message)

        if type_assignation == 'collecte':
            subject = f'Annulation assignation - Collecte commande #{commande.code_unique}'
        else:
            subject = f'Annulation assignation - Livraison commande #{commande.code_unique}'

        # Log and send email
        log_and_send_email(
            type_email='desassignation_livreur',
            destinataire=ancien_livreur.user.email,
            sujet=subject,
            html_message=html_message,
            plain_message=plain_message,
            commande_id=commande_id
        )

        return f"Unassignment notification sent to {ancien_livreur.user.email}"

    except Exception as exc:
        # Retry after 60 seconds if failed
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_livraison_confirmation_to_client(self, commande_id):
    """
    Send email to client when delivery person confirms the livraison (final delivery).
    Status: prete -> en_livraison
    """
    try:
        from .models import Commande

        commande = Commande.objects.select_related(
            'user',
            'delivery_person_livraison__user',
            'moyen_paiement'
        ).prefetch_related('produits').get(id=commande_id)

        client_email = commande.user.email

        if not client_email:
            return "Client has no email"

        # Render email template
        context = {
            'commande': commande,
            'client': commande.user,
            'livreur': commande.delivery_person_livraison,
            'nombre_produits': commande.produits.count(),
            'date_livraison': commande.date_livraison.strftime('%d/%m/%Y') if commande.date_livraison else 'Non définie',
            'code_confirmation': commande.code_confirmation_livraison,
            'site_url': settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost:8000'
        }

        html_message = render_to_string('commande/emails/confirmation_livraison_client.html', context)
        plain_message = strip_tags(html_message)

        subject = f'Votre livraison est en route - Commande #{commande.code_unique}'

        log_and_send_email(
            type_email='confirmation_livraison_client',
            destinataire=client_email,
            sujet=subject,
            html_message=html_message,
            plain_message=plain_message,
            commande_id=commande.id
        )

        return f"Livraison confirmation sent to client {client_email}"

    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_livraison_confirmation_to_admins(self, commande_id):
    """
    Send email notification to admins when delivery person confirms livraison.
    Status: prete -> en_livraison
    """
    try:
        from .models import Commande

        commande = Commande.objects.select_related(
            'user',
            'delivery_person_livraison__user',
            'moyen_paiement'
        ).prefetch_related('produits').get(id=commande_id)

        # Get admins who want notifications
        admins = get_admins_for_notifications()

        if not admins.exists():
            return "No admins with email notifications enabled"

        # Render email template
        context = {
            'commande': commande,
            'client': commande.user,
            'livreur': commande.delivery_person_livraison,
            'nombre_produits': commande.produits.count(),
            'date_livraison': commande.date_livraison.strftime('%d/%m/%Y') if commande.date_livraison else 'Non définie',
            'site_url': settings.ALLOWED_HOSTS[0] if settings.ALLOWED_HOSTS else 'localhost:8000'
        }

        html_message = render_to_string('commande/emails/confirmation_livraison_admin.html', context)
        plain_message = strip_tags(html_message)

        subject = f'Livraison confirmée par le livreur - Commande #{commande.code_unique}'

        emails_sent = 0
        for admin in admins:
            if admin.email:
                log_and_send_email(
                    type_email='confirmation_livraison_admin',
                    destinataire=admin.email,
                    sujet=subject,
                    html_message=html_message,
                    plain_message=plain_message,
                    commande_id=commande.id
                )
                emails_sent += 1

        return f"Livraison confirmation sent to {emails_sent} admin(s)"

    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)
