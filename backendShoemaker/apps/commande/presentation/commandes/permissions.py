"""
Permissions for client endpoints
"""
from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission to check if the user is the owner of the commande or an admin.
    """
    message = "Vous ne pouvez accéder qu'à vos propres commandes."

    def has_object_permission(self, request, view, obj):
        # Admin can access all commandes
        if request.user.is_staff or request.user.has_any_role(['ADMIN', 'SUPERADMIN']):
            return True

        # User can only access their own commandes
        return obj.user == request.user
