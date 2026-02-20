"""Financials app views."""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Sum, Q
from datetime import date

from .models import DuesPackage, Due, Payment, Expense, MeterReading, WhatsAppMessage
from .serializers import (
    DuesPackageSerializer, DueSerializer, DueCreateSerializer,
    PaymentSerializer, PaymentCreateSerializer,
    ExpenseSerializer, MeterReadingSerializer, WhatsAppMessageSerializer,
)


class DuesPackageViewSet(viewsets.ModelViewSet):
    serializer_class = DuesPackageSerializer
    permission_classes = [IsAuthenticated]

    DEFAULTS = [
        {'name': 'Rent', 'icon': '🏠', 'type': 'variable', 'is_system': True},
        {'name': 'Security Deposit', 'icon': '🐷', 'type': 'fixed', 'is_system': True},
        {'name': 'Electricity Meter', 'icon': '⚡', 'type': 'unit_based', 'is_system': True},
        {'name': 'Joining Fee', 'icon': '🎟️', 'type': 'variable'},
        {'name': 'Automatic Joining Fee', 'icon': '🎟️', 'type': 'variable'},
        {'name': 'Automatic Move out Charges', 'icon': '📦', 'type': 'variable'},
        {'name': 'Mess', 'icon': '🍽️', 'type': 'variable'},
        {'name': 'Electricity Bill', 'icon': '💡', 'type': 'variable'},
        {'name': 'Manual Late Fine', 'icon': '⏰', 'type': 'variable'},
        {'name': 'Wifi', 'icon': '📶', 'type': 'variable'},
        {'name': 'Maintenance Bill', 'icon': '🔧', 'type': 'variable'},
        {'name': 'Laundry Bill', 'icon': '👕', 'type': 'variable'},
        {'name': 'Police Verification', 'icon': '🛡️', 'type': 'variable'},
        {'name': 'Rental Agreement Charges', 'icon': '📜', 'type': 'variable'},
        {'name': '3 Months Rent Package', 'icon': '📦', 'type': 'fixed'},
        {'name': '6 Months Rent Package', 'icon': '📦', 'type': 'fixed'},
        {'name': '9 Months Rent Package', 'icon': '📦', 'type': 'fixed'},
        {'name': 'Yearly Rent Package', 'icon': '📦', 'type': 'fixed', 'frequency': 'yearly'},
        {'name': 'Weekly Rent Package', 'icon': '📦', 'type': 'fixed', 'frequency': 'daily'},
        {'name': 'Daily Rent Package', 'icon': '📦', 'type': 'fixed', 'frequency': 'daily'},
        {'name': 'Others', 'icon': '📋', 'type': 'variable'},
    ]

    def get_queryset(self):
        return DuesPackage.objects.filter(property_id=self.kwargs['property_pk'])

    def list(self, request, *args, **kwargs):
        """Auto-seed defaults on first access."""
        qs = self.get_queryset()
        if not qs.exists():
            prop_pk = self.kwargs['property_pk']
            for d in self.DEFAULTS:
                DuesPackage.objects.create(
                    property_id=prop_pk,
                    name=d['name'],
                    icon=d['icon'],
                    type=d['type'],
                    is_system=d.get('is_system', False),
                    frequency=d.get('frequency', 'monthly'),
                    is_active=False,
                )
            # Activate Rent and Security Deposit by default
            DuesPackage.objects.filter(
                property_id=prop_pk, name__in=['Rent', 'Security Deposit']
            ).update(is_active=True)
        return super().list(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(property_id=self.kwargs['property_pk'])

    def perform_destroy(self, instance):
        if instance.is_system:
            from rest_framework.exceptions import ValidationError
            raise ValidationError('System categories cannot be deleted.')
        instance.delete()

    @action(detail=True, methods=['post'])
    def toggle(self, request, property_pk=None, pk=None):
        pkg = self.get_object()
        pkg.is_active = not pkg.is_active
        pkg.save(update_fields=['is_active'])
        return Response({'is_active': pkg.is_active})


class DueViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'type', 'tenant']
    search_fields = ['tenant__name']
    ordering_fields = ['due_date', 'amount']

    def get_queryset(self):
        qs = Due.objects.filter(property_id=self.kwargs['property_pk']).select_related('tenant')
        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if month and year:
            qs = qs.filter(due_date__month=month, due_date__year=year)
        return qs

    def get_serializer_class(self):
        if self.action in ('create',):
            return DueCreateSerializer
        return DueSerializer

    def perform_create(self, serializer):
        serializer.save(property_id=self.kwargs['property_pk'])

    @action(detail=True, methods=['post'])
    def waive(self, request, property_pk=None, pk=None):
        due = self.get_object()
        due.status = 'waived'
        due.save(update_fields=['status'])
        return Response({'detail': 'Due waived.'})

    @action(detail=False, methods=['post'])
    def generate(self, request, property_pk=None):
        """Auto-generate monthly dues for all active tenants."""
        from pms.apps.tenants.models import Tenant
        tenants = Tenant.objects.filter(property_id=property_pk, status='active')
        packages = DuesPackage.objects.filter(property_id=property_pk, is_active=True)

        created = 0
        for tenant in tenants:
            for pkg in packages:
                if pkg.frequency != 'monthly':
                    continue
                amount = pkg.default_amount
                if pkg.name.lower() == 'rent':
                    amount = tenant.rent
                _, was_created = Due.objects.get_or_create(
                    tenant=tenant,
                    property_id=property_pk,
                    type=pkg.name,
                    due_date=date(date.today().year, date.today().month, tenant.rent_start_date),
                    defaults={
                        'amount': amount,
                        'dues_package': pkg,
                    },
                )
                if was_created:
                    created += 1

        return Response({'detail': f'Generated {created} dues.'})

    @action(detail=False, methods=['get'])
    def summary(self, request, property_pk=None):
        """Monthly dues summary."""
        qs = self.get_queryset()
        return Response({
            'total': qs.aggregate(total=Sum('amount'))['total'] or 0,
            'paid': qs.filter(status='paid').aggregate(total=Sum('amount'))['total'] or 0,
            'unpaid': qs.filter(status='unpaid').aggregate(total=Sum('amount'))['total'] or 0,
            'partially_paid': qs.filter(status='partially_paid').count(),
        })


class PaymentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['mode', 'tenant']
    search_fields = ['tenant__name', 'reference_number']
    ordering_fields = ['payment_date', 'amount']

    def get_queryset(self):
        qs = Payment.objects.filter(property_id=self.kwargs['property_pk']).select_related('tenant')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            qs = qs.filter(payment_date__gte=date_from)
        if date_to:
            qs = qs.filter(payment_date__lte=date_to)
        return qs

    def get_serializer_class(self):
        if self.action in ('create',):
            return PaymentCreateSerializer
        return PaymentSerializer

    def perform_create(self, serializer):
        payment = serializer.save(
            property_id=self.kwargs['property_pk'],
            received_by=self.request.user,
        )
        # Auto-settle the linked due
        if payment.due:
            due = payment.due
            due.paid_amount += payment.amount
            if due.paid_amount >= due.amount + due.late_fine:
                due.status = 'paid'
            else:
                due.status = 'partially_paid'
            due.save(update_fields=['paid_amount', 'status'])

    @action(detail=True, methods=['get'])
    def receipt(self, request, property_pk=None, pk=None):
        """Generate receipt data (frontend renders the PDF)."""
        payment = self.get_object()
        return Response({
            'receipt_number': f'RCP-{str(payment.id)[:8].upper()}',
            'tenant_name': payment.tenant.name,
            'amount': str(payment.amount),
            'payment_date': str(payment.payment_date),
            'mode': payment.mode,
            'reference': payment.reference_number,
            'property_name': payment.property.name,
        })


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['category']
    ordering_fields = ['date', 'amount']

    def get_queryset(self):
        qs = Expense.objects.filter(property_id=self.kwargs['property_pk'])
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        if date_from:
            qs = qs.filter(date__gte=date_from)
        if date_to:
            qs = qs.filter(date__lte=date_to)
        return qs

    def perform_create(self, serializer):
        serializer.save(
            property_id=self.kwargs['property_pk'],
            created_by=self.request.user,
        )

    @action(detail=False, methods=['get'])
    def summary(self, request, property_pk=None):
        qs = self.get_queryset()
        from django.db.models.functions import TruncMonth
        by_category = qs.values('category').annotate(total=Sum('amount')).order_by('-total')
        return Response({
            'total': qs.aggregate(total=Sum('amount'))['total'] or 0,
            'by_category': list(by_category),
        })


class MeterReadingViewSet(viewsets.ModelViewSet):
    serializer_class = MeterReadingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MeterReading.objects.filter(
            property_id=self.kwargs['property_pk'],
        ).select_related('tenant')

    def perform_create(self, serializer):
        reading = serializer.save(property_id=self.kwargs['property_pk'])
        # Auto-create electricity due
        Due.objects.create(
            tenant=reading.tenant,
            property_id=self.kwargs['property_pk'],
            type='Electricity',
            amount=reading.total_amount,
            due_date=date.today(),
            description=f'Meter {reading.meter_number}: {reading.units_consumed} units',
        )


class WhatsAppMessageViewSet(viewsets.ModelViewSet):
    serializer_class = WhatsAppMessageSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        return WhatsAppMessage.objects.filter(property_id=self.kwargs['property_pk'])

    def perform_create(self, serializer):
        serializer.save(property_id=self.kwargs['property_pk'])

    @action(detail=False, methods=['post'])
    def send_bulk(self, request, property_pk=None):
        """Send bulk payment reminders."""
        from pms.apps.tenants.models import Tenant
        tenants = Tenant.objects.filter(
            property_id=property_pk,
            status='active',
        ).filter(
            dues__status='unpaid',
        ).distinct()

        messages = []
        for tenant in tenants:
            pending = sum(
                d.amount - d.paid_amount
                for d in tenant.dues.filter(status__in=['unpaid', 'partially_paid'])
            )
            msg = WhatsAppMessage.objects.create(
                property_id=property_pk,
                tenant=tenant,
                phone=tenant.phone,
                template_name='payment_reminder',
                message_body=f'Hi {tenant.name}, you have pending dues of ₹{pending}. Please pay at your earliest convenience.',
                status='queued',
            )
            messages.append(msg.id)

        return Response({'detail': f'Queued {len(messages)} messages.', 'message_ids': messages})
