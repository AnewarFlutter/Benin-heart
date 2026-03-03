"""
Permissions for delivery user endpoints
"""
from rest_framework import permissions


class IsDeliveryPerson(permissions.BasePermission):
    """
    Permission pour vérifier que l'utilisateur est un livreur.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.has_role('DELIVERY')
