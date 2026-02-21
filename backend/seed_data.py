import os
import django
import random
from datetime import date, timedelta
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pms.settings.test')
django.setup()

from pms.apps.properties.models import Property, Room, Floor
from pms.apps.tenants.models import Tenant
from pms.apps.financials.models import Due, Payment, DuesPackage

prop = Property.objects.first()

if not prop:
    print("No property found. Please create a property first.")
    exit()

# Create floors
f1, _ = Floor.objects.get_or_create(property=prop, name='Floor 1')

# Create some rooms
r1, _ = Room.objects.get_or_create(property=prop, floor=f1, number='A101', total_beds=2, rent_per_bed=5000)
r2, _ = Room.objects.get_or_create(property=prop, floor=f1, number='B102', total_beds=2, rent_per_bed=5500)
r3, _ = Room.objects.get_or_create(property=prop, floor=f1, number='C201', total_beds=3, rent_per_bed=4000)

# Create tenants
def create_tenant(name, phone, room, rent):
    t, _ = Tenant.objects.get_or_create(
        property=prop,
        phone=phone,
        defaults={
            'name': name,
            'room': room,
            'rent': rent,
            'status': 'active',
            'move_in': date.today() - timedelta(days=30),
            'rent_start_date': 1
        }
    )
    return t

t1 = create_tenant('Alice Smith', '9800000001', r1, 5000)
t2 = create_tenant('Bob Johnson', '9800000002', r1, 5000)
t3 = create_tenant('Charlie Brown', '9800000003', r2, 5500)
t4 = create_tenant('Diana Prince', '9800000004', r3, 4000)
t5 = create_tenant('Evan Wright', '9800000005', r3, 4000)

# Generate various Dues
def create_due(tenant, due_type, amount, status, date_offset=0, paid_amount=0):
    Due.objects.create(
        property=prop,
        tenant=tenant,
        type=due_type,
        amount=amount,
        status=status,
        due_date=date.today() + timedelta(days=date_offset),
        paid_amount=paid_amount
    )

# Current Month Dues (due around today)
create_due(t1, 'Rent', 5000, 'unpaid', -2)
create_due(t1, 'Electricity Bill', 500, 'unpaid', -5)
create_due(t2, 'Rent', 5000, 'partially_paid', -1, 2000)
create_due(t2, 'Mess', 1500, 'unpaid', 0)

# Future Dues (due later this month or next month)
create_due(t4, 'Rent', 4000, 'unpaid', 10)
create_due(t5, 'Rent', 4000, 'unpaid', 15)

# Past Dues (Previous months)
create_due(t3, 'Security Deposit', 10000, 'unpaid', -40)
create_due(t3, 'Rent', 5500, 'unpaid', -35)

# Late Fine
create_due(t1, 'System Late Fine', 200, 'unpaid', -1)

# Payments (Collections)
def create_payment(tenant, amount, mode, date_offset, advance=0):
    Payment.objects.create(
        property=prop,
        tenant=tenant,
        amount=amount,
        advance_amount=advance,
        mode=mode,
        payment_date=date.today() + timedelta(days=date_offset)
    )

create_payment(t1, 5000, 'upi', -3) # Paid rent
create_payment(t2, 2000, 'cash', -1) # Partial rent
create_payment(t3, 1000, 'bank_transfer', -20, advance=1000) # Advance Payment

print("Seeded database successfully with diverse test cases!")
