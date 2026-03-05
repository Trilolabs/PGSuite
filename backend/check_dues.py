import os
import django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pms.settings.test")
django.setup()

from pms.apps.financials.models import Due
from django.db.models import F, Sum, ExpressionWrapper, DecimalField

prop = Due.objects.first().property
qs = Due.objects.filter(property=prop)
rem_expr = ExpressionWrapper(
    F('amount') + F('late_fine') - F('paid_amount'), 
    output_field=DecimalField()
)
qs = qs.annotate(balance=rem_expr).filter(balance__gt=0)
all_dues = qs.aggregate(t=Sum('balance'))['t'] or 0
print(f"Total Dues DB Amount: {all_dues}")
print(f"Total Due Records with Balance > 0: {qs.count()}")
