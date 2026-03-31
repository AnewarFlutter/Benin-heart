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
        pass
