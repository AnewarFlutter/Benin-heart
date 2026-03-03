#!/bin/bash

set -e

echo "Waiting for PostgreSQL..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 0.1
done
echo "PostgreSQL started"

# echo "Waiting for Redis..."
# while ! nc -z ${REDIS_HOST:-localhost} ${REDIS_PORT:-6379}; do
#   sleep 0.1
# done
# echo "Redis started"

echo "Running migrations..."
python manage.py makemigrations --noinput
python manage.py migrate --noinput

echo "Running JWT blacklist migrations..."
python manage.py migrate token_blacklist --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

# Create superuser if it doesn't exist (only in development)
if [ "$DEBUG" = "True" ]; then
    echo "Creating superuser..."
    python manage.py shell << END
from apps.users.infrastructure.models import User
if not User.objects.filter(email='admin@admin.com').exists():
    User.objects.create_superuser(
        email='admin@admin.com',
        username='admin',
        password='admin123',
        first_name='Admin',
        last_name='User'
    )
    print('Superuser created: admin@admin.com / admin123')
else:
    print('Superuser already exists')
END
fi

# Start server
if [ "$ENVIRONMENT" = "production" ]; then
    echo "Starting Gunicorn server..."
    gunicorn config.wsgi:application \
        --bind 0.0.0.0:8000 \
        --workers 4 \
        --threads 2 \
        --worker-class gthread \
        --worker-tmp-dir /dev/shm \
        --log-level info \
        --access-logfile - \
        --error-logfile -
else
    echo "Starting Django development server..."
    python manage.py runserver 0.0.0.0:8000
fi
