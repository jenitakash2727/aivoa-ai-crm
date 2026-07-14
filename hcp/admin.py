from django.contrib import admin
from .models import HCP, Interaction
import json

@admin.register(HCP)
class HCPAdmin(admin.ModelAdmin):
    list_display = ['name', 'specialty', 'hospital', 'email', 'created_at']
    search_fields = ['name', 'specialty', 'hospital']
    list_filter = ['specialty', 'created_at']
    ordering = ['name']

@admin.register(Interaction)
class InteractionAdmin(admin.ModelAdmin):
    list_display = ['hcp', 'type', 'interaction_date', 'sentiment', 'created_at']
    search_fields = ['hcp__name', 'summary']
    list_filter = ['type', 'sentiment', 'created_at']
    readonly_fields = ['created_at', 'updated_at']

    def get_key_points_display(self, obj):
        try:
            return json.loads(obj.key_points)
        except:
            return []
    get_key_points_display.short_description = 'Key Points'