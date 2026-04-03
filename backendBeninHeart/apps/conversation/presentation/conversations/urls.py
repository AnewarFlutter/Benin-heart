"""
URL configuration for client conversation endpoints.
"""
from django.urls import path
from .views import MesConversationsView, ConversationMessagesView, OuvrirConversationView

urlpatterns = [
    path('client/conversations/', MesConversationsView.as_view(), name='client-conversations-list'),
    path('client/conversations/ouvrir/', OuvrirConversationView.as_view(), name='client-conversation-ouvrir'),
    path('client/conversations/<uuid:uuid>/messages/', ConversationMessagesView.as_view(), name='client-conversation-messages'),
]
