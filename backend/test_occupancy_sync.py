import os
import sys
import django
sys.path.append('/home/poornateja/Desktop/proaxon/PG_DASHBOARD/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pms.settings.test')
django.setup()

from pms.apps.properties.models import Property, Floor, Room, Bed
from django.db import transaction

# Setup
prop = Property.objects.first()
floor = prop.floors.first() or Floor.objects.create(property=prop, name="Test Floor")
room = Room.objects.create(property=prop, floor=floor, number="TEST-SYNC-1")

print(f"Initial room total_beds: {room.total_beds}, occupied_beds: {room.occupied_beds}")

# 1. Create 2 beds
Bed.objects.create(room=room, property=prop, label="A")
Bed.objects.create(room=room, property=prop, label="B")

room.refresh_from_db()
print(f"After adding 2 beds - room total_beds: {room.total_beds}, occupied_beds: {room.occupied_beds}")

# 2. Occupy 1 bed
bed_a = room.beds.get(label="A")
bed_a.status = 'occupied'
bed_a.save()

room.refresh_from_db()
print(f"After occupying 1 bed - room occupied_beds: {room.occupied_beds}")

# 3. Delete 1 vacant bed (B)
bed_b = room.beds.get(label="B")
bed_b.delete()

room.refresh_from_db()
print(f"After deleting vacant bed B - room total_beds: {room.total_beds}, occupied_beds: {room.occupied_beds}")

# Cleanup
room.delete()
print("Test completed.")
