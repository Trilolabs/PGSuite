from django.apps import AppConfig


class PropertiesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'pms.apps.properties'
    label = 'properties'
    verbose_name = 'Properties & Rooms'

    def ready(self):
        import pms.apps.properties.signals
