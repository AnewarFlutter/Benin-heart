"""
Celery configuration for Shoemaker project.
"""
import os
from celery import Celery
from decouple import config

# Set default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')

# Create Celery app
app = Celery('shoemaker')

# Load configuration from Django settings with CELERY_ prefix
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all installed apps
app.autodiscover_tasks()

# Celery configuration
app.conf.update(
    broker_url=config('CELERY_BROKER_URL', default='redis://localhost:6379/1'),
    result_backend=config('CELERY_RESULT_BACKEND', default='redis://localhost:6379/1'),
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
)


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task for testing Celery."""
    print(f'Request: {self.request!r}')


# Celery Beat Schedule
app.conf.beat_schedule = {
    'check-pickup-reminders-every-15-minutes': {
        'task': 'apps.commande.tasks.check_and_send_pickup_reminders',
        'schedule': 900.0,  # Every 15 minutes (900 seconds)
    },
}
