from django.contrib import admin
from .models import (
    Property, PropertySettings, Floor, Room, Bed,
    Staff, BankAccount, Asset, FoodMenu,
)


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'type', 'gender', 'total_rooms', 'total_beds', 'occupied_beds', 'is_active']
    list_filter = ['type', 'gender', 'is_active']
    search_fields = ['name', 'code', 'city']


@admin.register(PropertySettings)
class PropertySettingsAdmin(admin.ModelAdmin):
    list_display = ['property', 'late_fine_enabled', 'gst_enabled', 'auto_generate_dues']


@admin.register(Floor)
class FloorAdmin(admin.ModelAdmin):
    list_display = ['property', 'name', 'sort_order']
    list_filter = ['property']


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ['number', 'property', 'floor', 'type', 'total_beds', 'occupied_beds', 'rent_per_bed', 'status']
    list_filter = ['property', 'type', 'status']
    search_fields = ['number']


@admin.register(Bed)
class BedAdmin(admin.ModelAdmin):
    list_display = ['label', 'room', 'status', 'tenant', 'rent']
    list_filter = ['status', 'room__property']


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ['name', 'property', 'role', 'salary', 'status']
    list_filter = ['property', 'role', 'status']


@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display = ['bank_name', 'account_number', 'property', 'is_primary']


@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'property', 'room', 'quantity', 'status']
    list_filter = ['category', 'status', 'property']


@admin.register(FoodMenu)
class FoodMenuAdmin(admin.ModelAdmin):
    list_display = ['property', 'day_of_week', 'meal_type', 'is_active']
    list_filter = ['property', 'meal_type']
