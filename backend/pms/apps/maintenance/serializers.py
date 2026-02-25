"""Maintenance app serializers."""
from rest_framework import serializers
from .models import Complaint, Inspection, TaskTemplate, Task, Review


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


class TaskTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskTemplate
        fields = '__all__'
        read_only_fields = ['id', 'property', 'created_at', 'updated_at']


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.name', read_only=True, default=None)
    room_number = serializers.CharField(source='room.number', read_only=True, default=None)
    template_name = serializers.CharField(source='template.name', read_only=True, default=None)

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ['id', 'property', 'completed_at', 'completed_by', 'created_at', 'updated_at']


class ReviewSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    room_number = serializers.CharField(source='tenant.room.number', read_only=True, default=None)

    class Meta:
        model = Review
        fields = '__all__'
        read_only_fields = ['id', 'property', 'responded_at', 'created_at', 'updated_at']
