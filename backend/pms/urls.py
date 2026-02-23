"""
PMS URL Configuration.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.conf.urls.static import static

schema_view = get_schema_view(
   openapi.Info(
      title="PG Management System API",
      default_version='v1',
      description="Production-ready Property Management System API",
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API v1
    path('api/v1/auth/', include('pms.apps.users.urls')),
    path('api/v1/', include('pms.apps.properties.urls')),
    path('api/v1/', include('pms.apps.tenants.urls')),
    path('api/v1/', include('pms.apps.financials.urls')),
    path('api/v1/maintenance/', include('pms.apps.maintenance.urls')),
    path('api/v1/dashboard/', include('pms.apps.dashboard.urls')),
    path('api/v1/reports/', include('pms.apps.reports.urls')),

    # Swagger UI
    path('docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),

    # Health check
    path('health/', include('pms.core.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
