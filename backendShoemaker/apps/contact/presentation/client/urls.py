"""
URL configuration for Contact Client API.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientContactViewSet, ClientContactInfoViewSet


router = DefaultRouter()
router.register(r'contacts', ClientContactViewSet, basename='client-contact')
router.register(r'contact-info', ClientContactInfoViewSet, basename='client-contact-info')

urlpatterns = [
    path('client/', include(router.urls)),
]
