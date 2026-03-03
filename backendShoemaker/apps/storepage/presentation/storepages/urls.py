"""
URL configuration for client endpoints
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import HeroBannerViewSet

router = DefaultRouter()
router.register(r'hero-banners', HeroBannerViewSet, basename='hero-banner')

urlpatterns = [
    path('client/', include(router.urls)),
]
