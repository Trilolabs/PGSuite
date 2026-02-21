import os
import sys
import django
sys.path.append('/home/poornateja/Desktop/proaxon/PG_DASHBOARD/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pms.settings.test')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()
user = User.objects.first()
refresh = RefreshToken.for_user(user)

client = Client()

data = {
    "number": "A101",
    "type": "single",
    "rent_per_bed": "5000",
    "is_available": True,
    "bed_count": 1,
    "floor_name": "1st Floor",
    "address": ""
}

property_id = "4c9ef1c9-36ce-4df3-b5f6-ecaa728f0911"
room_id = "0f639038-ebf8-4f0a-a05d-2c05e405bd39"
url = f"/api/v1/properties/{property_id}/rooms/{room_id}/"

r = client.patch(url, data=data, content_type='application/json', HTTP_AUTHORIZATION=f'Bearer {str(refresh.access_token)}')
print(f"Status: {r.status_code}")
print(r.content.decode('utf-8'))
