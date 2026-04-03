"""
URL configuration for admin endpoints
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminLikeViewSet

router = DefaultRouter()
router.register(r'likes', AdminLikeViewSet, basename='admin-like')

urlpatterns = [
    path('admin/', include(router.urls)),
]
