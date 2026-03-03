"""
URL configuration for client service endpoints
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientServiceViewSet, ClientServiceCategoryViewSet

router = DefaultRouter()
router.register(r'services', ClientServiceViewSet, basename='client-service')
router.register(r'service-categories', ClientServiceCategoryViewSet, basename='client-service-category')

urlpatterns = [
    path('client/', include(router.urls)),
]
