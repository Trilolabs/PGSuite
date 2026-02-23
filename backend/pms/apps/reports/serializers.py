from rest_framework import serializers
from .models import GeneratedReport

class GeneratedReportSerializer(serializers.ModelSerializer):
    property_name = serializers.CharField(source='property.name', read_only=True)
    file = serializers.SerializerMethodField()

    class Meta:
        model = GeneratedReport
        fields = [
            'id', 'report_type', 'property', 'property_name',
            'file', 'status', 'created_at', 'date_from', 'date_to', 'date_range_preset'
        ]
        read_only_fields = ['id', 'created_at', 'status', 'file']

    def get_file(self, obj):
        if obj.file and hasattr(obj.file, 'url'):
            return obj.file.url
        return None
