from django.contrib import admin
from .models import Complaint, Inspection


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ['title', 'tenant', 'category', 'priority', 'status', 'created_at']
    list_filter = ['property', 'status', 'priority', 'category']
    search_fields = ['title', 'tenant__name']


@admin.register(Inspection)
class InspectionAdmin(admin.ModelAdmin):
    list_display = ['room', 'inspection_type', 'scheduled_date', 'completed_date', 'inspector']
    list_filter = ['property', 'inspection_type']
