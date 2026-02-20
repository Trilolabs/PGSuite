"""Properties app — Property, Floor, Room, Bed, Settings, Staff, BankAccount, Asset models."""
from pms.core.models import UUIDModel
from django.db import models


# ======================== PROPERTY ========================

class Property(UUIDModel):
    TYPE_CHOICES = [
        ('pg', 'PG'),
        ('hostel', 'Hostel'),
        ('co_living', 'Co-Living'),
        ('flat', 'Flat'),
    ]
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('unisex', 'Unisex'),
    ]

    user = models.ForeignKey(
        'users.User', on_delete=models.CASCADE, related_name='properties',
    )
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pincode = models.CharField(max_length=10, blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='pg')
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default='male')
    total_floors = models.PositiveIntegerField(default=1)
    total_rooms = models.PositiveIntegerField(default=0)
    total_beds = models.PositiveIntegerField(default=0)
    occupied_beds = models.PositiveIntegerField(default=0)
    gst_number = models.CharField(max_length=20, blank=True)
    pan_number = models.CharField(max_length=20, blank=True)
    logo_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        app_label = 'properties'
        db_table = 'properties'
        verbose_name_plural = 'Properties'

    def __str__(self):
        return f'{self.name} ({self.code})'


# ======================== PROPERTY SETTINGS ========================

class PropertySettings(UUIDModel):
    LATE_FINE_TYPE_CHOICES = [
        ('fixed', 'Fixed Amount'),
        ('percentage', 'Percentage of Rent'),
        ('daily', 'Per Day'),
    ]

    property = models.OneToOneField(
        Property, on_delete=models.CASCADE, related_name='settings',
    )
    # Late Fine
    late_fine_enabled = models.BooleanField(default=False)
    late_fine_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    late_fine_type = models.CharField(max_length=20, choices=LATE_FINE_TYPE_CHOICES, default='fixed')
    late_fine_grace_days = models.PositiveIntegerField(default=0)
    # GST
    gst_enabled = models.BooleanField(default=False)
    gst_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=18.00)
    # Defaults
    default_notice_period = models.PositiveIntegerField(default=30, help_text='Days')
    default_lock_in = models.PositiveIntegerField(default=0, help_text='Months')
    default_agreement_period = models.PositiveIntegerField(default=11, help_text='Months')
    default_rent_cycle_day = models.PositiveIntegerField(default=1, help_text='Day of month')
    # Property rules
    curfew_in = models.TimeField(null=True, blank=True)
    curfew_out = models.TimeField(null=True, blank=True)
    kyc_required = models.BooleanField(default=True)
    auto_generate_dues = models.BooleanField(default=True)
    # Communication
    whatsapp_reminders = models.BooleanField(default=False)
    # Agreement
    agreement_template = models.TextField(blank=True)
    # Payment
    payment_qr_url = models.URLField(blank=True)
    upi_id = models.CharField(max_length=100, blank=True)

    class Meta:
        app_label = 'properties'
        db_table = 'property_settings'
        verbose_name_plural = 'Property Settings'

    def __str__(self):
        return f'Settings for {self.property.name}'


# ======================== FLOOR ========================

class Floor(UUIDModel):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='floors')
    name = models.CharField(max_length=50)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        app_label = 'properties'
        db_table = 'floors'
        ordering = ['sort_order']
        unique_together = ['property', 'name']

    def __str__(self):
        return f'{self.property.name} - {self.name}'


# ======================== ROOM ========================

class Room(UUIDModel):
    TYPE_CHOICES = [
        ('single', 'Single'),
        ('double', 'Double'),
        ('triple', 'Triple'),
        ('quad', 'Quad'),
        ('dormitory', 'Dormitory'),
    ]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('maintenance', 'Under Maintenance'),
        ('inactive', 'Inactive'),
    ]

    floor = models.ForeignKey(Floor, on_delete=models.CASCADE, related_name='rooms')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='rooms')
    number = models.CharField(max_length=20)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='single')
    total_beds = models.PositiveIntegerField(default=1)
    occupied_beds = models.PositiveIntegerField(default=0)
    rent_per_bed = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    amenities = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    remarks = models.TextField(blank=True)

    class Meta:
        app_label = 'properties'
        db_table = 'rooms'
        unique_together = ['property', 'number']

    def __str__(self):
        return f'Room {self.number} - {self.property.name}'


# ======================== BED ========================

class Bed(UUIDModel):
    STATUS_CHOICES = [
        ('vacant', 'Vacant'),
        ('occupied', 'Occupied'),
        ('blocked', 'Blocked'),
        ('under_notice', 'Under Notice'),
    ]

    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='beds')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='beds')
    label = models.CharField(max_length=20)
    rent = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,
                               help_text='Override room-level rent')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='vacant')
    tenant = models.OneToOneField(
        'tenants.Tenant', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='bed',
    )

    class Meta:
        app_label = 'properties'
        db_table = 'beds'
        unique_together = ['room', 'label']

    def __str__(self):
        return f'Bed {self.label} - Room {self.room.number}'

    def get_effective_rent(self):
        """Return bed-level rent override, or fall back to room rent."""
        return self.rent if self.rent is not None else self.room.rent_per_bed


# ======================== STAFF ========================

class Staff(UUIDModel):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('terminated', 'Terminated'),
    ]

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='staff')
    user = models.ForeignKey(
        'users.User', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='staff_profiles',
    )
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    role = models.CharField(max_length=50)
    designation = models.CharField(max_length=100, blank=True)
    salary = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    join_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    permissions = models.JSONField(default=dict, blank=True)

    class Meta:
        app_label = 'properties'
        db_table = 'staff'
        verbose_name_plural = 'Staff'

    def __str__(self):
        return f'{self.name} ({self.role})'


# ======================== BANK ACCOUNT ========================

class BankAccount(UUIDModel):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='bank_accounts')
    bank_name = models.CharField(max_length=100)
    account_name = models.CharField(max_length=255)
    account_number = models.CharField(max_length=30)
    ifsc_code = models.CharField(max_length=15)
    upi_id = models.CharField(max_length=100, blank=True)
    is_primary = models.BooleanField(default=False)

    class Meta:
        app_label = 'properties'
        db_table = 'bank_accounts'

    def __str__(self):
        return f'{self.bank_name} - {self.account_number}'


# ======================== ASSET ========================

class Asset(UUIDModel):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('broken', 'Broken'),
        ('in_repair', 'In Repair'),
        ('disposed', 'Disposed'),
    ]

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='assets')
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='assets')
    name = models.CharField(max_length=255)
    category = models.CharField(max_length=50)
    quantity = models.PositiveIntegerField(default=1)
    purchase_date = models.DateField(null=True, blank=True)
    purchase_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    warranty_end = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        app_label = 'properties'
        db_table = 'assets'

    def __str__(self):
        return f'{self.name} ({self.status})'


# ======================== FOOD MENU ========================

class FoodMenu(UUIDModel):
    MEAL_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('snacks', 'Snacks'),
        ('dinner', 'Dinner'),
    ]

    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='food_menus')
    day_of_week = models.PositiveSmallIntegerField(help_text='0=Sunday, 6=Saturday')
    meal_type = models.CharField(max_length=20, choices=MEAL_CHOICES)
    items = models.TextField()
    is_active = models.BooleanField(default=True)

    class Meta:
        app_label = 'properties'
        db_table = 'food_menus'
        unique_together = ['property', 'day_of_week', 'meal_type']

    def __str__(self):
        return f'{self.get_meal_type_display()} - Day {self.day_of_week}'
