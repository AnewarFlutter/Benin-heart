"""
Service de vérification Cloudflare Turnstile
https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
"""

import requests
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class TurnstileVerificationError(Exception):
    """Exception levée lorsque la vérification Turnstile échoue"""
    pass


def verify_turnstile_token(token: str, remote_ip: str = None) -> bool:
    """
    Vérifie un token Turnstile auprès de l'API Cloudflare

    Args:
        token: Le token Turnstile à vérifier
        remote_ip: L'adresse IP du client (optionnel mais recommandé)

    Returns:
        bool: True si le token est valide, False sinon

    Raises:
        TurnstileVerificationError: Si la vérification échoue
    """
    if not token:
        logger.warning("Token Turnstile manquant")
        raise TurnstileVerificationError("Token Turnstile manquant")

    secret_key = getattr(settings, 'TURNSTILE_SECRET_KEY', None)
    if not secret_key:
        logger.error("TURNSTILE_SECRET_KEY non configurée dans les settings")
        raise TurnstileVerificationError("Configuration Turnstile manquante")

    # URL de vérification Cloudflare
    verify_url = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

    # Préparer les données de vérification
    data = {
        'secret': secret_key,
        'response': token,
    }

    # Ajouter l'IP si fournie (recommandé pour plus de sécurité)
    if remote_ip:
        data['remoteip'] = remote_ip

    try:
        # Envoyer la requête de vérification
        response = requests.post(verify_url, data=data, timeout=10)
        response.raise_for_status()

        result = response.json()

        # Vérifier la réponse
        if result.get('success'):
            logger.info(f"Token Turnstile vérifié avec succès")
            return True
        else:
            error_codes = result.get('error-codes', [])
            logger.warning(f"Échec de vérification Turnstile: {error_codes}")
            raise TurnstileVerificationError(f"Vérification échouée: {', '.join(error_codes)}")

    except requests.RequestException as e:
        logger.error(f"Erreur lors de la vérification Turnstile: {str(e)}")
        raise TurnstileVerificationError(f"Erreur de connexion à Cloudflare: {str(e)}")
    except Exception as e:
        logger.error(f"Erreur inattendue lors de la vérification Turnstile: {str(e)}")
        raise TurnstileVerificationError(f"Erreur inattendue: {str(e)}")


def get_client_ip(request) -> str:
    """
    Extrait l'adresse IP du client depuis la requête

    Args:
        request: L'objet request Django

    Returns:
        str: L'adresse IP du client
    """
    # Vérifier les en-têtes de proxy (X-Forwarded-For, X-Real-IP)
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')

    return ip
