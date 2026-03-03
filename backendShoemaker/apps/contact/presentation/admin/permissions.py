"""
Custom permissions for Contact Admin API.
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
