from django.contrib import admin
from .models import Tenant, OldTenant, Lead, Document, Agreement, FoodAttendance


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'property', 'room', 'rent', 'status', 'move_in']
    list_filter = ['property', 'status', 'tenant_type', 'gender']
    search_fields = ['name', 'phone', 'email']


@admin.register(OldTenant)
class OldTenantAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'room_number', 'move_in', 'move_out', 'settlement_status']
    list_filter = ['property', 'settlement_status']

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone', 'property', 'status', 'source', 'created_at']
    list_filter = ['property', 'status', 'source']


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['type', 'file_name', 'tenant', 'created_at']


@admin.register(Agreement)
class AgreementAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'property', 'start_date', 'end_date', 'rent', 'status']
    list_filter = ['status', 'property']


@admin.register(FoodAttendance)
class FoodAttendanceAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'date', 'meal_type', 'attended']
    list_filter = ['meal_type', 'date', 'property']
