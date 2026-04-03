"""
ASGI config for BeninHeart project.
Supporte HTTP (Django) + WebSocket (Django Channels).
"""
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')

# Setup Django avant tout import d'app
import django
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

# Import des routings WebSocket
from apps.like.routing import websocket_urlpatterns as notifications_ws
from apps.conversation.routing import websocket_urlpatterns as chat_ws

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    # HTTP → Django views standard
    'http': django_asgi_app,

    # WebSocket → Django Channels avec auth JWT
    'websocket': AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(
                notifications_ws + chat_ws
            )
        )
    ),
})
