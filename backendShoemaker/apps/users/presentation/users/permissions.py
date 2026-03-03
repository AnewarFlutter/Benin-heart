"""
Custom permissions for Users API.
"""
from rest_framework import permissions


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
