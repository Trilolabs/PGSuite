from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Bed, Room, Property

def update_occupancy(room):
    """Update occupied_beds and total_beds for room and its property."""
    # Update Room counts
    room.total_beds = room.beds.count()
    room.occupied_beds = room.beds.filter(status='occupied').count()
    room.save(update_fields=['total_beds', 'occupied_beds'])
    
    # Update Property counts
    prop = room.property
    prop.total_rooms = prop.rooms.count()
    prop.total_beds = sum(r.total_beds for r in prop.rooms.all())
    prop.occupied_beds = sum(r.occupied_beds for r in prop.rooms.all())
    prop.save(update_fields=['total_rooms', 'total_beds', 'occupied_beds'])

@receiver(post_save, sender=Bed)
def bed_saved(sender, instance, **kwargs):
    update_occupancy(instance.room)

@receiver(post_delete, sender=Bed)
def bed_deleted(sender, instance, **kwargs):
    update_occupancy(instance.room)
