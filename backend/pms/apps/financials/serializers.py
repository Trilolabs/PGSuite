"""Financials app serializers."""
from rest_framework import serializers
from .models import DuesPackage, Due, Payment, Expense, MeterReading, WhatsAppMessage


class DuesPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DuesPackage
        fields = '__all__'
        read_only_fields = ['id', 'property', 'created_at', 'updated_at']


class DueSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    balance = serializers.SerializerMethodField()

    class Meta:
        model = Due
        fields = '__all__'
        read_only_fields = ['id', 'property', 'paid_amount', 'created_at', 'updated_at']

    def get_balance(self, obj):
        return obj.get_balance()


class DueCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Due
        fields = ['tenant', 'dues_package', 'type', 'amount', 'due_date', 'description']


class PaymentSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    received_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['id', 'property', 'received_by', 'created_at', 'updated_at']

    def get_received_by_name(self, obj):
        if obj.received_by:
            return obj.received_by.name or obj.received_by.email
        return None


class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['tenant', 'due', 'amount', 'payment_date', 'mode', 'reference_number', 'notes']


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ['id', 'property', 'created_by', 'created_at', 'updated_at']


class MeterReadingSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = MeterReading
        fields = '__all__'
        read_only_fields = ['id', 'property', 'units_consumed', 'total_amount', 'due', 'created_at', 'updated_at']


class WhatsAppMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppMessage
        fields = '__all__'
        read_only_fields = ['id', 'property', 'status', 'sent_at', 'created_at', 'updated_at']
