"""Properties app URL configuration."""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'properties', views.PropertyViewSet, basename='property')

urlpatterns = [
    path('', include(router.urls)),

    # Nested under property
    path('properties/<uuid:property_pk>/floors/',
         views.FloorViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='property-floors'),
    path('properties/<uuid:property_pk>/floors/<uuid:pk>/',
         views.FloorViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='property-floor-detail'),

    path('properties/<uuid:property_pk>/rooms/stats/',
         views.RoomViewSet.as_view({'get': 'stats'}),
         name='property-rooms-stats'),
    path('properties/<uuid:property_pk>/rooms/',
         views.RoomViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='property-rooms'),
    path('properties/<uuid:property_pk>/rooms/<uuid:pk>/',
         views.RoomViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='property-room-detail'),

    path('rooms/<uuid:room_pk>/beds/',
         views.BedViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='room-beds'),
    path('rooms/<uuid:room_pk>/beds/<uuid:pk>/',
         views.BedViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='room-bed-detail'),

    path('properties/<uuid:property_pk>/staff/',
         views.StaffViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='property-staff'),
    path('properties/<uuid:property_pk>/staff/<uuid:pk>/',
         views.StaffViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='property-staff-detail'),

    path('properties/<uuid:property_pk>/bank-accounts/',
         views.BankAccountViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='property-banks'),
    path('properties/<uuid:property_pk>/bank-accounts/<uuid:pk>/',
         views.BankAccountViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='property-bank-detail'),
    path('properties/<uuid:property_pk>/bank-accounts/<uuid:pk>/make-primary/',
         views.BankAccountViewSet.as_view({'post': 'make_primary'}),
         name='property-bank-primary'),

    path('properties/<uuid:property_pk>/assets/',
         views.AssetViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='property-assets'),
    path('properties/<uuid:property_pk>/assets/<uuid:pk>/',
         views.AssetViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='property-asset-detail'),

    path('properties/<uuid:property_pk>/food/menu/',
         views.FoodMenuViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='property-food-menu'),
    path('properties/<uuid:property_pk>/food/menu/<uuid:pk>/',
         views.FoodMenuViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='property-food-menu-detail'),

    # Listings
    path('listings/',
         views.ListingViewSet.as_view({'get': 'list'}),
         name='listings'),
    path('listings/<uuid:pk>/',
         views.ListingViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='listing-detail'),
    path('listings/<uuid:pk>/toggle-status/',
         views.ListingViewSet.as_view({'post': 'toggle_status'}),
         name='listing-toggle'),
    path('listings/stats/',
         views.ListingViewSet.as_view({'get': 'stats'}),
         name='listing-stats'),
    path('listings/auto-create/',
         views.ListingViewSet.as_view({'post': 'auto_create'}),
         name='listing-auto-create'),
    path('properties/<uuid:pk>/listing/',
         views.ListingViewSet.as_view({'post': 'create'}),
         name='property-listing-create'),
]
