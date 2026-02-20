"""Tenants app URL configuration."""
from django.urls import path
from . import views

urlpatterns = [
    # Tenants
    path('properties/<uuid:property_pk>/tenants/',
         views.TenantViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='tenants'),
    path('properties/<uuid:property_pk>/tenants/<uuid:pk>/',
         views.TenantViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='tenant-detail'),
    path('properties/<uuid:property_pk>/tenants/<uuid:pk>/give-notice/',
         views.TenantViewSet.as_view({'post': 'give_notice'}),
         name='tenant-give-notice'),
    path('properties/<uuid:property_pk>/tenants/<uuid:pk>/checkout/',
         views.TenantViewSet.as_view({'post': 'checkout'}),
         name='tenant-checkout'),
    path('properties/<uuid:property_pk>/tenants/<uuid:pk>/change-room/',
         views.TenantViewSet.as_view({'post': 'change_room'}),
         name='tenant-change-room'),
    path('properties/<uuid:property_pk>/tenants/<uuid:pk>/passbook/',
         views.TenantViewSet.as_view({'get': 'passbook'}),
         name='tenant-passbook'),

    # Documents & Agreements (nested under tenant)
    path('tenants/<uuid:tenant_pk>/documents/',
         views.DocumentViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='tenant-documents'),
    path('tenants/<uuid:tenant_pk>/documents/<uuid:pk>/',
         views.DocumentViewSet.as_view({'get': 'retrieve', 'delete': 'destroy'}),
         name='tenant-document-detail'),
    path('tenants/<uuid:tenant_pk>/agreements/',
         views.AgreementViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='tenant-agreements'),
    path('tenants/<uuid:tenant_pk>/agreements/<uuid:pk>/',
         views.AgreementViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update'}),
         name='tenant-agreement-detail'),

    # Old Tenants
    path('properties/<uuid:property_pk>/old-tenants/',
         views.OldTenantViewSet.as_view({'get': 'list'}),
         name='old-tenants'),
    path('properties/<uuid:property_pk>/old-tenants/<uuid:pk>/',
         views.OldTenantViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update'}),
         name='old-tenant-detail'),
    path('properties/<uuid:property_pk>/old-tenants/<uuid:pk>/refund-deposit/',
         views.OldTenantViewSet.as_view({'post': 'refund_deposit'}),
         name='old-tenant-refund'),

    # Bookings
    path('properties/<uuid:property_pk>/bookings/',
         views.BookingViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='bookings'),
    path('properties/<uuid:property_pk>/bookings/<uuid:pk>/',
         views.BookingViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='booking-detail'),
    path('properties/<uuid:property_pk>/bookings/<uuid:pk>/convert/',
         views.BookingViewSet.as_view({'post': 'convert'}),
         name='booking-convert'),
    path('properties/<uuid:property_pk>/bookings/<uuid:pk>/cancel/',
         views.BookingViewSet.as_view({'post': 'cancel'}),
         name='booking-cancel'),

    # Leads
    path('properties/<uuid:property_pk>/leads/',
         views.LeadViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='leads'),
    path('properties/<uuid:property_pk>/leads/<uuid:pk>/',
         views.LeadViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='lead-detail'),
    path('properties/<uuid:property_pk>/leads/<uuid:pk>/convert-booking/',
         views.LeadViewSet.as_view({'post': 'convert_booking'}),
         name='lead-convert-booking'),
    path('properties/<uuid:property_pk>/leads/stats/',
         views.LeadViewSet.as_view({'get': 'stats'}),
         name='lead-stats'),

    # Food Attendance
    path('properties/<uuid:property_pk>/food/attendance/',
         views.FoodAttendanceViewSet.as_view({'get': 'list'}),
         name='food-attendance'),
    path('properties/<uuid:property_pk>/food/attendance/bulk-mark/',
         views.FoodAttendanceViewSet.as_view({'post': 'bulk_mark'}),
         name='food-attendance-bulk'),
]
