"""
URL configuration for client like endpoints.
"""
from django.urls import path
from .views import ActionLikeView, MesLikesReçusView, MesMatchsView, MesStatsView

urlpatterns = [
    path('client/likes/', ActionLikeView.as_view(), name='client-like-action'),
    path('client/mes-likes/', MesLikesReçusView.as_view(), name='client-mes-likes'),
    path('client/mes-matchs/', MesMatchsView.as_view(), name='client-mes-matchs'),
    path('client/mes-stats/', MesStatsView.as_view(), name='client-mes-stats'),
]
