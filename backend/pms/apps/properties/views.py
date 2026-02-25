"""Properties app views — ViewSets for Property, Floor, Room, Bed, Staff, etc."""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from pms.core.permissions import IsPropertyManager, IsAdmin
from .models import (
    Property, PropertySettings, Floor, Room, Bed,
    Staff, BankAccount, Asset, FoodMenu, Listing,
)
from .serializers import (
    PropertyListSerializer, PropertyDetailSerializer, PropertyCreateSerializer,
    PropertySettingsSerializer, FloorSerializer,
    RoomListSerializer, RoomCreateSerializer, BedSerializer,
    StaffSerializer, BankAccountSerializer, AssetSerializer, FoodMenuSerializer,
    ListingSerializer,
)


class PropertyViewSet(viewsets.ModelViewSet):
    """CRUD for properties owned by the current user."""
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code', 'city']
    ordering_fields = ['name', 'created_at']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Property.objects.filter(user=user).select_related('settings')
        return Property.objects.filter(
            staff__user=user,
        ).select_related('settings').distinct()

    def get_serializer_class(self):
        if self.action == 'list':
            return PropertyListSerializer
        if self.action == 'create':
            return PropertyCreateSerializer
        return PropertyDetailSerializer

    @action(detail=True, methods=['get', 'put', 'patch'], url_path='settings')
    def update_settings(self, request, pk=None):
        """Get or update property settings."""
        prop = self.get_object()
        settings_obj, _ = PropertySettings.objects.get_or_create(property=prop)
        if request.method == 'GET':
            return Response(PropertySettingsSerializer(settings_obj).data)
        serializer = PropertySettingsSerializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def vacancy(self, request, pk=None):
        """Vacancy summary for sharing."""
        prop = self.get_object()
        rooms = Room.objects.filter(property=prop, status='active').select_related('floor')
        data = []
        for room in rooms:
            vacant = room.total_beds - room.occupied_beds
            if vacant > 0:
                data.append({
                    'room': room.number,
                    'floor': room.floor.name,
                    'type': room.type,
                    'vacant_beds': vacant,
                    'rent_per_bed': str(room.rent_per_bed),
                    'amenities': room.amenities,
                })
        return Response({
            'property': prop.name,
            'total_vacant': sum(d['vacant_beds'] for d in data),
            'rooms': data,
        })


class FloorViewSet(viewsets.ModelViewSet):
    """Manage floors within a property."""
    serializer_class = FloorSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Floor.objects.filter(
            property_id=self.kwargs['property_pk'],
        ).prefetch_related('rooms')

    def perform_create(self, serializer):
        serializer.save(property_id=self.kwargs['property_pk'])


class RoomViewSet(viewsets.ModelViewSet):
    """Manage rooms within a property."""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['floor', 'type', 'status']
    search_fields = ['number']

    def get_queryset(self):
        return Room.objects.filter(
            property_id=self.kwargs['property_pk'],
        ).select_related('floor').prefetch_related('beds__tenant')

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return RoomCreateSerializer
        return RoomListSerializer

    @action(detail=False, methods=['get'])
    def stats(self, request, property_pk=None):
        """Aggregate room and bed metrics for the property."""
        rooms = Room.objects.filter(property_id=property_pk, status='active')
        
        total_rooms = rooms.count()
        total_beds = sum(r.total_beds for r in rooms)
        occupied_beds = sum(r.occupied_beds for r in rooms)
        
        vacant_rooms = sum(1 for r in rooms if r.occupied_beds == 0)
        semi_vacant_rooms = sum(1 for r in rooms if 0 < r.occupied_beds < r.total_beds)
        occupied_rooms = sum(1 for r in rooms if r.occupied_beds == r.total_beds)
        overbooked_rooms = sum(1 for r in rooms if r.occupied_beds > r.total_beds)
        
        vacant_beds = max(0, total_beds - occupied_beds)
        overbooked_beds = sum(max(0, r.occupied_beds - r.total_beds) for r in rooms)
        
        # We can simulate bookings and unverified using other models, but base them on 0 for now
        new_bookings = 0
        unverified_rooms = 0
        under_notice = 0

        return Response({
            'total_rooms': total_rooms,
            'total_beds': total_beds,
            'vacant_rooms': vacant_rooms,
            'semi_vacant_rooms': semi_vacant_rooms,
            'vacant_beds': vacant_beds,
            'occupied_rooms': occupied_rooms,
            'occupied_beds': occupied_beds,
            'overbooked_rooms': overbooked_rooms,
            'overbooked_beds': overbooked_beds,
            'new_bookings': new_bookings,
            'unverified_rooms': unverified_rooms,
            'under_notice': under_notice,
        })


