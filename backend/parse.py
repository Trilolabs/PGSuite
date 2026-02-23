import openpyxl

wb = openpyxl.load_workbook('/home/poornateja/Desktop/proaxon/PG_DASHBOARD/_All_tenant_ledger_report__1771864490994.xlsx', data_only=True)
sheet = wb.active

for i, row in enumerate(sheet.iter_rows(values_only=True)):
    print(f"Row {i}: {row}")
    if i > 5:
        break
