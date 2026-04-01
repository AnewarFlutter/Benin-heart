"""
Décorateur pour requérir la vérification Cloudflare Turnstile
"""

from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from apps.users.services.turnstile_service import verify_turnstile_token, get_client_ip, TurnstileVerificationError
import logging

logger = logging.getLogger(__name__)


def turnstile_required(view_func):
    """
    Décorateur pour les vues DRF qui requièrent une vérification Turnstile

    Usage:
        @api_view(['POST'])
        @turnstile_required
        def my_view(request):
            # Le code ici s'exécute seulement si Turnstile est valide
            pass

    Le token Turnstile doit être envoyé dans le corps de la requête avec la clé 'turnstile_token'
    """
    @wraps(view_func)
    def wrapper(self_or_request, *args, **kwargs):
        # Handle both function-based views (request is 1st arg)
        # and ViewSet methods (self is 1st arg, request is 2nd arg)
        from rest_framework.request import Request as DRFRequest
        if isinstance(self_or_request, DRFRequest):
            request = self_or_request
        else:
            # self_or_request is the ViewSet instance, request is args[0]
            request = args[0]

        # Extraire le token depuis le corps de la requête
        token = None

        if hasattr(request, 'data'):
            # Request DRF (POST/PUT/PATCH avec parsers)
            token = request.data.get('turnstile_token')
        elif hasattr(request, 'POST'):
            # Request Django standard
            token = request.POST.get('turnstile_token')

        if not token:
            logger.warning("Token Turnstile manquant dans la requête")
            return Response(
                {
                    'success': False,
                    'error': 'Token de vérification de sécurité manquant'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Obtenir l'IP du client
        client_ip = get_client_ip(request)

        try:
            # Vérifier le token
            verify_turnstile_token(token, client_ip)

            # Retirer le token des données pour éviter les erreurs de validation du serializer
            if hasattr(request, 'data') and hasattr(request.data, '_mutable'):
                # QueryDict mutable (form data)
                request.data._mutable = True
                request.data.pop('turnstile_token', None)
                request.data._mutable = False
            elif hasattr(request, 'data') and isinstance(request.data, dict):
                # Dict standard (JSON data)
                data_copy = request.data.copy()
                data_copy.pop('turnstile_token', None)
                request._full_data = data_copy

            # Si la vérification réussit, exécuter la vue
            return view_func(self_or_request, *args, **kwargs)

        except TurnstileVerificationError as e:
            logger.warning(f"Échec de vérification Turnstile: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': 'Vérification de sécurité échouée. Veuillez réessayer.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

    return wrapper
