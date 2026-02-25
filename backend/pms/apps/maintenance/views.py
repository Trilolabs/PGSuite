"""Maintenance app views."""
from datetime import date

from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import Complaint, Inspection, Review, TaskTemplate, Task
from .serializers import (
    ComplaintSerializer, InspectionSerializer, ReviewSerializer,
    TaskTemplateSerializer, TaskSerializer,
)


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


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['rating', 'category', 'is_published']
    search_fields = ['title', 'comment', 'tenant__name']
    ordering_fields = ['created_at', 'rating']

    def get_queryset(self):
        return Review.objects.filter(
            property_id=self.kwargs['property_pk'],
        ).select_related('tenant', 'tenant__room')

    def perform_create(self, serializer):
        serializer.save(property_id=self.kwargs['property_pk'])

    @action(detail=True, methods=['post'])
    def respond(self, request, property_pk=None, pk=None):
        review = self.get_object()
        review.response = request.data.get('response', '')
        review.responded_at = timezone.now()
        review.save(update_fields=['response', 'responded_at'])
        return Response(ReviewSerializer(review).data)

    @action(detail=False, methods=['get'])
    def summary(self, request, property_pk=None):
        from django.db.models import Avg, Count
        qs = self.get_queryset()
        avg_rating = qs.aggregate(avg=Avg('rating'))['avg'] or 0
        total = qs.count()
        by_category = list(qs.values('category').annotate(
            avg_rating=Avg('rating'), count=Count('id')
        ))
        by_rating = list(qs.values('rating').annotate(count=Count('id')).order_by('rating'))
        return Response({
            'average_rating': round(avg_rating, 1),
            'total_reviews': total,
            'by_category': by_category,
            'by_rating': by_rating,
        })


class TaskTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = TaskTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active', 'category']
    search_fields = ['name']

    def get_queryset(self):
        return TaskTemplate.objects.filter(property_id=self.kwargs['property_pk'])

    def perform_create(self, serializer):
        serializer.save(property_id=self.kwargs['property_pk'])


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'assigned_to']
    search_fields = ['title']
    ordering_fields = ['created_at', 'due_date', 'priority']

    def get_queryset(self):
        return Task.objects.filter(
            property_id=self.kwargs['property_pk'],
        ).select_related('assigned_to', 'room', 'template')

    def perform_create(self, serializer):
        serializer.save(property_id=self.kwargs['property_pk'])

    @action(detail=True, methods=['post'])
    def complete(self, request, property_pk=None, pk=None):
        task = self.get_object()
        task.status = 'completed'
        task.completed_at = timezone.now()
        task.completed_by = request.user
        task.save(update_fields=['status', 'completed_at', 'completed_by'])
        return Response(TaskSerializer(task).data)

    @action(detail=False, methods=['get'])
    def stats(self, request, property_pk=None):
        from django.db.models import Count
        qs = self.get_queryset()
        by_status = dict(qs.values_list('status').annotate(c=Count('id')).values_list('status', 'c'))
        return Response({
            'total': qs.count(),
            'pending': by_status.get('pending', 0),
            'in_progress': by_status.get('in_progress', 0),
            'completed': by_status.get('completed', 0),
            'overdue': qs.filter(status__in=['pending', 'in_progress'], due_date__lt=date.today()).count(),
        })
