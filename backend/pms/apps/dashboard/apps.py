from django.apps import AppConfig


class DashboardConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pms.apps.dashboard'
    label = 'dashboard'
    verbose_name = 'Dashboard & Analytics'
