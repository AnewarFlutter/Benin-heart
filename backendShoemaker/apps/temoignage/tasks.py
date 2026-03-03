"""
Celery tasks for temoignage app
"""
from celery import shared_task


@shared_task
def example_task():
    """
    Tâche d'exemple.
    """
    pass
