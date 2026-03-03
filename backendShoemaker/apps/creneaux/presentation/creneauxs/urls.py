"""
URL configuration for client endpoints
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientCreneauxViewSet, CreneauxConfigView

router = DefaultRouter()
router.register(r'creneaux', ClientCreneauxViewSet, basename='client-creneaux')

urlpatterns = [
    path('client/creneaux/config/', CreneauxConfigView.as_view(), name='client-creneaux-config'),
    path('client/', include(router.urls)),
]
