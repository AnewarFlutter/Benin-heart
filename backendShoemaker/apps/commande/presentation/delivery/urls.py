"""
URL configuration for delivery endpoints
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeliveryCommandeViewSet

router = DefaultRouter()
router.register(r'commandes', DeliveryCommandeViewSet, basename='delivery-commande')

urlpatterns = [
    path('delivery/', include(router.urls)),
]
