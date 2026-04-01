"""
URL configuration for Temoignage Client API.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientTemoignageViewSet


router = DefaultRouter()
router.register(r'temoignages', ClientTemoignageViewSet, basename='client-temoignage')

urlpatterns = [
    path('client/', include(router.urls)),
]
