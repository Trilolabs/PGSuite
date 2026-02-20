"""Maintenance app views."""
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import Complaint, Inspection
from .serializers import ComplaintSerializer, InspectionSerializer


class ComplaintViewSet(viewsets.ModelViewSet):
    serializer_class = ComplaintSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'category']
    search_fields = ['title', 'tenant__name']
    ordering_fields = ['created_at', 'priority']

    def get_queryset(self):
        return Complaint.objects.filter(
            property_id=self.kwargs['property_pk'],
        ).select_related('tenant', 'room', 'assigned_to')

    def perform_create(self, serializer):
        serializer.save(property_id=self.kwargs['property_pk'])

    @action(detail=True, methods=['post'])
    def assign(self, request, property_pk=None, pk=None):
        complaint = self.get_object()
        staff_id = request.data.get('staff_id')
        complaint.assigned_to_id = staff_id
        complaint.status = 'acknowledged'
        complaint.save(update_fields=['assigned_to_id', 'status'])
        return Response({'detail': 'Complaint assigned.'})

    @action(detail=True, methods=['post'])
    def resolve(self, request, property_pk=None, pk=None):
        complaint = self.get_object()
        complaint.status = 'resolved'
        complaint.resolved_at = timezone.now()
        complaint.resolution_notes = request.data.get('notes', '')
        complaint.save(update_fields=['status', 'resolved_at', 'resolution_notes'])
        return Response({'detail': 'Complaint resolved.'})


class InspectionViewSet(viewsets.ModelViewSet):
    serializer_class = InspectionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['inspection_type', 'room']

    def get_queryset(self):
        return Inspection.objects.filter(
            property_id=self.kwargs['property_pk'],
        ).select_related('room', 'tenant', 'inspector')

    def perform_create(self, serializer):
        serializer.save(property_id=self.kwargs['property_pk'])
