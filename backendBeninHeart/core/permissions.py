
"""
Custom DRF permissions for the application.
"""
from rest_framework import permissions


# =============================================================================
# PERMISSIONS PAR RÔLE
# =============================================================================

class IsClient(permissions.BasePermission):
    """
    Permission pour vérifier si l'utilisateur est un CLIENT.
    Protège les routes réservées aux clients.
    """
    message = "Accès réservé aux clients."

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.has_role('CLIENT')
        )


class IsDeliveryPerson(permissions.BasePermission):
    """
    Permission pour vérifier si l'utilisateur est un LIVREUR.
    Protège les routes réservées aux livreurs.
    """
    message = "Accès réservé aux livreurs."

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.has_role('DELIVERY')
        )


class IsAdmin(permissions.BasePermission):
    """
    Permission pour vérifier si l'utilisateur est un ADMIN.
    Protège les routes réservées aux administrateurs.
    """
    message = "Accès réservé aux administrateurs."

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (
                request.user.is_staff or
                request.user.has_role('ADMIN')
            )
        )


# =============================================================================
# PERMISSIONS COMBINÉES (OR)
# =============================================================================

class IsClientOrAdmin(permissions.BasePermission):
    """
    Permission pour CLIENT ou ADMIN.
    """
    message = "Accès réservé aux clients ou administrateurs."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        return request.user.has_any_role(['CLIENT', 'ADMIN']) or request.user.is_staff


class IsDeliveryOrAdmin(permissions.BasePermission):
    """
    Permission pour DELIVERY ou ADMIN.
    """
    message = "Accès réservé aux livreurs ou administrateurs."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        return request.user.has_any_role(['DELIVERY', 'ADMIN']) or request.user.is_staff


class IsClientOrDelivery(permissions.BasePermission):
    """
    Permission pour CLIENT ou DELIVERY (pas admin).
    """
    message = "Accès réservé aux clients ou livreurs."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        return request.user.has_any_role(['CLIENT', 'DELIVERY'])





# =============================================================================
# PERMISSION DYNAMIQUE PAR CONTEXTE
# =============================================================================

class HasRoleContext(permissions.BasePermission):
    """
    Permission dynamique qui vérifie si le rôle de l'utilisateur
    correspond au contexte de la route.

    Usage dans la view:
        permission_classes = [HasRoleContext]
        required_role = 'DELIVERY'  # ou 'CLIENT' ou 'ADMIN'
    """
    message = "Vous n'avez pas le rôle requis pour accéder à cette ressource."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Récupérer le rôle requis depuis la view
        required_role = getattr(view, 'required_role', None)

        if not required_role:
            return True  # Pas de rôle requis = accès autorisé

        # Admin a accès à tout
        if request.user.has_role('ADMIN') or request.user.is_staff:
            return True

        # Vérifier si le rôle correspond
        if isinstance(required_role, (list, tuple)):
            return request.user.has_any_role(required_role)

        return request.user.has_role(required_role)


class MatchesRouteContext(permissions.BasePermission):
    """
    Permission qui vérifie que le rôle de l'utilisateur correspond
    au contexte de la route (client/, delivery/, admin/).

    Exemple:
        - Route /api/client/* → nécessite rôle CLIENT
        - Route /api/delivery/* → nécessite rôle DELIVERY
        - Route /api/admin/* → nécessite rôle ADMIN
    """
    message = "Votre rôle ne correspond pas au contexte de cette route."

    ROUTE_ROLE_MAPPING = {
        'client': 'CLIENT',
        'delivery': 'DELIVERY',
        'admin': 'ADMIN',
    }

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        # Admin a accès à tout
        if request.user.has_role('ADMIN') or request.user.is_staff:
            return True

        # Extraire le contexte de la route
        path = request.path.lower()

        for route_prefix, required_role in self.ROUTE_ROLE_MAPPING.items():
            if f'/api/{route_prefix}/' in path or f'/{route_prefix}/' in path:
                return request.user.has_role(required_role)

        # Route sans contexte spécifique = accès autorisé
        return True


# =============================================================================
# PERMISSIONS DE PROPRIÉTÉ (OBJECT-LEVEL)
# =============================================================================

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Permission pour permettre uniquement aux propriétaires de modifier un objet.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False


class IsOwner(permissions.BasePermission):
    """
    Permission pour permettre uniquement aux propriétaires d'accéder à un objet.
    """
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission pour propriétaire OU admin.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or request.user.has_role('ADMIN'):
            return True

        if hasattr(obj, 'owner'):
            return obj.owner == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False


# =============================================================================
# PERMISSIONS UTILITAIRES
# =============================================================================

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Permission pour permettre lecture à tous, modification aux admins uniquement.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and (request.user.is_staff or request.user.has_role('ADMIN'))


class IsAuthenticatedOrCreateOnly(permissions.BasePermission):
    """
    Permet aux utilisateurs non authentifiés de créer (register),
    mais requiert l'authentification pour les autres actions.
    """
    def has_permission(self, request, view):
        if request.method == 'POST' and getattr(view, 'action', None) == 'create':
            return True
        return request.user and request.user.is_authenticated


class IsVerifiedUser(permissions.BasePermission):
    """
    Permission pour vérifier que l'utilisateur a vérifié son compte (OTP).
    """
    message = "Vous devez d'abord vérifier votre compte."

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            getattr(request.user, 'is_verified', False)
        )