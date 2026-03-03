"""
Permissions for delivery endpoints
"""
from rest_framework import permissions


class IsDeliveryPerson(permissions.BasePermission):
    """
    Permission pour vérifier que l'utilisateur est un livreur.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.has_role('DELIVERY')


class IsAssignedDeliveryPerson(permissions.BasePermission):
    """
    Permission pour vérifier que le livreur est assigné à cette commande.
    """
    def has_object_permission(self, request, view, obj):
        # Admin peut toujours voir
        if request.user.has_any_role(['ADMIN', 'SUPERADMIN']):
            return True

        # Le livreur doit être assigné à cette commande
        return obj.delivery_person and obj.delivery_person.user == request.user
