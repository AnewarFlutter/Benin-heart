"""
URL configuration for admin profil endpoints.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminProfilViewSet

router = DefaultRouter()
router.register(r'profils', AdminProfilViewSet, basename='admin-profils')

urlpatterns = [
    path('admin/', include(router.urls)),
]
