from django.db import models
from pms.apps.users.models import User
from pms.apps.properties.models import Property
import uuid

class GeneratedReport(models.Model):
    REPORT_TYPES = [
        ('all_tenant_ledger', 'All Tenant Ledger Report'),
        ('collection', 'Collection Report'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    report_type = models.CharField(max_length=50, choices=REPORT_TYPES)
    # Can be null if report is across all properties
    property = models.ForeignKey(Property, on_delete=models.CASCADE, null=True, blank=True, related_name='generated_reports')
    generated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_reports')
    file = models.FileField(upload_to='reports/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Store filters used for this report
    date_from = models.DateField(null=True, blank=True)
    date_to = models.DateField(null=True, blank=True)
    date_range_preset = models.CharField(max_length=50, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_report_type_display()} - {self.status}"
