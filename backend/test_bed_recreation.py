import os
import sys
import django
sys.path.append('/home/poornateja/Desktop/proaxon/PG_DASHBOARD/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pms.settings.test')
django.setup()

from pms.apps.properties.models import Property, Floor, Room, Bed
from pms.apps.properties.serializers import RoomCreateSerializer
from rest_framework.request import Request
from rest_framework.test import APIRequestFactory

# Setup
prop = Property.objects.first()
floor = prop.floors.first() or Floor.objects.create(property=prop, name="Test Floor")
room = Room.objects.create(property=prop, floor=floor, number="MISSING-BEDS-1", total_beds=2)

# Simulate missing beds
room.beds.all().delete()
room.refresh_from_db()

print(f"Room: {room.number}, total_beds field: {room.total_beds}, actual beds: {room.beds.count()}")

# Use serializer to update
factory = APIRequestFactory()
request = factory.patch('/')
request.user = None # Not needed for serializer validation here

serializer = RoomCreateSerializer(room, data={'bed_count': 2, 'number': room.number, 'floor_name': floor.name}, context={'view': type('View', (), {'kwargs': {'property_pk': prop.id}}), 'request': request})
if serializer.is_valid():
    serializer.save()
    room.refresh_from_db()
    print(f"After update - total_beds field: {room.total_beds}, actual beds: {room.beds.count()}")
else:
    print(f"Validation Errors: {serializer.errors}")

# Cleanup
room.delete()
print("Test completed.")
