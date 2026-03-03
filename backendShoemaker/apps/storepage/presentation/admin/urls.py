"""
URL configuration for admin endpoints
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminStorepageViewSet

router = DefaultRouter()
router.register(r'storepages', AdminStorepageViewSet, basename='admin-storepage')

urlpatterns = [
    path('admin/', include(router.urls)),
]
