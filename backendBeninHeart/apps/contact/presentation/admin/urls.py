"""
URL configuration for Contact Admin API.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminContactViewSet, AdminContactInfoViewSet


router = DefaultRouter()
router.register(r'contacts', AdminContactViewSet, basename='admin-contact')
router.register(r'contact-info', AdminContactInfoViewSet, basename='admin-contact-info')

urlpatterns = [
    path('admin/', include(router.urls)),
]
