"""
Development settings - override base settings for local development.
"""
from .base import *

DEBUG = True

# Development-specific apps
INSTALLED_APPS += [
    'django_extensions',  # Optional: useful dev tools
]

# Allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Email backend for development (console)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Django Debug Toolbar (optional)
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    INTERNAL_IPS = ['127.0.0.1', 'localhost']

# Désactiver les domaines de cookies pour le développement local
# Cela permet aux cookies CSRF et de session de fonctionner sur localhost
CSRF_COOKIE_DOMAIN = None
SESSION_COOKIE_DOMAIN = None
