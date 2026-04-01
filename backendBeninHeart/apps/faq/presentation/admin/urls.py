"""
URL configuration for FAQ Admin API.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminFaqViewSet


router = DefaultRouter()
router.register(r'faq', AdminFaqViewSet, basename='admin-faq')

urlpatterns = [
    path('admin/', include(router.urls)),
]
