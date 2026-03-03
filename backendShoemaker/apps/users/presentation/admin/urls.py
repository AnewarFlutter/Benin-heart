"""
URL configuration for Admin API.
All endpoints require ADMIN role.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AdminUserViewSet, AdminDeliveryPersonViewSet,
    AdminProfileView, AdminChangePasswordView
)

router = DefaultRouter()
router.register(r'admin/users', AdminUserViewSet, basename='admin-user')
router.register(r'admin/delivery-persons', AdminDeliveryPersonViewSet, basename='admin-delivery-person')

urlpatterns = [
    path('', include(router.urls)),
    # Admin profile endpoints
    path('admin/profile/', AdminProfileView.as_view(), name='admin-profile'),
    path('admin/change-password/', AdminChangePasswordView.as_view(), name='admin-change-password'),
]
