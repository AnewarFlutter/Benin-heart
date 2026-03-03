"""
Celery tasks for service app
"""
from celery import shared_task
from django.core.mail import send_mail


@shared_task
def send_service_notification(service_id):
    """
    Send notification when a new service is created.
    """
    # TODO: Implement notification logic
    pass
