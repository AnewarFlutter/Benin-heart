"""
URL configuration for client endpoints
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientCommandeViewSet, ClientMoyenPaiementViewSet

router = DefaultRouter()
router.register(r'commandes', ClientCommandeViewSet, basename='client-commande')
router.register(r'moyens-paiement', ClientMoyenPaiementViewSet, basename='client-moyen-paiement')

urlpatterns = [
    path('client/', include(router.urls)),
]
