"""
URLs for client user profile endpoints
"""
from django.urls import path
from .views import ClientProfileView, ClientChangePasswordView

urlpatterns = [
    path('profile/', ClientProfileView.as_view(), name='client-profile'),
    path('change-password/', ClientChangePasswordView.as_view(), name='client-change-password'),
]
