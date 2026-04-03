"""
URL configuration for admin endpoints
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminConversationViewSet

router = DefaultRouter()
router.register(r'conversations', AdminConversationViewSet, basename='admin-conversation')

urlpatterns = [
    path('admin/', include(router.urls)),
]
