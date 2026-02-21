"""Tenants app — Tenant, OldTenant, Booking, Lead, Document, Agreement, FoodAttendance."""
from pms.core.models import UUIDModel
from django.db import models


# ======================== TENANT ========================

class Tenant(UUIDModel):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('under_notice', 'Under Notice'),
        ('checked_out', 'Checked Out'),
    ]
    GENDER_CHOICES = [('male', 'Male'), ('female', 'Female'), ('other', 'Other')]
    TENANT_TYPE_CHOICES = [
        ('student', 'Student'), ('working', 'Working'),
        ('visitor', 'Visitor'), ('other', 'Other'),
    ]
    STAY_TYPE_CHOICES = [('long_stay', 'Long Stay'), ('short_stay', 'Short Stay')]
    FOOD_CHOICES = [('veg', 'Veg'), ('non_veg', 'Non-Veg'), ('jain', 'Jain'), ('vegan', 'Vegan')]
    FREQUENCY_CHOICES = [
        ('monthly', 'Monthly'), ('quarterly', 'Quarterly'),
        ('half_yearly', 'Half-Yearly'), ('yearly', 'Yearly'),
        ('daily', 'Daily'), ('weekly', 'Weekly'),
    ]
    ELECTRICITY_CHOICES = [
        ('fixed', 'Fixed Amount'), ('unit_based', 'Unit Based'), ('included', 'Included'),
    ]
    KYC_CHOICES = [('pending', 'Pending'), ('verified', 'Verified'), ('rejected', 'Rejected')]

    # --- Core ---
    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='tenants')
    room = models.ForeignKey('properties.Room', on_delete=models.SET_NULL, null=True, blank=True, related_name='tenants')
    # bed linked via Bed.tenant OneToOne

    # --- Personal ---
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='male')
    blood_group = models.CharField(max_length=10, blank=True)
    food_preference = models.CharField(max_length=10, choices=FOOD_CHOICES, blank=True)
    photo_url = models.URLField(blank=True)
    nationality = models.CharField(max_length=50, default='Indian')

    # --- Employment / Education ---
    tenant_type = models.CharField(max_length=20, choices=TENANT_TYPE_CHOICES, default='student')
    company = models.CharField(max_length=255, blank=True)
    designation = models.CharField(max_length=255, blank=True)

    # --- ID / KYC ---
    aadhar_number = models.CharField(max_length=12, blank=True)
    pan_number = models.CharField(max_length=10, blank=True)
    id_proof_type = models.CharField(max_length=50, blank=True)
    id_proof_number = models.CharField(max_length=50, blank=True)
    kyc_status = models.CharField(max_length=20, choices=KYC_CHOICES, default='pending')

    # --- Addresses ---
    current_address = models.TextField(blank=True)
    permanent_address = models.TextField(blank=True)

    # --- Family / Emergency ---
    father_name = models.CharField(max_length=255, blank=True)
    father_phone = models.CharField(max_length=20, blank=True)
    father_occupation = models.CharField(max_length=100, blank=True)
    mother_name = models.CharField(max_length=255, blank=True)
    mother_phone = models.CharField(max_length=20, blank=True)
    mother_occupation = models.CharField(max_length=100, blank=True)
    guardian_name = models.CharField(max_length=255, blank=True)
    guardian_phone = models.CharField(max_length=20, blank=True)
    emergency_contact = models.CharField(max_length=20, blank=True)

    # --- Stay Details ---
    move_in = models.DateField()
    move_out = models.DateField(null=True, blank=True)
    stay_type = models.CharField(max_length=20, choices=STAY_TYPE_CHOICES, default='long_stay')
    notice_period = models.PositiveIntegerField(default=30, help_text='Days')
    lock_in_period = models.PositiveIntegerField(default=0, help_text='Months')
    agreement_period = models.PositiveIntegerField(default=11, help_text='Months')

    # --- Rental Details ---
    rent = models.DecimalField(max_digits=10, decimal_places=2)
    deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    maintenance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    joining_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    rental_frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES, default='monthly')
    rent_start_date = models.PositiveIntegerField(default=1, help_text='Day of month')
    opening_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    advance_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # --- Electricity ---
    electricity_type = models.CharField(max_length=20, choices=ELECTRICITY_CHOICES, default='fixed')
    electricity_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    meter_number = models.CharField(max_length=50, blank=True)
    initial_meter_reading = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # --- Banking ---
    bank_name = models.CharField(max_length=100, blank=True)
    account_number = models.CharField(max_length=30, blank=True)
    ifsc_code = models.CharField(max_length=15, blank=True)
    upi_id = models.CharField(max_length=100, blank=True)

    # --- GST ---
    gst_number = models.CharField(max_length=20, blank=True)
    gst_address = models.TextField(blank=True)

    # --- Meta ---
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    app_status = models.CharField(max_length=20, default='not_downloaded')
    booked_by = models.CharField(max_length=100, blank=True)
    referred_by = models.CharField(max_length=100, blank=True)
    remarks = models.TextField(blank=True)

    class Meta:
        app_label = 'tenants'
        db_table = 'tenants'
        indexes = [
            models.Index(fields=['property', 'status']),
            models.Index(fields=['phone']),
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return f'{self.name} ({self.phone})'


# ======================== OLD TENANT ========================

class OldTenant(UUIDModel):
    SETTLEMENT_CHOICES = [
        ('pending', 'Pending'), ('partial', 'Partial'), ('settled', 'Settled'),
    ]

    tenant_id = models.UUIDField(help_text='Original tenant ID')
    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='old_tenants')
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    room_number = models.CharField(max_length=20)
    move_in = models.DateField()
    move_out = models.DateField()
    total_stay_days = models.PositiveIntegerField(default=0)
    total_rent_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    pending_dues = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deposit_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deposit_refunded = models.BooleanField(default=False)
    settlement_status = models.CharField(max_length=20, choices=SETTLEMENT_CHOICES, default='pending')
    checkout_reason = models.CharField(max_length=100, blank=True)
    checkout_date = models.DateField()
    snapshot_data = models.JSONField(default=dict, blank=True)

    class Meta:
        app_label = 'tenants'
        db_table = 'old_tenants'

    def __str__(self):
        return f'{self.name} (moved out {self.move_out})'


