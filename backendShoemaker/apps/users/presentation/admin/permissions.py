"""
Custom permissions for Admin Users API.
"""
from rest_framework import permissions


class IsAdminOrSuperAdmin(permissions.BasePermission):
    """
    Permission pour vérifier si l'utilisateur est ADMIN ou SUPERADMIN.
    Protège les routes d'administration.
    """
    message = "Accès réservé aux administrateurs (ADMIN ou SUPERADMIN)."

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (
                request.user.is_staff or
                request.user.is_superuser or
                request.user.has_any_role(['ADMIN', 'SUPERADMIN'])
            )
        )


class IsSuperAdminOnly(permissions.BasePermission):
    """
    Permission pour vérifier si l'utilisateur est SUPERADMIN uniquement.
    Pour les opérations critiques réservées aux super-administrateurs.
    """
    message = "Accès réservé aux super-administrateurs uniquement."

    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            (
                request.user.is_superuser or
                request.user.has_role('SUPERADMIN')
            )
        )


class CanManageUsers(permissions.BasePermission):
    """
    Permission pour gérer les utilisateurs.
    ADMIN peut gérer CLIENT et DELIVERY.
    SUPERADMIN peut tout gérer, y compris les ADMIN.
    """
    message = "Vous n'avez pas les permissions nécessaires pour gérer cet utilisateur."

    def has_permission(self, request, view):
        # Doit être au minimum ADMIN
        return (
            request.user and
            request.user.is_authenticated and
            (
                request.user.is_staff or
                request.user.is_superuser or
                request.user.has_any_role(['ADMIN', 'SUPERADMIN'])
            )
        )

    def has_object_permission(self, request, view, obj):
        """
        Vérifie les permissions au niveau objet.
        ADMIN ne peut pas gérer d'autres ADMIN ou SUPERADMIN.
        SUPERADMIN peut tout gérer.
        """
        user = request.user
        target_user = obj

        # SUPERADMIN peut tout faire
        if user.is_superuser or user.has_role('SUPERADMIN'):
            return True

        # ADMIN peut gérer CLIENT et DELIVERY uniquement
        if user.is_staff or user.has_role('ADMIN'):
            # Vérifier que l'utilisateur cible n'a pas de rôles ADMIN ou SUPERADMIN
            return not target_user.has_any_role(['ADMIN', 'SUPERADMIN'])

        return False


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission to only allow owners or admins to access user data.
    """

    def has_object_permission(self, request, view, obj):
        # Admin can access any user
        if request.user.is_staff:
            return True

        # User can only access their own data
        return obj == request.user


class IsDeliveryPersonOwner(permissions.BasePermission):
    """
    Permission to only allow delivery person to access their own profile.
    """

    def has_object_permission(self, request, view, obj):
        # Admin can access any delivery person
        if request.user.is_staff:
            return True

        # Delivery person can only access their own profile
        return obj.user == request.user
