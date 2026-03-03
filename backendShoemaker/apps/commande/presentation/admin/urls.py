"""
URL configuration for admin endpoints
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminMoyenPaiementViewSet, AdminCodePromoViewSet, AdminCommandeViewSet, AdminCodeCollecteViewSet

router = DefaultRouter()
router.register(r'moyens-paiement', AdminMoyenPaiementViewSet, basename='admin-moyen-paiement')
router.register(r'codes-promo', AdminCodePromoViewSet, basename='admin-code-promo')
router.register(r'commandes', AdminCommandeViewSet, basename='admin-commande')
router.register(r'codes-collecte', AdminCodeCollecteViewSet, basename='admin-code-collecte')

urlpatterns = [
    path('admin/', include(router.urls)),
]