# ======================== BOOKING ========================

class Booking(UUIDModel):
    STATUS_CHOICES = [
        ('pending', 'Pending'), ('confirmed', 'Confirmed'),
        ('converted', 'Converted'), ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    ]

    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='bookings')
    room = models.ForeignKey('properties.Room', on_delete=models.SET_NULL, null=True, blank=True)
    bed = models.ForeignKey('properties.Bed', on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    booking_date = models.DateField()
    move_in_date = models.DateField()
    rent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    token_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    token_paid = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    source = models.CharField(max_length=50, blank=True)
    created_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        app_label = 'tenants'
        db_table = 'bookings'
        ordering = ['-booking_date']

    def __str__(self):
        return f'Booking: {self.name} - {self.move_in_date}'


# ======================== LEAD ========================

class Lead(UUIDModel):
    STATUS_CHOICES = [
        ('new', 'New'), ('contacted', 'Contacted'),
        ('visit_scheduled', 'Visit Scheduled'), ('visit_done', 'Visit Done'),
        ('follow_up', 'Follow Up'), ('converted', 'Converted'),
        ('junk', 'Junk'), ('lost', 'Lost'),
    ]
    SOURCE_CHOICES = [
        ('website', 'Website'), ('walk_in', 'Walk-in'),
        ('referral', 'Referral'), ('whatsapp', 'WhatsApp'),
        ('social_media', 'Social Media'), ('broker', 'Broker'),
        ('other', 'Other'),
    ]

    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='leads')
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    budget_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    budget_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    sharing_preference = models.CharField(max_length=50, blank=True)
    required_facilities = models.TextField(blank=True)
    expected_move_in = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    source = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='website')
    assigned_to = models.ForeignKey('properties.Staff', on_delete=models.SET_NULL, null=True, blank=True)
    notes = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    added_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        app_label = 'tenants'
        db_table = 'leads'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['property', 'status']),
        ]

    def __str__(self):
        return f'Lead: {self.name} ({self.status})'


# ======================== DOCUMENT ========================

class Document(UUIDModel):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, null=True, blank=True, related_name='documents')
    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, null=True, blank=True)
    type = models.CharField(max_length=50)
    file = models.FileField(upload_to='documents/')
    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(default=0)

    class Meta:
        app_label = 'tenants'
        db_table = 'documents'

    def __str__(self):
        return f'{self.type} - {self.file_name}'


# ======================== AGREEMENT ========================

class Agreement(UUIDModel):
    STATUS_CHOICES = [
        ('draft', 'Draft'), ('active', 'Active'),
        ('expired', 'Expired'), ('terminated', 'Terminated'),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='agreements')
    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    rent = models.DecimalField(max_digits=10, decimal_places=2)
    deposit = models.DecimalField(max_digits=10, decimal_places=2)
    terms = models.TextField(blank=True)
    document_url = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    signed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        app_label = 'tenants'
        db_table = 'agreements'

    def __str__(self):
        return f'Agreement: {self.tenant.name} ({self.status})'


# ======================== FOOD ATTENDANCE ========================

class FoodAttendance(UUIDModel):
    MEAL_CHOICES = [
        ('breakfast', 'Breakfast'), ('lunch', 'Lunch'),
        ('snacks', 'Snacks'), ('dinner', 'Dinner'),
    ]

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='food_attendance')
    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE)
    date = models.DateField()
    meal_type = models.CharField(max_length=20, choices=MEAL_CHOICES)
    attended = models.BooleanField(default=True)

    class Meta:
        app_label = 'tenants'
        db_table = 'food_attendance'
        unique_together = ['tenant', 'date', 'meal_type']

    def __str__(self):
        return f'{self.tenant.name} - {self.meal_type} - {self.date}'
