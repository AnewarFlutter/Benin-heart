"""
URL configuration for Client, Delivery, and Admin API.
Includes authentication endpoints and user management.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientViewSet, DeliveryViewSet, AdminViewSet

# Client router - /api/client/
client_router = DefaultRouter()
client_router.register(r'', ClientViewSet, basename='client')

# Delivery router - /api/delivery/
delivery_router = DefaultRouter()
delivery_router.register(r'', DeliveryViewSet, basename='delivery')

# Admin router - /api/admin/
admin_router = DefaultRouter()
admin_router.register(r'', AdminViewSet, basename='admin')

urlpatterns = [
    # Client endpoints
    path('client/', include(client_router.urls)),

    # Delivery endpoints
    path('delivery/', include(delivery_router.urls)),

    # Admin endpoints
    path('admin/', include(admin_router.urls)),
]
