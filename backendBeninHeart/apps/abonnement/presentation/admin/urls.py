"""
URL configuration for admin abonnement endpoints.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminPlanAbonnementViewSet, AdminSouscriptionViewSet

router = DefaultRouter()
router.register(r'plans', AdminPlanAbonnementViewSet, basename='admin-plans')
router.register(r'souscriptions', AdminSouscriptionViewSet, basename='admin-souscriptions')

urlpatterns = [
    path('admin/', include(router.urls)),
]
