"""
URL configuration for admin service endpoints
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminServiceViewSet, AdminServiceCategoryViewSet

router = DefaultRouter()
router.register(r'services', AdminServiceViewSet, basename='admin-service')
router.register(r'service-categories', AdminServiceCategoryViewSet, basename='admin-service-category')

urlpatterns = [
    path('admin/', include(router.urls)),
]
