"""Seed test data: 3 floors × 4 rooms, ~20 tenants with realistic scenarios."""
from django.core.management.base import BaseCommand
from datetime import date, timedelta
from decimal import Decimal


class Command(BaseCommand):
    help = 'Seeds the database with test rooms, tenants, dues, and payments.'

    def handle(self, *args, **options):
        from pms.apps.properties.models import Property, Floor, Room, Bed
        from pms.apps.tenants.models import Tenant
        from pms.apps.financials.models import Due, Payment

        prop = Property.objects.first()
        if not prop:
            self.stderr.write('No property found. Create one first.')
            return

        self.stdout.write(f'Using property: {prop.name} (ID: {prop.id})')

        # --- CLEAN existing data ---
        self.stdout.write('Cleaning existing data...')
        Payment.objects.filter(property=prop).delete()
        Due.objects.filter(property=prop).delete()
        Bed.objects.filter(property=prop).delete()
        Tenant.objects.filter(property=prop).delete()
        Room.objects.filter(property=prop).delete()
        Floor.objects.filter(property=prop).delete()

        today = date.today()

        # --- FLOORS ---
        floors = []
        for i, name in enumerate(['1st Floor', '2nd Floor', '3rd Floor'], start=1):
            f = Floor.objects.create(property=prop, name=name, sort_order=i)
            floors.append(f)
            self.stdout.write(f'  Created floor: {name}')

        # --- ROOMS & BEDS ---
        room_configs = [
            # (number, floor_idx, type, beds, rent, amenities)
            ('101', 0, 'triple', 3, 9000, ['WiFi', 'CCTV', 'Cupboard']),
            ('102', 0, 'triple', 3, 9000, ['WiFi', 'CCTV', 'Food']),
            ('103', 0, 'double', 2, 12000, ['AC', 'WiFi', 'Washroom', 'TV']),
            ('104', 0, 'double', 2, 12000, ['AC', 'WiFi', 'Washroom']),
            ('201', 1, 'triple', 3, 9000, ['WiFi', 'Laundry', 'CCTV']),
            ('202', 1, 'triple', 3, 9000, ['WiFi', 'CCTV']),
            ('203', 1, 'double', 2, 12000, ['AC', 'WiFi', 'Geyser', 'TV']),
            ('204', 1, 'double', 2, 12000, ['AC', 'WiFi', 'Washroom']),
            ('301', 2, 'triple', 3, 9000, ['WiFi', 'CCTV', 'Cupboard']),
            ('302', 2, 'triple', 3, 9000, ['WiFi', 'Food', 'CCTV']),
            ('303', 2, 'double', 2, 12000, ['AC', 'WiFi', 'Geyser']),
            ('304', 2, 'double', 2, 12000, ['AC', 'WiFi', 'Washroom', 'Balcony']),
        ]

        rooms = {}
        beds = {}
        labels = ['A', 'B', 'C', 'D']

        for num, fi, rtype, bed_count, rent, amenities in room_configs:
            room = Room.objects.create(
                property=prop, floor=floors[fi], number=num,
                type=rtype, total_beds=bed_count, rent_per_bed=Decimal(rent),
                amenities=amenities, is_available=True,
            )
            rooms[num] = room
            beds[num] = []
            for b in range(bed_count):
                bed = Bed.objects.create(
                    room=room, property=prop, label=labels[b], status='vacant',
                )
                beds[num].append(bed)

        self.stdout.write(f'  Created {len(rooms)} rooms with beds')

        # --- TENANTS ---
        tenant_configs = [
            # (name, phone, room, bed_idx, move_in, rent, deposit, status, gender, tenant_type)
            # Floor 1
            ('Rahul Sharma',  '9876543001', '101', 0, today - timedelta(days=32), 9000, 18000, 'active', 'male', 'working'),
            ('Priya Reddy',   '9876543002', '101', 1, today - timedelta(days=18), 9000, 18000, 'active', 'female', 'working'),
            ('Kiran Kumar',   '9876543003', '101', 2, today - timedelta(days=4),  9000, 18000, 'active', 'male', 'student'),
            ('Amit Singh',    '9876543004', '102', 0, today - timedelta(days=49), 9000, 18000, 'active', 'male', 'working'),
            ('Neha Gupta',    '9876543005', '102', 1, today - timedelta(days=32), 9000, 18000, 'under_notice', 'female', 'student'),
            # 102-C vacant
            ('Ravi Teja',     '9876543006', '103', 0, today - timedelta(days=23), 12000, 24000, 'active', 'male', 'working'),
            ('Sanjay Rao',    '9876543007', '103', 1, today - timedelta(days=23), 12000, 24000, 'active', 'male', 'student'),
            ('Deepa Nair',    '9876543008', '104', 0, today - timedelta(days=2),  12000, 24000, 'active', 'female', 'working'),
            # 104-B vacant

            # Floor 2
            ('Vijay Menon',   '9876543009', '201', 0, today - timedelta(days=63), 9000, 18000, 'active', 'male', 'working'),
            ('Arjun Patel',   '9876543010', '201', 1, today - timedelta(days=32), 9000, 18000, 'active', 'male', 'student'),
            ('Suresh Khanna', '9876543011', '201', 2, today + timedelta(days=10), 9000, 18000, 'booking_pending', 'male', 'student'),
            ('Meera Saxena',  '9876543012', '202', 0, today + timedelta(days=15), 9000, 18000, 'booking_pending', 'female', 'working'),
            # 202-B,C vacant
            ('Lakshmi Venu',  '9876543013', '203', 0, today - timedelta(days=28), 12000, 24000, 'active', 'female', 'working'),
            ('Ananya Roy',    '9876543014', '203', 1, today - timedelta(days=28), 12000, 24000, 'active', 'female', 'student'),
            # 204 fully vacant

            # Floor 3
            ('Pooja Tiwari',  '9876543015', '301', 0, today - timedelta(days=44), 9000, 18000, 'active', 'female', 'working'),
            ('Manoj Desai',   '9876543016', '301', 1, today - timedelta(days=1),  9000, 18000, 'booking_pending', 'male', 'student'),  # Should auto-convert
            # 301-C vacant
            ('Kavya Bhat',    '9876543017', '302', 0, today - timedelta(days=32), 9000, 18000, 'active', 'female', 'student'),
            ('Naveen Reddy',  '9876543018', '302', 1, today - timedelta(days=13), 9000, 18000, 'active', 'male', 'working'),
            # 302-C vacant
            ('Swathi Murthy', '9876543019', '303', 0, today - timedelta(days=4),  12000, 24000, 'active', 'female', 'student'),
            ('Rajesh Gowda',  '9876543020', '303', 1, today - timedelta(days=18), 12000, 24000, 'active', 'male', 'working'),
            # 304 fully vacant
        ]

        created_tenants = {}
        for name, phone, room_num, bed_idx, move_in, rent, deposit, status, gender, ttype in tenant_configs:
            is_future = move_in > today
            bed = beds[room_num][bed_idx]

            tenant = Tenant.objects.create(
                property=prop, room=rooms[room_num],
                name=name, phone=phone, move_in=move_in,
                rent=Decimal(rent), deposit=Decimal(deposit),
                status=status, gender=gender, tenant_type=ttype,
                stay_type='long_stay', agreement_period=11,
                rent_start_date=1,
            )

            # Assign bed
            bed.tenant = tenant
            bed.status = 'reserved' if is_future else ('under_notice' if status == 'under_notice' else 'occupied')
            bed.save()

            # Update room occupied count
            room = rooms[room_num]
            room.occupied_beds = room.beds.exclude(status='vacant').count()
            room.save()

            created_tenants[name] = tenant
            self.stdout.write(f'  Tenant: {name} -> Room {room_num}-{labels[bed_idx]} ({status})')

        # --- DUES & PAYMENTS ---
        self.stdout.write('Creating dues and payments...')

        for name, tenant in created_tenants.items():
            if tenant.status == 'booking_pending' and tenant.move_in > today:
                continue  # No dues for future bookings

            # Security Deposit due
            Due.objects.create(
                tenant=tenant, property=prop, type='Security Deposit',
                amount=tenant.deposit, due_date=tenant.move_in, status='unpaid',
            )

            # Monthly rent dues (from move-in to today)
            current = tenant.move_in.replace(day=1)
            while current <= today:
                Due.objects.create(
                    tenant=tenant, property=prop, type='Rent',
                    amount=tenant.rent, due_date=current.replace(day=1),
                    status='unpaid',
                )
                # Next month
                if current.month == 12:
                    current = current.replace(year=current.year + 1, month=1)
                else:
                    current = current.replace(month=current.month + 1)

        # --- Create some payments for specific tenants ---
        def pay(tenant_name, amount, days_ago, mode='cash'):
            tenant = created_tenants[tenant_name]
            unpaid = tenant.dues.filter(status__in=['unpaid', 'partially_paid']).order_by('due_date').first()
            Payment.objects.create(
                tenant=tenant, property=prop, due=unpaid,
                amount=Decimal(amount), payment_date=today - timedelta(days=days_ago),
                mode=mode,
            )
            if unpaid:
                unpaid.paid_amount += Decimal(amount)
                if unpaid.paid_amount >= unpaid.amount:
                    unpaid.status = 'paid'
                else:
                    unpaid.status = 'partially_paid'
                unpaid.save()

        # Rahul: paid deposit + 1 month rent
        pay('Rahul Sharma', 18000, 30, 'upi')    # deposit
        pay('Rahul Sharma', 9000,  28, 'cash')    # rent

        # Priya: paid deposit only
        pay('Priya Reddy', 18000, 16, 'bank_transfer')

        # Amit: fully paid (deposit + all rent)
        pay('Amit Singh', 18000, 45, 'cash')
        pay('Amit Singh', 9000,  40, 'upi')
        pay('Amit Singh', 9000,  10, 'upi')

        # Ravi Teja: paid deposit
        pay('Ravi Teja', 24000, 20, 'bank_transfer')

        # Vijay: oldest tenant, paid deposit + 2 months
        pay('Vijay Menon', 18000, 60, 'cash')
        pay('Vijay Menon', 9000,  55, 'cash')
        pay('Vijay Menon', 9000,  25, 'upi')

        # Pooja: paid everything (deposit + rent)
        pay('Pooja Tiwari', 18000, 40, 'upi')
        pay('Pooja Tiwari', 9000,  35, 'cash')

        # Deepa: paid deposit via UPI
        pay('Deepa Nair', 24000, 1, 'upi')

        # Update property totals
        prop.total_floors = 3
        prop.total_rooms = Room.objects.filter(property=prop).count()
        prop.total_beds = Bed.objects.filter(property=prop).count()
        prop.occupied_beds = Bed.objects.filter(property=prop, status__in=['occupied', 'under_notice', 'reserved']).count()
        prop.save()

        # Summary
        total_tenants = Tenant.objects.filter(property=prop).count()
        total_dues = Due.objects.filter(property=prop).count()
        total_payments = Payment.objects.filter(property=prop).count()
        active = Tenant.objects.filter(property=prop, status='active').count()
        bookings = Tenant.objects.filter(property=prop, status='booking_pending').count()
        notice = Tenant.objects.filter(property=prop, status='under_notice').count()

        self.stdout.write(self.style.SUCCESS(f'''
╔══════════════════════════════════════╗
║       TEST DATA SEEDED!              ║
╠══════════════════════════════════════╣
║  Floors:    3                        ║
║  Rooms:     {prop.total_rooms:<25}║
║  Beds:      {prop.total_beds:<25}║
║  Tenants:   {total_tenants:<25}║
║    Active:  {active:<25}║
║    Booking: {bookings:<25}║
║    Notice:  {notice:<25}║
║  Dues:      {total_dues:<25}║
║  Payments:  {total_payments:<25}║
╚══════════════════════════════════════╝
        '''))
