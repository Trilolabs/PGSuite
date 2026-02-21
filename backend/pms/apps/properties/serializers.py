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
            'amenities', 'tags', 'status', 'is_available', 
            'remarks', 'address', 'linked_bank', 'beds',
        ]


class RoomCreateSerializer(serializers.ModelSerializer):
    bed_count = serializers.IntegerField(write_only=True, required=False, default=1)
    floor_name = serializers.CharField(write_only=True)
    is_available = serializers.BooleanField(write_only=True, required=False, default=True)
    remarks = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Room
        fields = [
            'floor_name', 'number', 'type', 'rent_per_bed',
            'amenities', 'tags', 'status', 'is_available',
            'remarks', 'address', 'linked_bank', 'bed_count',
        ]

    def validate_number(self, value):
        property_id = self.context['view'].kwargs.get('property_pk')
        qs = Room.objects.filter(property_id=property_id, number=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A room with this number already exists in this property.")
        return value

    def create(self, validated_data):
        bed_count = validated_data.pop('bed_count', 1)
        floor_name = validated_data.pop('floor_name')
        is_available = validated_data.pop('is_available', True)
        validated_data.pop('remarks', '')
        
        property_id = self.context['view'].kwargs.get('property_pk')
        property_obj = Property.objects.get(id=property_id)
        
        # Dynamically get or create the floor based on the name
        floor, _ = Floor.objects.get_or_create(
            property=property_obj, 
            name=floor_name,
            defaults={'sort_order': 0}
        )
        
        validated_data['floor'] = floor
        validated_data['property'] = property_obj
        validated_data['total_beds'] = bed_count
        validated_data['status'] = 'active' if is_available else 'inactive'
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

        return room

    def update(self, instance, validated_data):
        bed_count = validated_data.pop('bed_count', None)
        floor_name = validated_data.pop('floor_name', None)
        is_available = validated_data.pop('is_available', None)
        
        if is_available is not None:
            validated_data['status'] = 'active' if is_available else 'inactive'
            
        if floor_name:
            floor, _ = Floor.objects.get_or_create(
                property=instance.property, 
                name=floor_name,
                defaults={'sort_order': 0}
            )
            validated_data['floor'] = floor

        room = super().update(instance, validated_data)

        if bed_count is not None:
            current_beds = room.beds.count()
            if bed_count != current_beds:
                if bed_count > current_beds:
                    # Add beds
                    labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
                    beds_to_add = bed_count - current_beds
                    start_idx = current_beds
                    
                    for i in range(beds_to_add):
                        idx = start_idx + i
                        label = labels[idx] if idx < len(labels) else str(idx + 1)
                        Bed.objects.create(
                            room=room,
                            property=room.property,
                            label=label,
                        )
                elif bed_count < current_beds:
                    # Remove vacant beds only
                    beds_to_remove = current_beds - bed_count
                    vacant_beds = room.beds.filter(status='vacant').order_by('-created_at')[:beds_to_remove]
                    for bed in vacant_beds:
                        bed.delete()
                    
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
