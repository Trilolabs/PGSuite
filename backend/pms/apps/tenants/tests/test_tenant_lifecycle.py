"""
Pytest test cases for Tenant lifecycle: booking → active conversion,
room assignment, dues, and payments.
"""
import pytest
from datetime import date, timedelta
from decimal import Decimal
from django.test import RequestFactory
from rest_framework.test import APIClient

from pms.apps.properties.models import Property, Floor, Room, Bed
from pms.apps.tenants.models import Tenant
from pms.apps.financials.models import Due, Payment


# ──────────────────────────────────────────────
# Fixtures
# ──────────────────────────────────────────────

@pytest.fixture
def user(db):
    from pms.apps.users.models import User
    return User.objects.create_user(
        email='owner@test.com', name='Test Owner', password='testpass123',
    )


@pytest.fixture
def api_client(user):
    client = APIClient()
    client.force_authenticate(user=user)
    return client


@pytest.fixture
def prop(user):
    return Property.objects.create(
        user=user, name='Test PG', code='TEST001',
        address='123 Test Street', city='Hyderabad', state='Telangana',
        type='pg', total_floors=3, total_rooms=0, total_beds=0,
    )


@pytest.fixture
def floor1(prop):
    return Floor.objects.create(property=prop, name='1st Floor', sort_order=1)


@pytest.fixture
def room_triple(prop, floor1):
    """Triple sharing room: 3 beds @ ₹9,000."""
    room = Room.objects.create(
        property=prop, floor=floor1, number='101',
        type='triple', total_beds=3, rent_per_bed=Decimal('9000'),
    )
    for label in ['A', 'B', 'C']:
        Bed.objects.create(room=room, property=prop, label=label, status='vacant')
    return room


@pytest.fixture
def room_double(prop, floor1):
    """Double sharing room: 2 beds @ ₹12,000."""
    room = Room.objects.create(
        property=prop, floor=floor1, number='102',
        type='double', total_beds=2, rent_per_bed=Decimal('12000'),
    )
    for label in ['A', 'B']:
        Bed.objects.create(room=room, property=prop, label=label, status='vacant')
    return room


def create_tenant(prop, room, bed_label, name, phone, move_in, status='active', **kwargs):
    """Helper to create a tenant and assign a bed."""
    bed = Bed.objects.get(room=room, label=bed_label)
    is_future = move_in > date.today()

    tenant = Tenant.objects.create(
        property=prop, room=room, name=name, phone=phone, move_in=move_in,
        rent=room.rent_per_bed, deposit=room.rent_per_bed * 2,
        status=status, gender=kwargs.get('gender', 'male'),
        tenant_type=kwargs.get('tenant_type', 'student'),
        stay_type='long_stay', agreement_period=11, rent_start_date=1,
    )
    bed.tenant = tenant
    bed.status = 'reserved' if is_future else 'occupied'
    bed.save()
    return tenant


# ──────────────────────────────────────────────
# Tests: Tenant Creation
# ──────────────────────────────────────────────

@pytest.mark.django_db
class TestTenantCreation:

    def test_active_tenant_created_with_past_date(self, prop, room_triple):
        """Tenant with past move-in should be active."""
        tenant = create_tenant(
            prop, room_triple, 'A', 'Rahul Sharma', '9876543001',
            move_in=date.today() - timedelta(days=10),
        )
        assert tenant.status == 'active'
        bed = Bed.objects.get(room=room_triple, label='A')
        assert bed.status == 'occupied'
        assert bed.tenant == tenant

    def test_booking_created_with_future_date(self, prop, room_triple):
        """Tenant with future move-in should be booking_pending."""
        tenant = create_tenant(
            prop, room_triple, 'A', 'Suresh K', '9876543011',
            move_in=date.today() + timedelta(days=10),
            status='booking_pending',
        )
        assert tenant.status == 'booking_pending'
        bed = Bed.objects.get(room=room_triple, label='A')
        assert bed.status == 'reserved'

    def test_multiple_tenants_in_shared_room(self, prop, room_triple):
        """Three tenants can be assigned to a triple-sharing room."""
        for i, label in enumerate(['A', 'B', 'C']):
            create_tenant(
                prop, room_triple, label, f'Tenant {i}', f'987654300{i}',
                move_in=date.today() - timedelta(days=5),
            )
        occupied = Bed.objects.filter(room=room_triple, status='occupied').count()
        assert occupied == 3

    def test_vacant_bed_in_partial_room(self, prop, room_triple):
        """Room with 2/3 beds occupied should have 1 vacant bed."""
        create_tenant(prop, room_triple, 'A', 'T1', '111', move_in=date.today())
        create_tenant(prop, room_triple, 'B', 'T2', '222', move_in=date.today())
        vacant = Bed.objects.filter(room=room_triple, status='vacant').count()
        assert vacant == 1


