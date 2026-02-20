"""Financials app URL configuration."""
from django.urls import path
from . import views

urlpatterns = [
    # Dues Packages
    path('properties/<uuid:property_pk>/dues-packages/',
         views.DuesPackageViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='dues-packages'),
    path('properties/<uuid:property_pk>/dues-packages/<uuid:pk>/',
         views.DuesPackageViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='dues-package-detail'),
    path('properties/<uuid:property_pk>/dues-packages/<uuid:pk>/toggle/',
         views.DuesPackageViewSet.as_view({'post': 'toggle'}),
         name='dues-package-toggle'),

    # Dues
    path('properties/<uuid:property_pk>/dues/',
         views.DueViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='dues'),
    path('properties/<uuid:property_pk>/dues/<uuid:pk>/',
         views.DueViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update'}),
         name='due-detail'),
    path('properties/<uuid:property_pk>/dues/<uuid:pk>/waive/',
         views.DueViewSet.as_view({'post': 'waive'}),
         name='due-waive'),
    path('properties/<uuid:property_pk>/dues/generate/',
         views.DueViewSet.as_view({'post': 'generate'}),
         name='dues-generate'),
    path('properties/<uuid:property_pk>/dues/summary/',
         views.DueViewSet.as_view({'get': 'summary'}),
         name='dues-summary'),

    # Payments
    path('properties/<uuid:property_pk>/payments/',
         views.PaymentViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='payments'),
    path('properties/<uuid:property_pk>/payments/<uuid:pk>/',
         views.PaymentViewSet.as_view({'get': 'retrieve'}),
         name='payment-detail'),
    path('properties/<uuid:property_pk>/payments/<uuid:pk>/receipt/',
         views.PaymentViewSet.as_view({'get': 'receipt'}),
         name='payment-receipt'),

    # Expenses
    path('properties/<uuid:property_pk>/expenses/',
         views.ExpenseViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='expenses'),
    path('properties/<uuid:property_pk>/expenses/<uuid:pk>/',
         views.ExpenseViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}),
         name='expense-detail'),
    path('properties/<uuid:property_pk>/expenses/summary/',
         views.ExpenseViewSet.as_view({'get': 'summary'}),
         name='expense-summary'),

    # Meter Readings
    path('properties/<uuid:property_pk>/meter-readings/',
         views.MeterReadingViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='meter-readings'),
    path('properties/<uuid:property_pk>/meter-readings/<uuid:pk>/',
         views.MeterReadingViewSet.as_view({'get': 'retrieve'}),
         name='meter-reading-detail'),

    # WhatsApp
    path('properties/<uuid:property_pk>/whatsapp/',
         views.WhatsAppMessageViewSet.as_view({'get': 'list', 'post': 'create'}),
         name='whatsapp-messages'),
    path('properties/<uuid:property_pk>/whatsapp/send-bulk/',
         views.WhatsAppMessageViewSet.as_view({'post': 'send_bulk'}),
         name='whatsapp-send-bulk'),
]
