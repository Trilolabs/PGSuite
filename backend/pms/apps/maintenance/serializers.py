"""Maintenance app serializers."""
from rest_framework import serializers
from .models import Complaint, Inspection


class ComplaintSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    room_number = serializers.CharField(source='room.number', read_only=True, default=None)
    assigned_to_name = serializers.CharField(source='assigned_to.name', read_only=True, default=None)

    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ['id', 'property', 'resolved_at', 'created_at', 'updated_at']


class InspectionSerializer(serializers.ModelSerializer):
    room_number = serializers.CharField(source='room.number', read_only=True)

    class Meta:
        model = Inspection
        fields = '__all__'
        read_only_fields = ['id', 'property', 'created_at', 'updated_at']
