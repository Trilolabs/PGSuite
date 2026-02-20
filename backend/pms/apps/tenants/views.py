"""Tenants app views — ViewSets for Tenant, OldTenant, Booking, Lead, Document, Agreement."""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import date

from pms.core.permissions import IsPropertyManager
from .models import Tenant, OldTenant, Booking, Lead, Document, Agreement, FoodAttendance
from .serializers import (
    TenantListSerializer, TenantDetailSerializer, TenantCreateSerializer,
    OldTenantSerializer, BookingSerializer,
    LeadListSerializer, LeadDetailSerializer,
    DocumentSerializer, AgreementSerializer,
    FoodAttendanceSerializer, BulkFoodAttendanceSerializer,
)


class TenantViewSet(viewsets.ModelViewSet):
    """Full CRUD for tenants with checkout, notice, and room-change actions."""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'tenant_type', 'gender', 'room', 'kyc_status']
    search_fields = ['name', 'phone', 'email']
    ordering_fields = ['name', 'move_in', 'rent', 'created_at']

    def get_queryset(self):
        return Tenant.objects.filter(
            property_id=self.kwargs['property_pk'],
        ).select_related('room', 'property')

    def get_serializer_class(self):
        if self.action == 'list':
            return TenantListSerializer
        if self.action in ('create',):
            return TenantCreateSerializer
        return TenantDetailSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['property_pk'] = self.kwargs.get('property_pk')
        return ctx

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'])
    def give_notice(self, request, property_pk=None, pk=None):
        """Mark tenant as under notice."""
        tenant = self.get_object()
        tenant.status = 'under_notice'
        tenant.save(update_fields=['status'])
        # Update bed status
        bed = getattr(tenant, 'bed', None)
        if bed:
            bed.status = 'under_notice'
            bed.save(update_fields=['status'])
        return Response({'detail': 'Tenant is now under notice.'})

    @action(detail=True, methods=['post'])
    def checkout(self, request, property_pk=None, pk=None):
        """Full checkout flow: archive tenant, free bed, update counts."""
        tenant = self.get_object()

        # Archive to OldTenant
        total_paid = sum(p.amount for p in tenant.payments.all())
        pending = sum(
            d.amount - d.paid_amount
            for d in tenant.dues.filter(status__in=['unpaid', 'partially_paid'])
        )
        OldTenant.objects.create(
            tenant_id=tenant.id,
            property_id=tenant.property_id,
            name=tenant.name,
            phone=tenant.phone,
            room_number=tenant.room.number if tenant.room else '',
            move_in=tenant.move_in,
            move_out=date.today(),
            total_stay_days=(date.today() - tenant.move_in).days,
            total_rent_paid=total_paid,
            pending_dues=pending,
            deposit_amount=tenant.deposit,
            checkout_reason=request.data.get('reason', 'Move-out'),
            checkout_date=date.today(),
            snapshot_data=TenantDetailSerializer(tenant).data,
        )

        # Free bed
        bed = getattr(tenant, 'bed', None)
        if bed:
            bed.tenant = None
            bed.status = 'vacant'
            bed.save(update_fields=['tenant', 'status'])
            room = bed.room
            room.occupied_beds = room.beds.filter(status='occupied').count()
            room.save(update_fields=['occupied_beds'])

        # Update property
        prop = tenant.property
        prop.occupied_beds = sum(r.occupied_beds for r in prop.rooms.all())
        prop.save(update_fields=['occupied_beds'])

        # Mark tenant checked out
        tenant.status = 'checked_out'
        tenant.move_out = date.today()
        tenant.save(update_fields=['status', 'move_out'])

        return Response({'detail': 'Tenant checked out successfully.'})

    @action(detail=True, methods=['post'])
    def change_room(self, request, property_pk=None, pk=None):
        """Transfer tenant to a new bed."""
        tenant = self.get_object()
        new_bed_id = request.data.get('bed_id')
        if not new_bed_id:
            return Response({'detail': 'bed_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        from pms.apps.properties.models import Bed
        try:
            new_bed = Bed.objects.get(pk=new_bed_id, status='vacant')
        except Bed.DoesNotExist:
            return Response({'detail': 'Bed not found or not vacant.'}, status=status.HTTP_404_NOT_FOUND)

        # Free old bed
        old_bed = getattr(tenant, 'bed', None)
        if old_bed:
            old_bed.tenant = None
            old_bed.status = 'vacant'
            old_bed.save(update_fields=['tenant', 'status'])
            old_room = old_bed.room
            old_room.occupied_beds = old_room.beds.filter(status='occupied').count()
            old_room.save(update_fields=['occupied_beds'])

        # Assign new bed
        new_bed.tenant = tenant
        new_bed.status = 'occupied'
        new_bed.save(update_fields=['tenant', 'status'])
        tenant.room = new_bed.room
        tenant.save(update_fields=['room'])

        new_room = new_bed.room
        new_room.occupied_beds = new_room.beds.filter(status='occupied').count()
        new_room.save(update_fields=['occupied_beds'])

        return Response({'detail': f'Moved to Room {new_room.number}, Bed {new_bed.label}.'})

    @action(detail=True, methods=['get'])
    def passbook(self, request, property_pk=None, pk=None):
        """RentOk style grouped passbook (Ledger)."""
        tenant = self.get_object()
        from pms.apps.financials.serializers import DueSerializer, PaymentSerializer
        
        dues = tenant.dues.all().order_by('due_date')
        payments = tenant.payments.all().order_by('payment_date')
        
        # Combine and sort by date for ledger calculation
        ledger = []
        for d in dues:
            ledger.append({'date': d.due_date, 'type': 'due', 'data': DueSerializer(d).data, 'amount': float(d.amount)})
        for p in payments:
            ledger.append({'date': p.payment_date, 'type': 'payment', 'data': PaymentSerializer(p).data, 'amount': float(p.amount)})
            
        ledger.sort(key=lambda x: x['date'])
        
        # Calculate running balance
        balance = 0
        grouped = {}
        for item in ledger:
            month_key = item['date'].strftime('%Y-%m')
            if month_key not in grouped:
                grouped[month_key] = {'month_name': item['date'].strftime('%B %Y'), 'entries': [], 'month_total_dues': 0, 'month_total_paid': 0, 'opening_balance': balance}
                
            if item['type'] == 'due':
                balance += item['amount']
                grouped[month_key]['month_total_dues'] += item['amount']
            else:
                balance -= item['amount']
                grouped[month_key]['month_total_paid'] += item['amount']
                
            item['running_balance'] = balance
            grouped[month_key]['entries'].append(item)
            
        return Response({
            'total_dues': sum(d.amount for d in dues),
            'total_paid': sum(p.amount for p in payments),
            'net_balance': balance,
            'ledger': list(grouped.values())
        })


class OldTenantViewSet(viewsets.ModelViewSet):
    """Archived tenants — read-heavy, limited writes."""
    serializer_class = OldTenantSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['settlement_status']
    search_fields = ['name', 'phone']
    http_method_names = ['get', 'put', 'patch', 'head', 'options']

    def get_queryset(self):
        return OldTenant.objects.filter(property_id=self.kwargs['property_pk'])

    @action(detail=True, methods=['post'])
    def refund_deposit(self, request, property_pk=None, pk=None):
        old_tenant = self.get_object()
        old_tenant.deposit_refunded = True
        old_tenant.settlement_status = 'settled'
        old_tenant.save(update_fields=['deposit_refunded', 'settlement_status'])
        return Response({'detail': 'Deposit marked as refunded.'})


class BookingViewSet(viewsets.ModelViewSet):
    """Booking management with convert-to-tenant flow."""
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status']
    search_fields = ['name', 'phone']

    def get_queryset(self):
        return Booking.objects.filter(property_id=self.kwargs['property_pk'])

    def perform_create(self, serializer):
        serializer.save(
            property_id=self.kwargs['property_pk'],
            created_by=self.request.user,
        )

    @action(detail=True, methods=['post'])
    def convert(self, request, property_pk=None, pk=None):
        """Convert booking to a tenant."""
        booking = self.get_object()
        if booking.status != 'confirmed':
            return Response(
                {'detail': 'Only confirmed bookings can be converted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        tenant = Tenant.objects.create(
            property_id=property_pk,
            room=booking.room.floor.rooms.first() if booking.room else None,
            name=booking.name,
            phone=booking.phone,
            email=booking.email,
            move_in=booking.move_in_date,
            rent=booking.rent,
            booked_by=str(booking.created_by or ''),
        )

        # Assign bed if booking had one
        if booking.bed:
            from pms.apps.properties.models import Bed
            bed = booking.bed
            if bed.status == 'vacant':
                bed.tenant = tenant
                bed.status = 'occupied'
                bed.save(update_fields=['tenant', 'status'])
                tenant.room = bed.room
                tenant.save(update_fields=['room'])

        booking.status = 'converted'
        booking.save(update_fields=['status'])

        return Response(TenantListSerializer(tenant).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def cancel(self, request, property_pk=None, pk=None):
        booking = self.get_object()
        booking.status = 'cancelled'
        booking.notes += f'\nCancelled: {request.data.get("reason", "")}'
        booking.save(update_fields=['status', 'notes'])
        return Response({'detail': 'Booking cancelled.'})


class LeadViewSet(viewsets.ModelViewSet):
    """Lead CRM pipeline."""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'source']
    search_fields = ['name', 'phone', 'email']
    ordering_fields = ['created_at', 'follow_up_date']

    def get_queryset(self):
        return Lead.objects.filter(
            property_id=self.kwargs['property_pk'],
        ).select_related('assigned_to')

    def get_serializer_class(self):
        if self.action == 'list':
            return LeadListSerializer
        return LeadDetailSerializer

    def perform_create(self, serializer):
        serializer.save(
            property_id=self.kwargs['property_pk'],
            added_by=self.request.user,
        )

    @action(detail=True, methods=['post'])
    def convert_booking(self, request, property_pk=None, pk=None):
        """Convert lead to a booking."""
        lead = self.get_object()
        booking = Booking.objects.create(
            property_id=property_pk,
            name=lead.name,
            phone=lead.phone,
            email=lead.email,
            booking_date=date.today(),
            move_in_date=lead.expected_move_in or date.today(),
            source=lead.source,
            created_by=request.user,
        )
        lead.status = 'converted'
        lead.save(update_fields=['status'])
        return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def stats(self, request, property_pk=None):
        """Lead funnel statistics."""
        qs = self.get_queryset()
        return Response({
            'total': qs.count(),
            'new': qs.filter(status='new').count(),
            'contacted': qs.filter(status='contacted').count(),
            'visit_done': qs.filter(status='visit_done').count(),
            'follow_up': qs.filter(status='follow_up').count(),
            'converted': qs.filter(status='converted').count(),
            'junk': qs.filter(status='junk').count(),
            'lost': qs.filter(status='lost').count(),
        })


class DocumentViewSet(viewsets.ModelViewSet):
    """Tenant document management."""
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(tenant_id=self.kwargs['tenant_pk'])

    def perform_create(self, serializer):
        serializer.save(tenant_id=self.kwargs['tenant_pk'])


class AgreementViewSet(viewsets.ModelViewSet):
    """Tenant agreement management."""
    serializer_class = AgreementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Agreement.objects.filter(tenant_id=self.kwargs['tenant_pk'])

    def perform_create(self, serializer):
        tenant = Tenant.objects.get(pk=self.kwargs['tenant_pk'])
        serializer.save(tenant=tenant, property=tenant.property)


class FoodAttendanceViewSet(viewsets.ModelViewSet):
    """Food attendance tracking."""
    serializer_class = FoodAttendanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date', 'meal_type']

    def get_queryset(self):
        return FoodAttendance.objects.filter(
            property_id=self.kwargs['property_pk'],
        ).select_related('tenant')

    @action(detail=False, methods=['post'])
    def bulk_mark(self, request, property_pk=None):
        """Mark attendance for multiple tenants at once."""
        serializer = BulkFoodAttendanceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        created = 0
        for tid in data['tenant_ids']:
            _, was_created = FoodAttendance.objects.update_or_create(
                tenant_id=tid,
                property_id=property_pk,
                date=data['date'],
                meal_type=data['meal_type'],
                defaults={'attended': True},
            )
            if was_created:
                created += 1

        return Response({'detail': f'Marked {created} new, {len(data["tenant_ids"]) - created} updated.'})
