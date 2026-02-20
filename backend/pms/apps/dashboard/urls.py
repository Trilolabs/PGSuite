"""Dashboard app URL configuration."""
from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.DashboardOverviewView.as_view(), name='dashboard-overview'),
    path('properties/<uuid:property_pk>/dashboard/',
         views.PropertyDashboardView.as_view(), name='property-dashboard'),
]
