"""Properties app views — ViewSets for Property, Floor, Room, Bed, Staff, etc."""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from pms.core.permissions import IsPropertyManager, IsAdmin
from .models import (
    Property, PropertySettings, Floor, Room, Bed,
    Staff, BankAccount, Asset, FoodMenu,
)
from .serializers import (
    PropertyListSerializer, PropertyDetailSerializer, PropertyCreateSerializer,
    PropertySettingsSerializer, FloorSerializer,
    RoomListSerializer, RoomCreateSerializer, BedSerializer,
    StaffSerializer, BankAccountSerializer, AssetSerializer, FoodMenuSerializer,
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
