from django.contrib import admin
from .models import DuesPackage, Due, Payment, Expense, MeterReading, WhatsAppMessage


@admin.register(DuesPackage)
class DuesPackageAdmin(admin.ModelAdmin):
    list_display = ['name', 'property', 'type', 'default_amount', 'frequency', 'is_active']
    list_filter = ['property', 'type', 'is_active']


@admin.register(Due)
class DueAdmin(admin.ModelAdmin):
    list_display = ['type', 'tenant', 'amount', 'due_date', 'status', 'paid_amount']
    list_filter = ['property', 'status', 'type']
    search_fields = ['tenant__name']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'amount', 'payment_date', 'mode', 'received_by']
    list_filter = ['property', 'mode', 'payment_date']
    search_fields = ['tenant__name']


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['category', 'amount', 'date', 'property', 'paid_to']
    list_filter = ['property', 'category', 'date']


@admin.register(MeterReading)
class MeterReadingAdmin(admin.ModelAdmin):
    list_display = ['tenant', 'meter_number', 'reading_date', 'units_consumed', 'total_amount']
    list_filter = ['property', 'reading_date']


@admin.register(WhatsAppMessage)
class WhatsAppMessageAdmin(admin.ModelAdmin):
    list_display = ['phone', 'template_name', 'status', 'sent_at']
    list_filter = ['status', 'property']
