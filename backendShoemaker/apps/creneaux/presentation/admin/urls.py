"""
URL configuration for admin endpoints
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminCreneauxViewSet, AdminCreneauxConfigView

router = DefaultRouter()
router.register(r'creneaux', AdminCreneauxViewSet, basename='admin-creneaux')

urlpatterns = [
    path('admin/creneaux/config/', AdminCreneauxConfigView.as_view(), name='admin-creneaux-config'),
    path('admin/', include(router.urls)),
]
