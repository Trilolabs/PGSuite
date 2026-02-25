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


class TaskTemplate(UUIDModel):
    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='task_templates')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=50, blank=True)
    checklist_items = models.JSONField(default=list, blank=True, help_text='List of checklist question strings')
    is_active = models.BooleanField(default=True)

    class Meta:
        app_label = 'maintenance'
        db_table = 'task_templates'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Task(UUIDModel):
    STATUS_CHOICES = [
        ('pending', 'Pending'), ('in_progress', 'In Progress'),
        ('completed', 'Completed'), ('cancelled', 'Cancelled'),
    ]
    PRIORITY_CHOICES = [
        ('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('urgent', 'Urgent'),
    ]

    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='tasks')
    template = models.ForeignKey(TaskTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    assigned_to = models.ForeignKey('properties.Staff', on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    room = models.ForeignKey('properties.Room', on_delete=models.SET_NULL, null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    checklist_answers = models.JSONField(default=dict, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        app_label = 'maintenance'
        db_table = 'tasks'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['property', 'status']),
        ]

    def __str__(self):
        return f'{self.title} ({self.status})'


class Review(UUIDModel):
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]
    CATEGORY_CHOICES = [
        ('overall', 'Overall'), ('cleanliness', 'Cleanliness'),
        ('food', 'Food'), ('staff', 'Staff'),
        ('amenities', 'Amenities'), ('maintenance', 'Maintenance'),
        ('safety', 'Safety'), ('value', 'Value for Money'),
    ]

    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='reviews')
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    title = models.CharField(max_length=255, blank=True)
    comment = models.TextField(blank=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='overall')
    response = models.TextField(blank=True, help_text='Admin/owner reply')
    responded_at = models.DateTimeField(null=True, blank=True)
    is_published = models.BooleanField(default=True)

    class Meta:
        app_label = 'maintenance'
        db_table = 'reviews'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.tenant.name} - {self.rating}★ ({self.category})'
