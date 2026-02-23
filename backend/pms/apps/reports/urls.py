from django.urls import path
from .views import ReportGeneratorView, PastReportsView

urlpatterns = [
    path('generate/', ReportGeneratorView.as_view(), name='report-generate'),
    path('past/', PastReportsView.as_view(), name='report-past'),
]
