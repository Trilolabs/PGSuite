"""Properties app serializers."""
from rest_framework import serializers
from .models import (
    Property, PropertySettings, Floor, Room, Bed,
    Staff, BankAccount, Asset, FoodMenu,
)


# ======================== PROPERTY ========================

class PropertySettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertySettings
        exclude = ['property']


class PropertyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    vacant_beds = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'name', 'code', 'type', 'gender', 'city',
            'total_rooms', 'total_beds', 'occupied_beds', 'vacant_beds',
            'is_active', 'created_at',
        ]

    def get_vacant_beds(self, obj):
        return obj.total_beds - obj.occupied_beds


class PropertyDetailSerializer(serializers.ModelSerializer):
    settings = PropertySettingsSerializer(read_only=True)
    vacant_beds = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ['id', 'user', 'total_rooms', 'total_beds', 'occupied_beds', 'created_at', 'updated_at']

    def get_vacant_beds(self, obj):
        return obj.total_beds - obj.occupied_beds


class PropertyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = [
            'name', 'code', 'address', 'city', 'state', 'pincode',
            'type', 'gender', 'total_floors', 'gst_number', 'pan_number',
        ]

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        prop = super().create(validated_data)
        # Auto-create settings
        PropertySettings.objects.create(property=prop)
        return prop


# ======================== FLOOR ========================

class FloorSerializer(serializers.ModelSerializer):
    room_count = serializers.SerializerMethodField()

    class Meta:
        model = Floor
        fields = ['id', 'name', 'sort_order', 'room_count', 'property']
        read_only_fields = ['id', 'property']

    def get_room_count(self, obj):
        return obj.rooms.count()


# ======================== BED ========================

class BedSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True, default=None)
    effective_rent = serializers.SerializerMethodField()

    class Meta:
        model = Bed
        fields = ['id', 'label', 'rent', 'status', 'tenant', 'tenant_name', 'effective_rent']
        read_only_fields = ['id', 'tenant']

    def get_effective_rent(self, obj):
        return obj.get_effective_rent()


# ======================== ROOM ========================

class RoomListSerializer(serializers.ModelSerializer):
    floor_name = serializers.CharField(source='floor.name', read_only=True)
    beds = BedSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = [
            'id', 'number', 'floor', 'floor_name', 'type',
            'total_beds', 'occupied_beds', 'rent_per_bed',
            'amenities', 'status', 'beds',
        ]


class RoomCreateSerializer(serializers.ModelSerializer):
    bed_count = serializers.IntegerField(write_only=True, required=False, default=1)

    class Meta:
        model = Room
        fields = [
            'floor', 'number', 'type', 'rent_per_bed',
            'amenities', 'status', 'remarks', 'bed_count',
        ]

    def create(self, validated_data):
        bed_count = validated_data.pop('bed_count', 1)
        property_obj = validated_data['floor'].property
        validated_data['property'] = property_obj
        validated_data['total_beds'] = bed_count
        room = super().create(validated_data)

        # Auto-create beds
        labels = 'ABCDEFGHIJKLMNOP'
        for i in range(bed_count):
            label = labels[i] if i < len(labels) else str(i + 1)
            Bed.objects.create(
                room=room,
                property=property_obj,
                label=label,
            )

        # Update property counts
        property_obj.total_rooms = property_obj.rooms.count()
        property_obj.total_beds = sum(r.total_beds for r in property_obj.rooms.all())
        property_obj.save(update_fields=['total_rooms', 'total_beds'])

        return room


# ======================== STAFF ========================

class StaffSerializer(serializers.ModelSerializer):
    class Meta:
        model = Staff
        fields = '__all__'
        read_only_fields = ['id', 'property', 'created_at', 'updated_at']


# ======================== BANK ACCOUNT ========================

class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = '__all__'
        read_only_fields = ['id', 'property', 'created_at', 'updated_at']


# ======================== ASSET ========================

class AssetSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source='room.number', read_only=True, default=None)

    class Meta:
        model = Asset
        fields = '__all__'
        read_only_fields = ['id', 'property', 'created_at', 'updated_at']


# ======================== FOOD MENU ========================

class FoodMenuSerializer(serializers.ModelSerializer):
    meal_type_display = serializers.CharField(source='get_meal_type_display', read_only=True)

    class Meta:
        model = FoodMenu
        fields = '__all__'
        read_only_fields = ['id', 'property', 'created_at', 'updated_at']