class BedViewSet(viewsets.ModelViewSet):
    """Manage beds within a room."""
    serializer_class = BedSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Bed.objects.filter(
            room_id=self.kwargs['room_pk'],
        ).select_related('tenant')

    def perform_create(self, serializer):
        room = Room.objects.get(pk=self.kwargs['room_pk'])
        serializer.save(room=room, property=room.property)


class StaffViewSet(viewsets.ModelViewSet):
    """Manage staff within a property."""
    serializer_class = StaffSerializer
    permission_classes = [IsAuthenticated, IsPropertyManager]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['role', 'status']

    def get_queryset(self):
        return Staff.objects.filter(property_id=self.kwargs['property_pk'])

    def perform_create(self, serializer):
        serializer.save(property_id=self.kwargs['property_pk'])


class BankAccountViewSet(viewsets.ModelViewSet):
    """Manage bank accounts for a property."""
    serializer_class = BankAccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BankAccount.objects.filter(property_id=self.kwargs['property_pk'])

    def perform_create(self, serializer):
        serializer.save(property_id=self.kwargs['property_pk'])

    @action(detail=True, methods=['post'])
    def make_primary(self, request, property_pk=None, pk=None):
        """Set this bank account as the primary one."""
        BankAccount.objects.filter(property_id=property_pk).update(is_primary=False)
        account = self.get_object()
        account.is_primary = True
        account.save(update_fields=['is_primary'])
        return Response({'detail': 'Set as primary.'})


class AssetViewSet(viewsets.ModelViewSet):
    """Manage property assets/inventory."""
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'status', 'room']
    search_fields = ['name']

    def get_queryset(self):
        return Asset.objects.filter(property_id=self.kwargs['property_pk']).select_related('room')

    def perform_create(self, serializer):
        serializer.save(property_id=self.kwargs['property_pk'])


class FoodMenuViewSet(viewsets.ModelViewSet):
    """Manage weekly food menu."""
    serializer_class = FoodMenuSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['day_of_week', 'meal_type']

    def get_queryset(self):
        return FoodMenu.objects.filter(property_id=self.kwargs['property_pk'])

    def perform_create(self, serializer):
        serializer.save(property_id=self.kwargs['property_pk'])


class ListingViewSet(viewsets.ModelViewSet):
    """Manage property listings for the public website."""
    serializer_class = ListingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'is_featured']
    search_fields = ['property__name', 'property__city']

    def get_queryset(self):
        return Listing.objects.filter(
            property__user=self.request.user
        ).select_related('property')

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        listing = self.get_object()
        if listing.status == 'listed':
            listing.status = 'unlisted'
        else:
            listing.status = 'listed'
        listing.save(update_fields=['status'])
        return Response(ListingSerializer(listing).data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = self.get_queryset()
        from django.db.models import Sum
        return Response({
            'total': qs.count(),
            'listed': qs.filter(status='listed').count(),
            'unlisted': qs.filter(status='unlisted').count(),
            'draft': qs.filter(status='draft').count(),
            'total_views': qs.aggregate(v=Sum('views_count'))['v'] or 0,
            'total_enquiries': qs.aggregate(e=Sum('enquiries_count'))['e'] or 0,
        })

    @action(detail=False, methods=['post'])
    def auto_create(self, request):
        """Auto-create listings for all properties that don't have one."""
        properties = Property.objects.filter(user=request.user).exclude(listing__isnull=False)
        created = []
        for prop in properties:
            listing = Listing.objects.create(
                property=prop,
                status='unlisted',
                contact_email=request.user.email,
            )
            created.append(listing.id)
        return Response({'created': len(created), 'listing_ids': created})
