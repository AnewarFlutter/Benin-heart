"""
URLs for delivery user profile endpoints
"""
from django.urls import path
from .views import DeliveryProfileView, DeliveryChangePasswordView, DeliveryAvailabilityView

urlpatterns = [
    path('profile/', DeliveryProfileView.as_view(), name='delivery-profile'),
    path('change-password/', DeliveryChangePasswordView.as_view(), name='delivery-change-password'),
    path('availability/', DeliveryAvailabilityView.as_view(), name='delivery-availability'),
]
