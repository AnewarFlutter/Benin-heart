"""
URL configuration for FAQ Client API.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ClientFaqViewSet


router = DefaultRouter()
router.register(r'faq', ClientFaqViewSet, basename='client-faq')

urlpatterns = [
    path('client/', include(router.urls)),
]
