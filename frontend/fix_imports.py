import re

files_to_fix = {
    "src/components/Sidebar.tsx": [(r", ChevronDown", "")],
    "src/pages/BookingsPage.tsx": [(r", X }", " }")],
    "src/pages/CollectionPage.tsx": [(r", Download }", " }")],
    "src/pages/DuesPage.tsx": [(r", Plus, RefreshCcw, Download, CheckCircle2", ", RefreshCcw"), (r", Plus, RefreshCcw", "")],
    "src/pages/FoodPage.tsx": [(r", Check, X", "")],
    "src/pages/LeadsPage.tsx": [(r", ArrowRight, BarChart3", ""), (r"const total = stats.total \|\| 1;", "stats.total;")],
    "src/pages/OldTenantsPage.tsx": [(r", Download", "")],
    "src/pages/ReportsPage.tsx": [(r"FileBarChart, Download, ", "")],
    "src/pages/RoomsPage.tsx": [(r", propertyApi", "")],
    "src/pages/SettingsPage.tsx": [(r", Trash2, Globe, Phone", ""), (r"const { user, logout } = useAuthStore\(\);", "const { user } = useAuthStore();")],
    "src/pages/TeamPage.tsx": [(r", Shield", "")],
    "src/pages/TenantProfilePage.tsx": [(r", duesApi, paymentApi", ""), (r"User, Home, CreditCard", "Home"), (r"MoreVertical, CheckCircle, Clock", "Clock")],
    "src/pages/TenantsPage.tsx": [(r", Filter", ""), (r", Mail", "")]
}

for filepath, replacements in files_to_fix.items():
    try:
        with open(filepath, 'r') as f:
            content = f.read()
            
        for old, new in replacements:
            content = re.sub(old, new, content)
            
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")
    except Exception as e:
        print(f"Failed {filepath}: {e}")
