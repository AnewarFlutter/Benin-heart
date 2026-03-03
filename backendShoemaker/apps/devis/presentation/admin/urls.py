"""
URL configuration for Devis Admin API.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminDevisViewSet


router = DefaultRouter()
router.register(r'devis', AdminDevisViewSet, basename='admin-devis')

urlpatterns = [
    path('admin/', include(router.urls)),
]
