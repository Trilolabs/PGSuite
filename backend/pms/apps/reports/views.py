import csv
import io
from django.core.files.base import ContentFile
from rest_framework import views, status, permissions
from rest_framework.response import Response
from .models import GeneratedReport
from .serializers import GeneratedReportSerializer
from pms.apps.properties.models import Property
from pms.apps.tenants.models import Tenant
from pms.apps.financials.models import Payment

class PastReportsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        report_type = request.query_params.get('type')
        if not report_type:
            return Response({"error": "type parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # In a real multi-tenant app, filter by user's properties.
        reports = GeneratedReport.objects.filter(report_type=report_type).order_by('-created_at')
        serializer = GeneratedReportSerializer(reports, many=True)
        return Response(serializer.data)

class ReportGeneratorView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        report_type = request.data.get('report_type')
        property_ids = request.data.get('property_ids', [])
        
        if report_type not in dict(GeneratedReport.REPORT_TYPES):
            return Response({"error": "Invalid report type"}, status=status.HTTP_400_BAD_REQUEST)

        # Base filter context
        if property_ids:
            properties = Property.objects.filter(id__in=property_ids)
            prop = properties.first() if len(properties) == 1 else None # Link to one property if only one selected
        else:
            properties = Property.objects.all()
            prop = None

        # Build CSV Memory File
        csv_buffer = io.StringIO()
        writer = csv.writer(csv_buffer)

        import datetime
        current_month_abbr = datetime.datetime.now().strftime('%b')
        current_month_full = datetime.datetime.now().strftime('%B')

        # Generate specific report logic
        if report_type == 'all_tenant_ledger':
            cols = [
                'Tenant Name', 'Tenant Phone', 'Tenant Status', 'Room', 'Floor', 'Unit’s Sharing Count', 
                'Move In Date', 'Eviction Date', 'Rent Addition Date', 'Fixed Rent Amount', 
                'Total Security Deposit', 'Current Deposit', 'Carried Forward Dues', 'Net Collected Advance', 
                'Payee Name', 'Due Date Month', 'Total Invoice Value', 'Total Amount Paid', 'Total Amount Pending', 
                'Cashless Deposit', 'Security Deposit Added', 'Security Deposit Paid', 'Security Deposit Adjusted', 
                'Advance Added', 'Advance Paid', 'Advance Adjusted', f'{current_month_abbr} Added', 
                f'{current_month_abbr} Paid', f'{current_month_abbr} Adjusted', 'Rent Added', 'Rent Paid', 
                'Rent Adjusted', 'Bond Expiry', 'Bond ID', 'Bond Link'
            ]
            writer.writerow(cols)
            tenants = Tenant.objects.filter(property__in=properties)
            for t in tenants:
                room_no = t.room.number if t.room else ''
                floor = t.room.floor.name if t.room and hasattr(t.room, 'floor') else ''
                sharing = f"{t.room.total_beds} Beds" if t.room else ''
                doj = t.move_in.strftime('%d %b %Y') if t.move_in else ''
                eviction = t.move_out.strftime('%d %b %Y') if t.move_out else ''
                rent_add_date = '1' # placeholder
                
                writer.writerow([
                    t.name, t.phone, (t.status or '').capitalize(), room_no, floor, sharing,
                    doj, eviction, rent_add_date, t.rent, t.deposit, t.deposit,
                    '0', '0', t.name, current_month_full, t.rent, '0', t.rent,
                    '0', t.deposit, '0', '0', '0', '0', '0', '0', '0', '0',
                    t.rent, '0', '0', '', '', ''
                ])
                
        elif report_type == 'collection':
            writer.writerow(['Collection Amount', 'Date & Time', 'Tenant Name', 'Room No', 'Payment Mode'])
            payments = Payment.objects.filter(tenant__property__in=properties).order_by('-payment_date')
            for p in payments:
                tenant_name = p.tenant.name if p.tenant else 'N/A'
                room_no = p.tenant.room.number if p.tenant and p.tenant.room else 'N/A'
                p_date = p.payment_date.strftime('%Y-%m-%d') if p.payment_date else 'N/A'
                writer.writerow([p.amount, p_date, tenant_name, room_no, p.mode])
        
        # Save to Model
        csv_content = csv_buffer.getvalue()
        csv_buffer.close()

        report_name = f"{report_type}_{request.user.id}.csv"
        
        report = GeneratedReport.objects.create(
            report_type=report_type,
            property=prop,
            generated_by=request.user,
            status='completed'
        )
        report.file.save(report_name, ContentFile(csv_content.encode('utf-8')))
        
        return Response({
            "message": "Report generated successfully", 
            "report_id": report.id,
            "file_url": report.file.url
        })