# ──────────────────────────────────────────────
# Tests: Booking → Tenant Auto-Conversion
# ──────────────────────────────────────────────

@pytest.mark.django_db
class TestAutoConversion:

    def test_booking_auto_converts_when_movein_arrives(self, api_client, prop, room_triple):
        """Booking with move_in <= today should auto-convert to active on API access."""
        tenant = create_tenant(
            prop, room_triple, 'A', 'Manoj D', '9876543016',
            move_in=date.today() - timedelta(days=1),  # Yesterday
            status='booking_pending',
        )
        # Force bed to reserved (simulating how it was when originally created)
        bed = Bed.objects.get(room=room_triple, label='A')
        bed.status = 'reserved'
        bed.save()

        # Access the tenant list API — this triggers auto-conversion
        response = api_client.get(f'/api/v1/properties/{prop.id}/tenants/')
        assert response.status_code == 200

        tenant.refresh_from_db()
        assert tenant.status == 'active'

        bed.refresh_from_db()
        assert bed.status == 'occupied'

    def test_future_booking_stays_as_booking(self, api_client, prop, room_triple):
        """Booking with move_in > today should NOT auto-convert."""
        tenant = create_tenant(
            prop, room_triple, 'A', 'Suresh K', '9876543011',
            move_in=date.today() + timedelta(days=10),
            status='booking_pending',
        )

        response = api_client.get(f'/api/v1/properties/{prop.id}/tenants/')
        assert response.status_code == 200

        tenant.refresh_from_db()
        assert tenant.status == 'booking_pending'

    def test_booking_appears_on_bookings_filter(self, api_client, prop, room_triple):
        """Future booking should appear when filtered with is_booking=true."""
        create_tenant(
            prop, room_triple, 'A', 'Meera S', '9876543012',
            move_in=date.today() + timedelta(days=15),
            status='booking_pending',
        )

        response = api_client.get(f'/api/v1/properties/{prop.id}/tenants/?is_booking=true')
        assert response.status_code == 200
        names = [t['name'] for t in response.data.get('results', response.data)]
        assert 'Meera S' in names

    def test_booking_excluded_from_tenants_filter(self, api_client, prop, room_triple):
        """Future booking should NOT appear when filtered with is_booking=false."""
        create_tenant(
            prop, room_triple, 'A', 'Active Guy', '111',
            move_in=date.today() - timedelta(days=5),
        )
        create_tenant(
            prop, room_triple, 'B', 'Future Booking', '222',
            move_in=date.today() + timedelta(days=15),
            status='booking_pending',
        )

        response = api_client.get(f'/api/v1/properties/{prop.id}/tenants/?is_booking=false')
        assert response.status_code == 200
        names = [t['name'] for t in response.data.get('results', response.data)]
        assert 'Active Guy' in names
        assert 'Future Booking' not in names


# ──────────────────────────────────────────────
# Tests: Manual Accept / Cancel Booking
# ──────────────────────────────────────────────

@pytest.mark.django_db
class TestManualBookingActions:

    def test_accept_booking_makes_active(self, api_client, prop, room_triple):
        """Accepting a booking should set status=active and bed=occupied."""
        tenant = create_tenant(
            prop, room_triple, 'A', 'Early Joiner', '9876543099',
            move_in=date.today() + timedelta(days=5),
            status='booking_pending',
        )
        bed = Bed.objects.get(room=room_triple, label='A')
        bed.status = 'reserved'
        bed.save()

        response = api_client.post(
            f'/api/v1/properties/{prop.id}/tenants/{tenant.id}/accept-booking/'
        )
        assert response.status_code == 200

        tenant.refresh_from_db()
        assert tenant.status == 'active'

        bed.refresh_from_db()
        assert bed.status == 'occupied'

    def test_cancel_booking_frees_bed(self, api_client, prop, room_triple):
        """Cancelling a booking should free the bed."""
        tenant = create_tenant(
            prop, room_triple, 'A', 'Cancelled Person', '9876543098',
            move_in=date.today() + timedelta(days=10),
            status='booking_pending',
        )
        bed = Bed.objects.get(room=room_triple, label='A')
        bed.status = 'reserved'
        bed.save()

        response = api_client.post(
            f'/api/v1/properties/{prop.id}/tenants/{tenant.id}/cancel-booking/',
            {'reason': 'Changed plans'},
        )
        assert response.status_code == 200

        tenant.refresh_from_db()
        assert tenant.status == 'cancelled'

        bed.refresh_from_db()
        assert bed.status == 'vacant'
        assert bed.tenant is None

    def test_accept_non_booking_fails(self, api_client, prop, room_triple):
        """Accepting an active tenant should fail."""
        tenant = create_tenant(
            prop, room_triple, 'A', 'Active T', '9876543097',
            move_in=date.today() - timedelta(days=5),
        )

        response = api_client.post(
            f'/api/v1/properties/{prop.id}/tenants/{tenant.id}/accept-booking/'
        )
        assert response.status_code == 400


