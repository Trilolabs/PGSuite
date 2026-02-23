"""Dashboard app — aggregated property stats and analytics."""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, Q
from datetime import date, timedelta

from pms.apps.properties.models import Property
from pms.apps.tenants.models import Tenant, OldTenant, Lead
from pms.apps.financials.models import Due, Payment, Expense


class DashboardOverviewView(APIView):
    """Global dashboard across all properties."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if getattr(user, 'role', '') == 'admin':
            properties = Property.objects.filter(user=user, is_active=True)
        else:
            properties = Property.objects.filter(staff__user=user, is_active=True).distinct()
            
        property_ids = list(properties.values_list('id', flat=True))
        today = date.today()
        month_start = today.replace(day=1)

        # Today's collection
        todays_collection = Payment.objects.filter(
            property_id__in=property_ids,
            payment_date=today,
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Monthly numbers
        monthly_collection = Payment.objects.filter(
            property_id__in=property_ids,
            payment_date__gte=month_start,
        ).aggregate(total=Sum('amount'))['total'] or 0

        monthly_dues = Due.objects.filter(
            property_id__in=property_ids,
            due_date__gte=month_start,
            status__in=['unpaid', 'partially_paid'],
        ).aggregate(total=Sum('amount'))['total'] or 0

        total_dues = Due.objects.filter(
            property_id__in=property_ids,
            status__in=['unpaid', 'partially_paid'],
        ).aggregate(total=Sum('amount'))['total'] or 0

        monthly_expenses = Expense.objects.filter(
            property_id__in=property_ids,
            date__gte=month_start,
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Counts
        total_tenants = Tenant.objects.filter(
            property_id__in=property_ids, status='active',
        ).count()

        under_notice = Tenant.objects.filter(
            property_id__in=property_ids, status='under_notice',
        ).count()

        defaulters = Tenant.objects.filter(
            property_id__in=property_ids,
            status='active',
            dues__status='unpaid',
            dues__due_date__lt=today,
        ).distinct().count()

        total_deposits = Tenant.objects.filter(
            property_id__in=property_ids, status='active',
        ).aggregate(total=Sum('deposit'))['total'] or 0

        unpaid_deposits = Due.objects.filter(
            property_id__in=property_ids,
            type='security_deposit',
            status__in=['unpaid', 'partially_paid']
        ).aggregate(total=Sum('amount'))['total'] or 0

        pending_bookings = Tenant.objects.filter(
            property_id__in=property_ids,
            status__in=['active', 'booking_pending'],
            move_in__gt=today
        ).count()

        active_leads = Lead.objects.filter(
            property_id__in=property_ids,
            status__in=['new', 'contacted', 'visit_scheduled', 'follow_up'],
        ).count()

        properties_data = []
        for prop in properties:
            p_id = prop.id
            p_tenants = Tenant.objects.filter(property_id=p_id)
            
            p_active_tenants = p_tenants.filter(status='active').count()
            p_under_notice = p_tenants.filter(status='under_notice').count()
            p_pending_bookings = p_tenants.filter(status__in=['active', 'booking_pending'], move_in__gt=today).count()
            
            p_pending_dues = Due.objects.filter(
                property_id=p_id, status__in=['unpaid', 'partially_paid']
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            p_collection = Payment.objects.filter(
                property_id=p_id, payment_date__gte=month_start
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            p_leads = Lead.objects.filter(
                property_id=p_id, status__in=['new', 'contacted', 'visit_scheduled', 'follow_up']
            ).count()
            
            p_defaulters = p_tenants.filter(
                status='active', dues__status='unpaid', dues__due_date__lt=today
            ).distinct().count()

            properties_data.append({
                'id': prop.id,
                'name': prop.name,
                'code': prop.code,
                'total_rooms': prop.total_rooms,
                'total_beds': prop.total_beds,
                'occupied_beds': prop.occupied_beds,
                'vacant_beds': max(0, prop.total_beds - prop.occupied_beds),
                'type': prop.type,
                'gender': prop.gender,
                'active_tenants': p_active_tenants,
                'under_notice': p_under_notice,
                'pending_bookings': p_pending_bookings,
                'pending_dues': p_pending_dues,
                'monthly_collection': p_collection,
                'total_leads': p_leads,
                'tenants_with_dues': p_defaulters,
                'complaints': 0, # Placeholder
            })

        return Response({
            'todays_collection': todays_collection,
            'monthly_collection': monthly_collection,
            'monthly_dues': monthly_dues,
            'total_dues': total_dues,
            'monthly_expenses': monthly_expenses,
            'monthly_profit': monthly_collection - monthly_expenses,
            'total_tenants': total_tenants,
            'under_notice': under_notice,
            'defaulters': defaulters,
            'total_deposits': total_deposits,
            'unpaid_deposits': unpaid_deposits,
            'pending_bookings': pending_bookings,
            'active_leads': active_leads,
            'properties': properties_data,
        })


class PropertyDashboardView(APIView):
    """Per-property dashboard stats."""
    permission_classes = [IsAuthenticated]

    def get(self, request, property_pk):
        today = date.today()
        month_start = today.replace(day=1)
        pid = property_pk

        todays_collection = Payment.objects.filter(
            property_id=pid, payment_date=today,
        ).aggregate(total=Sum('amount'))['total'] or 0

        monthly_collection = Payment.objects.filter(
            property_id=pid, payment_date__gte=month_start,
        ).aggregate(total=Sum('amount'))['total'] or 0

        pending_dues = Due.objects.filter(
            property_id=pid, status__in=['unpaid', 'partially_paid'],
        ).aggregate(total=Sum('amount'))['total'] or 0

        monthly_expenses = Expense.objects.filter(
            property_id=pid, date__gte=month_start,
        ).aggregate(total=Sum('amount'))['total'] or 0

        tenants = Tenant.objects.filter(property_id=pid)
        active = tenants.filter(status='active', move_in__lte=today).count()
        notice = tenants.filter(status='under_notice').count()
        pending_bookings = tenants.filter(status__in=['active', 'booking_pending'], move_in__gt=today).count()

        recent_payments = Payment.objects.filter(
            property_id=pid,
        ).select_related('tenant').order_by('-payment_date')[:5]

        upcoming_dues = Due.objects.filter(
            property_id=pid,
            status='unpaid',
            due_date__gte=today,
            due_date__lte=today + timedelta(days=7),
        ).select_related('tenant').order_by('due_date')[:10]

        return Response({
            'todays_collection': todays_collection,
            'monthly_collection': monthly_collection,
            'pending_dues': pending_dues,
            'monthly_expenses': monthly_expenses,
            'active_tenants': active,
            'under_notice': notice,
            'pending_bookings': pending_bookings,
            'recent_payments': [
                {
                    'tenant': p.tenant.name,
                    'amount': str(p.amount),
                    'date': str(p.payment_date),
                    'mode': p.mode,
                }
                for p in recent_payments
            ],
            'upcoming_dues': [
                {
                    'tenant': d.tenant.name,
                    'type': d.type,
                    'amount': str(d.amount),
                    'due_date': str(d.due_date),
                }
                for d in upcoming_dues
            ],
        })
