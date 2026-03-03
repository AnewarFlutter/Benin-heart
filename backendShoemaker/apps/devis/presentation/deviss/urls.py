"""
URL configuration for client endpoints
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientDevisViewSet

router = DefaultRouter()
router.register(r'deviss', ClientDevisViewSet, basename='client-devis')

urlpatterns = [
    path('client/', include(router.urls)),
]