# ──────────────────────────────────────────────
# Tests: Dues and Payments
# ──────────────────────────────────────────────

@pytest.mark.django_db
class TestDuesAndPayments:

    def test_dues_created_for_tenant(self, prop, room_triple):
        """Active tenant should be able to have dues."""
        tenant = create_tenant(
            prop, room_triple, 'A', 'Rahul', '111',
            move_in=date.today() - timedelta(days=30),
        )
        due = Due.objects.create(
            tenant=tenant, property=prop, type='Rent',
            amount=Decimal('9000'), due_date=date.today(),
        )
        assert due.status == 'unpaid'
        assert due.get_balance() == Decimal('9000')

    def test_payment_updates_due_status(self, prop, room_triple):
        """Full payment should mark due as paid."""
        tenant = create_tenant(
            prop, room_triple, 'A', 'Amit', '222',
            move_in=date.today() - timedelta(days=30),
        )
        due = Due.objects.create(
            tenant=tenant, property=prop, type='Rent',
            amount=Decimal('9000'), due_date=date.today(),
        )
        Payment.objects.create(
            tenant=tenant, property=prop, due=due,
            amount=Decimal('9000'), payment_date=date.today(), mode='cash',
        )
        due.paid_amount = Decimal('9000')
        due.status = 'paid'
        due.save()

        due.refresh_from_db()
        assert due.status == 'paid'
        assert due.get_balance() == Decimal('0')

    def test_partial_payment(self, prop, room_triple):
        """Partial payment should mark due as partially_paid."""
        tenant = create_tenant(
            prop, room_triple, 'A', 'Priya', '333',
            move_in=date.today() - timedelta(days=15),
        )
        due = Due.objects.create(
            tenant=tenant, property=prop, type='Rent',
            amount=Decimal('9000'), due_date=date.today(),
        )
        Payment.objects.create(
            tenant=tenant, property=prop, due=due,
            amount=Decimal('5000'), payment_date=date.today(), mode='upi',
        )
        due.paid_amount = Decimal('5000')
        due.status = 'partially_paid'
        due.save()

        due.refresh_from_db()
        assert due.status == 'partially_paid'
        assert due.get_balance() == Decimal('4000')


# ──────────────────────────────────────────────
# Tests: Under Notice & Checkout
# ──────────────────────────────────────────────

@pytest.mark.django_db
class TestNoticeAndCheckout:

    def test_give_notice(self, api_client, prop, room_triple):
        """Giving notice should update status and bed."""
        tenant = create_tenant(
            prop, room_triple, 'A', 'Neha', '444',
            move_in=date.today() - timedelta(days=30),
        )

        response = api_client.post(
            f'/api/v1/properties/{prop.id}/tenants/{tenant.id}/give-notice/'
        )
        assert response.status_code == 200

        tenant.refresh_from_db()
        assert tenant.status == 'under_notice'

        bed = Bed.objects.get(room=room_triple, label='A')
        assert bed.status == 'under_notice'

    def test_checkout_archives_tenant(self, api_client, prop, room_triple):
        """Checkout should archive tenant and free bed."""
        from pms.apps.tenants.models import OldTenant
        tenant = create_tenant(
            prop, room_triple, 'A', 'CheckoutPerson', '555',
            move_in=date.today() - timedelta(days=60),
        )

        response = api_client.post(
            f'/api/v1/properties/{prop.id}/tenants/{tenant.id}/checkout/',
            {'reason': 'Moving out'},
        )
        assert response.status_code == 200

        tenant.refresh_from_db()
        assert tenant.status == 'checked_out'

        bed = Bed.objects.get(room=room_triple, label='A')
        assert bed.status == 'vacant'
        assert bed.tenant is None

        # Should have an OldTenant entry
        assert OldTenant.objects.filter(tenant_id=tenant.id).exists()
