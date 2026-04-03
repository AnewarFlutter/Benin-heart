"""
URL configuration for client abonnement endpoints.
"""
from django.urls import path
from .views import PlansListView, PlanDetailView, CreerSouscriptionView, MonAbonnementView

urlpatterns = [
    path('client/plans/', PlansListView.as_view(), name='client-plans-list'),
    path('client/plans/<slug:slug>/', PlanDetailView.as_view(), name='client-plan-detail'),
    path('client/souscriptions/', CreerSouscriptionView.as_view(), name='client-souscription-create'),
    path('client/mon-abonnement/', MonAbonnementView.as_view(), name='client-mon-abonnement'),
]
