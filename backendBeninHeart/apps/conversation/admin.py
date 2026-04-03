from django.contrib import admin
from .models import Conversation, Message


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    fields = ['auteur', 'texte', 'type_message', 'lu', 'created_at']
    readonly_fields = ['created_at']


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['uuid', 'participant1', 'participant2', 'dernier_message_at', 'est_active', 'created_at']
    list_filter = ['est_active']
    search_fields = ['participant1__email', 'participant2__email']
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    ordering = ['-dernier_message_at']
    inlines = [MessageInline]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['conversation', 'auteur', 'texte_court', 'type_message', 'lu', 'created_at']
    list_filter = ['type_message', 'lu']
    search_fields = ['auteur__email', 'texte']
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    ordering = ['-created_at']

    def texte_court(self, obj):
        return obj.texte[:60]
    texte_court.short_description = 'Texte'
