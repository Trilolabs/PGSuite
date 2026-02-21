"""Financials app — DuesPackage, Due, Payment, Expense, MeterReading, WhatsAppMessage."""
from pms.core.models import UUIDModel
from django.db import models


# ======================== DUES PACKAGE ========================

class DuesPackage(UUIDModel):
    TYPE_CHOICES = [
        ('fixed', 'Fixed'), ('variable', 'Variable'), ('unit_based', 'Unit Based'),
    ]
    FREQUENCY_CHOICES = [
        ('monthly', 'Monthly'), ('quarterly', 'Quarterly'),
        ('one_time', 'One-Time'), ('yearly', 'Yearly'), ('daily', 'Daily'),
    ]

    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='dues_packages')
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='fixed')
    default_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='monthly')
    is_active = models.BooleanField(default=True)
    is_system = models.BooleanField(default=False, help_text='System categories cannot be deleted')
    icon = models.CharField(max_length=10, default='💰')
    apply_gst = models.BooleanField(default=False)
    description = models.TextField(blank=True)

    class Meta:
        app_label = 'financials'
        db_table = 'dues_packages'

    def __str__(self):
        return f'{self.name} - {self.property.name}'


# ======================== DUE ========================

class Due(UUIDModel):
    STATUS_CHOICES = [
        ('unpaid', 'Unpaid'), ('partially_paid', 'Partially Paid'),
        ('paid', 'Paid'), ('waived', 'Waived'), ('cancelled', 'Cancelled'),
    ]

    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='dues')
    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='dues')
    dues_package = models.ForeignKey(DuesPackage, on_delete=models.SET_NULL, null=True, blank=True)
    type = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unpaid')
    paid_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    late_fine = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    description = models.TextField(blank=True)

    class Meta:
        app_label = 'financials'
        db_table = 'dues'
        ordering = ['-due_date']
        indexes = [
            models.Index(fields=['property', 'status', 'due_date']),
            models.Index(fields=['tenant', 'status']),
        ]

    def __str__(self):
        return f'{self.type}: ₹{self.amount} - {self.tenant.name}'

    def get_balance(self):
        """Outstanding balance = amount + late_fine - paid_amount."""
        return self.amount + self.late_fine - self.paid_amount


# ======================== PAYMENT ========================

class Payment(UUIDModel):
    MODE_CHOICES = [
        ('cash', 'Cash'), ('upi', 'UPI'), ('bank_transfer', 'Bank Transfer'),
        ('card', 'Card'), ('cheque', 'Cheque'), ('online', 'Online'), ('other', 'Other'),
    ]

    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='payments')
    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='payments')
    due = models.ForeignKey(Due, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    advance_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_date = models.DateField()
    mode = models.CharField(max_length=20, choices=MODE_CHOICES, default='cash')
    reference_number = models.CharField(max_length=100, blank=True)
    receipt_url = models.URLField(blank=True)
    received_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        app_label = 'financials'
        db_table = 'payments'
        ordering = ['-payment_date']
        indexes = [
            models.Index(fields=['property', 'payment_date']),
            models.Index(fields=['tenant', 'payment_date']),
        ]

    def __str__(self):
        return f'₹{self.amount} from {self.tenant.name} ({self.mode})'


# ======================== EXPENSE ========================

class Expense(UUIDModel):
    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='expenses')
    date = models.DateField()
    category = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_mode = models.CharField(max_length=30, blank=True)
    receipt_url = models.URLField(blank=True)
    paid_to = models.CharField(max_length=255, blank=True)
    created_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        app_label = 'financials'
        db_table = 'expenses'
        ordering = ['-date']

    def __str__(self):
        return f'{self.category}: ₹{self.amount} ({self.date})'


# ======================== METER READING ========================

class MeterReading(UUIDModel):
    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='meter_readings')
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='meter_readings')
    meter_number = models.CharField(max_length=50)
    reading_date = models.DateField()
    previous_reading = models.DecimalField(max_digits=10, decimal_places=2)
    current_reading = models.DecimalField(max_digits=10, decimal_places=2)
    units_consumed = models.DecimalField(max_digits=10, decimal_places=2)
    rate_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    photo_url = models.URLField(blank=True)
    due = models.ForeignKey(Due, on_delete=models.SET_NULL, null=True, blank=True, related_name='meter_reading')

    class Meta:
        app_label = 'financials'
        db_table = 'meter_readings'
        ordering = ['-reading_date']

    def __str__(self):
        return f'Meter {self.meter_number}: {self.units_consumed} units'

    def save(self, *args, **kwargs):
        self.units_consumed = self.current_reading - self.previous_reading
        self.total_amount = self.units_consumed * self.rate_per_unit
        super().save(*args, **kwargs)


# ======================== WHATSAPP MESSAGE ========================

class WhatsAppMessage(UUIDModel):
    STATUS_CHOICES = [
        ('queued', 'Queued'), ('sent', 'Sent'),
        ('delivered', 'Delivered'), ('read', 'Read'), ('failed', 'Failed'),
    ]

    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='whatsapp_messages')
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.SET_NULL, null=True, blank=True)
    phone = models.CharField(max_length=20)
    template_name = models.CharField(max_length=100, blank=True)
    message_body = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        app_label = 'financials'
        db_table = 'whatsapp_messages'
        ordering = ['-created_at']

    def __str__(self):
        return f'To {self.phone}: {self.template_name or "custom"}'
