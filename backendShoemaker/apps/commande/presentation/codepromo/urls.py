"""
URL configuration for Code Promo Client API.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientCodePromoViewSet


router = DefaultRouter()
router.register(r'codes-promo', ClientCodePromoViewSet, basename='client-codepromo')

urlpatterns = [
    path('client/', include(router.urls)),
]
