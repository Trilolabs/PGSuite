from django.apps import AppConfig


class FinancialsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pms.apps.financials'
    label = 'financials'
    verbose_name = 'Financials & Billing'
