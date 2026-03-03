"""
Django signals for Contact app.
Handles email notifications when a new contact message is submitted.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from ..models import Contact


@receiver(post_save, sender=Contact)
def send_contact_notification(sender, instance, created, **kwargs):
    """
    Send email notifications when a new contact message is created.
    Sends:
    - Confirmation email to the client
    - Notification to admins with recevoir_emails_contact=True
    """
    if created:
        # Import tasks here to avoid circular imports
        from apps.commande.tasks import (
            send_contact_confirmation_to_client,
            send_contact_form_to_admins
        )

        # Send confirmation to client asynchronously
        send_contact_confirmation_to_client.delay(instance.id)

        # Send notification to admins asynchronously
        send_contact_form_to_admins.delay(instance.id)
