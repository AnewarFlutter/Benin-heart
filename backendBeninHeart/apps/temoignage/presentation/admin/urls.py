"""
URL configuration for admin endpoints
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminTemoignageViewSet

router = DefaultRouter()
router.register(r'temoignages', AdminTemoignageViewSet, basename='admin-temoignage')

urlpatterns = [
    path('admin/', include(router.urls)),
]
