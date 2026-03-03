from django.contrib import admin
from .models import Temoignage


@admin.register(Temoignage)
class TemoignageAdmin(admin.ModelAdmin):
    list_display = ['name', 'profession', 'created_at', 'updated_at']
    list_filter = ['created_at']
    search_fields = ['name', 'profession', 'description']
    ordering = ['-created_at']
