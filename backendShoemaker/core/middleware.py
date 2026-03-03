"""
Middleware personnalisé pour la vérification de JWT Blacklist via Redis.
"""
import jwt
from django.core.cache import cache
from django.http import JsonResponse
from django.conf import settings
from rest_framework_simplejwt.exceptions import TokenError


class JWTBlacklistMiddleware:
    """
    Middleware de vérification de JWT Blacklist pour les Access Tokens.

    Fonctionnement:
    ┌─────────────────────────────────────────────────────────────┐
    │  1. Requête arrive avec Access Token                        │
    │  2. Middleware vérifie si JTI est dans Redis                │
    │  3. Si blacklisté → 401 Unauthorized                        │
    │  4. Si non blacklisté → Requête autorisée                   │
    └─────────────────────────────────────────────────────────────┘

    Redis stocke les JTI des Access Tokens blacklistés avec TTL = temps restant du token.
    SimpleJWT gère les Refresh Tokens blacklistés en BDD.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Extraire le token de l'en-tête Authorization
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')

        if auth_header.startswith('Bearer '):
            # Extraire le token (enlever "Bearer ")
            parts = auth_header.split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]

                # Vérifier si le token est blacklisté dans Redis
                if self._is_token_blacklisted(token):
                    return JsonResponse(
                        {
                            'error': 'Token has been revoked',
                            'detail': 'This token has been blacklisted. Please login again.'
                        },
                        status=401
                    )

                # Vérifier si l'utilisateur est bloqué ou désactivé
                user_status = self._check_user_status(token)
                if user_status:
                    return JsonResponse(user_status, status=401)

        # Si le token n'est pas blacklisté, continuer normalement
        response = self.get_response(request)
        return response

    def _is_token_blacklisted(self, token):
        """
        Vérifie si le token est blacklisté dans Redis.

        Args:
            token (str): Le JWT Access Token

        Returns:
            bool: True si le token est blacklisté, False sinon
        """
        try:
            # Décoder le token sans vérification (on vérifie juste le JTI)
            decoded = jwt.decode(
                token,
                options={"verify_signature": False}  # Pas de vérification de signature ici
            )

            # Récupérer le JTI (JWT ID)
            jti = decoded.get('jti')

            if not jti:
                # Si pas de JTI, on ne peut pas vérifier la blacklist
                return False

            # Vérifier dans Redis si le JTI est blacklisté
            cache_key = f'blacklist_access_token_{jti}'
            is_blacklisted = cache.get(cache_key)

            return is_blacklisted is not None

        except (jwt.DecodeError, jwt.ExpiredSignatureError, TokenError):
            # Si le token est invalide ou expiré, on laisse DRF gérer l'erreur
            return False
        except Exception:
            # En cas d'erreur inattendue, on ne bloque pas la requête
            return False

    def _check_user_status(self, token):
        """
        Vérifie si l'utilisateur est bloqué ou désactivé.

        Args:
            token (str): Le JWT Access Token

        Returns:
            dict or None: Dictionnaire d'erreur si bloqué/désactivé, None sinon
        """
        try:
            # Décoder le token pour récupérer le user_id
            decoded = jwt.decode(
                token,
                options={"verify_signature": False}
            )

            user_id = decoded.get('user_id')
            if not user_id:
                return None

            # Importer ici pour éviter les imports circulaires
            from apps.users.models import User

            # Récupérer l'utilisateur
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return {
                    'error': 'User not found',
                    'detail': 'This user account no longer exists.'
                }

            # Vérifier si l'utilisateur est bloqué
            if user.is_blocked:
                return {
                    'error': 'Account blocked',
                    'detail': 'Votre compte a été bloqué. Veuillez contacter l\'administrateur pour plus d\'informations.'
                }

            # Vérifier si l'utilisateur est désactivé
            if not user.is_active:
                return {
                    'error': 'Account disabled',
                    'detail': 'Compte désactivé. Veuillez contacter l\'administrateur.'
                }

            # Vérifier si l'utilisateur est supprimé (soft delete)
            if user.is_deleted:
                return {
                    'error': 'Account deleted',
                    'detail': 'Ce compte a été supprimé.'
                }

            return None

        except Exception:
            # En cas d'erreur, on laisse passer (DRF gérera l'authentification)
            return None
