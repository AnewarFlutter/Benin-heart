"""
Utility functions for the application.
"""
import re
from typing import Optional


def slugify_filename(filename: str) -> str:
    """
    Convert filename to a URL-friendly slug.
    """
    name, extension = filename.rsplit('.', 1)
    slug = re.sub(r'[^\w\s-]', '', name.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    return f"{slug}.{extension}"


def generate_order_number() -> str:
    """
    Generate a unique order number.
    Format: ORD-YYYYMMDD-XXXXX
    """
    from django.utils import timezone
    import random
    import string

    date_str = timezone.now().strftime('%Y%m%d')
    random_str = ''.join(random.choices(string.digits, k=5))
    return f"ORD-{date_str}-{random_str}"


def generate_delivery_tracking_number() -> str:
    """
    Generate a unique delivery tracking number.
    Format: DEL-YYYYMMDD-XXXXX
    """
    from django.utils import timezone
    import random
    import string

    date_str = timezone.now().strftime('%Y%m%d')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"DEL-{date_str}-{random_str}"


def validate_phone_number(phone: str) -> bool:
    """
    Validate phone number format (simple validation).
    """
    pattern = r'^\+?1?\d{9,15}$'
    return bool(re.match(pattern, phone))


def validate_email(email: str) -> bool:
    """
    Validate email format.
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two coordinates using Haversine formula.
    Returns distance in kilometers.
    """
    from math import radians, sin, cos, sqrt, atan2

    R = 6371  # Earth's radius in kilometers

    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))

    return R * c


# =============================================================================
# JWT BLACKLIST UTILITIES
# =============================================================================

def blacklist_access_token(token: str) -> bool:
    """
    Blacklist un Access Token dans Redis.

    Flow:
    ┌─────────────────────────────────────────────────────────────┐
    │  1. Extraire le JTI du token                                │
    │  2. Calculer le temps restant (TTL)                         │
    │  3. Stocker JTI dans Redis avec TTL                         │
    └─────────────────────────────────────────────────────────────┘

    Args:
        token (str): Le JWT Access Token à blacklister

    Returns:
        bool: True si le token a été blacklisté, False en cas d'erreur
    """
    import jwt
    from django.core.cache import cache
    from django.conf import settings
    from datetime import datetime

    try:
        # Décoder le token pour extraire le JTI et l'expiration
        decoded = jwt.decode(
            token,
            options={"verify_signature": False}
        )

        jti = decoded.get('jti')
        exp = decoded.get('exp')

        if not jti or not exp:
            return False

        # Calculer le temps restant avant expiration
        now = datetime.utcnow().timestamp()
        ttl = int(exp - now)

        # Si le token est déjà expiré, pas besoin de le blacklister
        if ttl <= 0:
            return True

        # Stocker le JTI dans Redis avec TTL
        cache_key = f'blacklist_access_token_{jti}'
        cache.set(cache_key, True, timeout=ttl)

        return True

    except Exception as e:
        print(f"Erreur lors du blacklist du token: {e}")
        return False


def blacklist_refresh_token(refresh_token: str) -> bool:
    """
    Blacklist un Refresh Token dans la base de données (SimpleJWT).

    Flow:
    ┌─────────────────────────────────────────────────────────────┐
    │  1. Créer un objet RefreshToken                             │
    │  2. Appeler la méthode blacklist()                          │
    │  3. Token ajouté dans BlacklistedToken (BDD)                │
    └─────────────────────────────────────────────────────────────┘

    Args:
        refresh_token (str): Le JWT Refresh Token à blacklister

    Returns:
        bool: True si le token a été blacklisté, False en cas d'erreur
    """
    try:
        from rest_framework_simplejwt.tokens import RefreshToken
        from rest_framework_simplejwt.exceptions import TokenError

        token = RefreshToken(refresh_token)
        token.blacklist()

        return True

    except TokenError as e:
        # Si le token est déjà blacklisté, c'est un succès (objectif atteint)
        if "Le jeton a été banni" in str(e) or "Token is blacklisted" in str(e):
            return True
        print(f"Erreur lors du blacklist du refresh token: {e}")
        return False

    except Exception as e:
        print(f"Erreur lors du blacklist du refresh token: {e}")
        return False


def logout_user_tokens(access_token: str, refresh_token: str) -> dict:
    """
    Logout complet: blacklist à la fois l'Access Token (Redis) et le Refresh Token (BDD).

    Flow:
    ┌─────────────────────────────────────────────────────────────┐
    │                      LOGOUT                                  │
    ├─────────────────────────────────────────────────────────────┤
    │  1. User fait logout                                        │
    │  2. Access Token JTI → Redis (TTL = temps restant)          │
    │  3. Refresh Token → Blacklist en BDD (SimpleJWT)            │
    │  4. Tokens invalidés immédiatement                          │
    └─────────────────────────────────────────────────────────────┘

    Args:
        access_token (str): Le JWT Access Token
        refresh_token (str): Le JWT Refresh Token

    Returns:
        dict: Résultat du logout avec status pour chaque token
    """
    access_blacklisted = blacklist_access_token(access_token)
    refresh_blacklisted = blacklist_refresh_token(refresh_token)

    return {
        'access_token_blacklisted': access_blacklisted,
        'refresh_token_blacklisted': refresh_blacklisted,
        'success': access_blacklisted and refresh_blacklisted
    }
