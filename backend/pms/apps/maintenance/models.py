"""Maintenance app — Complaint and Inspection models."""
from pms.core.models import UUIDModel
from django.db import models


class Complaint(UUIDModel):
    STATUS_CHOICES = [
        ('new', 'New'), ('acknowledged', 'Acknowledged'),
        ('in_progress', 'In Progress'), ('resolved', 'Resolved'),
        ('closed', 'Closed'), ('rejected', 'Rejected'),
    ]
    PRIORITY_CHOICES = [
        ('low', 'Low'), ('medium', 'Medium'),
        ('high', 'High'), ('urgent', 'Urgent'),
    ]

    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='complaints')
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='complaints')
    room = models.ForeignKey('properties.Room', on_delete=models.SET_NULL, null=True, blank=True)
    category = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    photo_urls = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    assigned_to = models.ForeignKey('properties.Staff', on_delete=models.SET_NULL, null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True)

    class Meta:
        app_label = 'maintenance'
        db_table = 'complaints'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['property', 'status']),
            models.Index(fields=['priority']),
        ]

    def __str__(self):
        return f'{self.title} ({self.status})'


class Inspection(UUIDModel):
    TYPE_CHOICES = [
        ('move_in', 'Move-In'), ('move_out', 'Move-Out'), ('routine', 'Routine'),
    ]

    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='inspections')
    room = models.ForeignKey('properties.Room', on_delete=models.CASCADE)
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.SET_NULL, null=True, blank=True)
    inspection_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    scheduled_date = models.DateField()
    completed_date = models.DateField(null=True, blank=True)
    condition_notes = models.TextField(blank=True)
    photos = models.JSONField(default=list, blank=True)
    inspector = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        app_label = 'maintenance'
        db_table = 'inspections'
        ordering = ['-scheduled_date']

    def __str__(self):
        return f'{self.inspection_type} - Room {self.room.number}'
