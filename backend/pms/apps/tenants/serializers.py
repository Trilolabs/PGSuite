"""Tenants app serializers."""
from rest_framework import serializers
from .models import Tenant, OldTenant, Booking, Lead, Document, Agreement, FoodAttendance


# ======================== TENANT ========================

class TenantListSerializer(serializers.ModelSerializer):
    """Lightweight for list views."""
    room_number = serializers.CharField(source='room.number', read_only=True, default=None)
    property_name = serializers.CharField(source='property.name', read_only=True)

    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'phone', 'email', 'tenant_type', 'gender',
            'room', 'room_number', 'property_name',
            'rent', 'deposit', 'move_in', 'status', 'kyc_status',
            'photo_url', 'created_at',
        ]


class TenantDetailSerializer(serializers.ModelSerializer):
    """Full detail including all fields."""
    room_number = serializers.CharField(source='room.number', read_only=True, default=None)
    property_name = serializers.CharField(source='property.name', read_only=True)
    bed_label = serializers.SerializerMethodField()
    total_dues = serializers.SerializerMethodField()
    total_paid = serializers.SerializerMethodField()

    class Meta:
        model = Tenant
        fields = '__all__'
        read_only_fields = ['id', 'property', 'created_at', 'updated_at']

    def get_bed_label(self, obj):
        bed = getattr(obj, 'bed', None)
        return bed.label if bed else None

    def get_total_dues(self, obj):
        return sum(d.amount - d.paid_amount for d in obj.dues.filter(status__in=['unpaid', 'partially_paid']))

    def get_total_paid(self, obj):
        return sum(p.amount for p in obj.payments.all())


class TenantCreateSerializer(serializers.ModelSerializer):
    """Used for the multi-step add tenant form."""
    bed_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = Tenant
        exclude = ['property', 'created_at', 'updated_at']
        read_only_fields = ['id']

    def create(self, validated_data):
        bed_id = validated_data.pop('bed_id', None)
        validated_data['property_id'] = self.context['property_pk']
        tenant = super().create(validated_data)

        # Assign bed if provided
        if bed_id:
            from pms.apps.properties.models import Bed
            try:
                bed = Bed.objects.get(pk=bed_id, status='vacant')
                bed.tenant = tenant
                bed.status = 'occupied'
                bed.save(update_fields=['tenant', 'status'])
            except Bed.DoesNotExist:
                pass

        # RentOk Auto-Dues Logic
        from pms.apps.financials.models import Due
        import calendar
        from datetime import date
        from dateutil.relativedelta import relativedelta
        
        today = tenant.move_in or date.today()
        
        # 1. Security Deposit
        if tenant.deposit > 0:
            Due.objects.create(
                tenant=tenant, property=tenant.property,
                type='Security Deposit', amount=tenant.deposit,
                due_date=today, status='unpaid',
                description='Security Deposit added by Owner'
            )
            
        # 2. Pro-rated Rent for Current Month
        _, last_day = calendar.monthrange(today.year, today.month)
        days_in_month = last_day
        days_staying = last_day - today.day + 1
        
        if days_staying > 0 and tenant.rent > 0:
            prorated_rent = round((float(tenant.rent) / days_in_month) * days_staying, 2)
            end_of_month = date(today.year, today.month, last_day)
            Due.objects.create(
                tenant=tenant, property=tenant.property,
                type='Rent', amount=prorated_rent,
                due_date=today, status='unpaid',
                description=f'Rent for {today.strftime("%b")} added by Owner\nDue from {today.strftime("%d %b %Y")} to {end_of_month.strftime("%d %b %Y")}. Duration: {days_staying} Days.'
            )
            
        # 3. Full Rent for Next Month
        if tenant.stay_type == 'long_stay' and tenant.rent > 0:
            next_month = today + relativedelta(months=1)
            _, next_last_day = calendar.monthrange(next_month.year, next_month.month)
            next_start = date(next_month.year, next_month.month, 1)
            next_end = date(next_month.year, next_month.month, next_last_day)
            Due.objects.create(
                tenant=tenant, property=tenant.property,
                type='Rent', amount=tenant.rent,
                due_date=next_start, status='unpaid',
                description=f'Rent for {next_month.strftime("%b")} added by Owner\nDue from {next_start.strftime("%d %b %Y")} to {next_end.strftime("%d %b %Y")}. Duration: {next_last_day} Days.'
            )

        return tenant


# ======================== OLD TENANT ========================

class OldTenantSerializer(serializers.ModelSerializer):
    class Meta:
        model = OldTenant
        fields = '__all__'
        read_only_fields = ['id', 'property', 'created_at', 'updated_at']


# ======================== BOOKING ========================

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'
        read_only_fields = ['id', 'property', 'created_by', 'created_at', 'updated_at']


# ======================== LEAD ========================

class LeadListSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source='assigned_to.name', read_only=True, default=None)

    class Meta:
        model = Lead
        fields = [
            'id', 'name', 'phone', 'email', 'status', 'source',
            'budget_min', 'budget_max', 'sharing_preference',
            'expected_move_in', 'follow_up_date',
            'assigned_to', 'assigned_to_name', 'created_at',
        ]


class LeadDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = '__all__'
        read_only_fields = ['id', 'property', 'added_by', 'created_at', 'updated_at']


# ======================== DOCUMENT ========================

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


# ======================== AGREEMENT ========================

class AgreementSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = Agreement
        fields = '__all__'
        read_only_fields = ['id', 'property', 'created_at', 'updated_at']


# ======================== FOOD ATTENDANCE ========================

class FoodAttendanceSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)

    class Meta:
        model = FoodAttendance
        fields = '__all__'
        read_only_fields = ['id', 'property', 'created_at', 'updated_at']


class BulkFoodAttendanceSerializer(serializers.Serializer):
    """For marking attendance in bulk."""
    date = serializers.DateField()
    meal_type = serializers.ChoiceField(choices=['breakfast', 'lunch', 'snacks', 'dinner'])
    tenant_ids = serializers.ListField(child=serializers.UUIDField())
