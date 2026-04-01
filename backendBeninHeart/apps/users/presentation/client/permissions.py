"""
Permissions for client user endpoints
"""
from rest_framework import permissions


class IsClientUser(permissions.BasePermission):
    """
    Permission pour vérifier que l'utilisateur est un client.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.has_role('CLIENT')
