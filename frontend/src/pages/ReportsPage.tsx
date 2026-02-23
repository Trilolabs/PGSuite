import { useState } from 'react';
import { FileText, Receipt, Search, Building2, AlertTriangle, DoorOpen } from 'lucide-react';
import ReportGenerateDrawer from '../components/ReportGenerateDrawer';
import PastReportsDrawer from '../components/PastReportsDrawer';

const reportCategories = [
    {
        title: "Tenant Reports",
        items: [
            {
                id: "all_tenant_ledger",
                title: "All tenant ledger report",
                icon: FileText,
                fields: ["Tenant, Room No & DOJ", "Monthly Rent Amount", "Invoice Amount", "Invoice Collected", "Total unpaid", "Total paid"]
            },
            {
                id: "detailed_tenant",
                title: "Detailed Tenant Report",
                icon: FileText,
                fields: ["List of Tenant & Rooms", "Tenant KYC Details", "Unpaid Dues", "Collected Amount", "Remarks & Descriptions"]
            },
            {
                id: "all_bookings",
                title: "All Bookings Report",
                icon: FileText,
                fields: ["List of Tenant & Rooms", "Tenant KYC Details", "Unpaid Dues", "Collected Amount", "Remarks & Descriptions"]
            },
            {
                id: "tenant",
                title: "Tenant Report",
                icon: FileText,
                fields: ["List of Tenant & Rooms", "Tenant KYC Details", "Unpaid Dues", "Collected Amount", "Remarks & Descriptions"]
            },
            {
                id: "old_tenant",
                title: "Old Tenant Report",
                icon: FileText,
                fields: ["Tenant Details", "Eviction Date", "Unpaid Dues & Loss", "Reason of Eviction"]
            },
            {
                id: "late_checkin",
                title: "Late Check-in Report",
                icon: FileText,
                fields: ["Tenant & Room No.", "Tenant Contact", "Late Check-in Date & Time", "Late Check-in reason"]
            }
        ]
    },
    {
        title: "Financial & Collection Reports",
        items: [
            {
                id: "dues_pdf",
                title: "Dues PDF",
                icon: FileText,
                fields: ["Tenant & Room No.", "Unpaid Dues Amount", "Dues Category", "Descriptions"]
            },
            {
                id: "collection_pdf",
                title: "Collection PDF",
                icon: FileText,
                fields: ["Tenant & Room No.", "Date & Time", "Collection Amount", "Payment Mode"]
            },
            {
                id: "collection",
                title: "Collection Report",
                icon: Receipt,
                fields: ["Collection Amount", "Date & Time", "Tenant & Room No.", "Payment Mode"]
            },
            {
                id: "bank_settlement",
                title: "Bank Settlement Report",
                icon: Receipt,
                fields: ["Tenant & Room No.", "Collected Amount", "Date & Time", "Dues Category"]
            },
            {
                id: "expense",
                title: "Expense Report",
                icon: Receipt,
                fields: ["Expense Category", "Property Name", "Amount", "Date & Remarks"]
            },
            {
                id: "monthly_financial",
                title: "Monthly Financial Statement",
                icon: Receipt,
                fields: ["Total Income", "Total Expenses", "Net Profit/Loss", "Outstanding Dues"]
            }
        ]
    },
    {
        title: "Occupancy & Operations",
        items: [
            {
                id: "room_occupancy",
                title: "Room Occupancy Report",
                icon: DoorOpen,
                fields: ["Tenant & Room No.", "Occupancy Status", "Unpaid Dues", "Projected Rent", "Remarks & Descriptions"]
            },
            {
                id: "complaint",
                title: "Complaint Report",
                icon: AlertTriangle,
                fields: ["Complaint Details", "Complaint Image", "Latest Status", "Tenant & Room No."]
            }
        ]
    },
    {
        title: "Property Summaries",
        items: [
            {
                id: "all_property_monthly",
                title: "All Property Monthly Summary Report",
                icon: Building2,
                fields: ["Rooms & Tenants Count", "Bookings & Leads Count", "Current Month Dues", "Dues Breakup"]
            },
            {
                id: "all_property",
                title: "All Property Summary Report",
                icon: Building2,
                fields: ["Rooms & Tenants Count", "Bookings & Leads Count", "Total Potential Collection", "Total Collection Till Now"]
            }
        ]
    }
];

export default function ReportsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [generateDrawer, setGenerateDrawer] = useState<{ isOpen: boolean; reportId: string; reportTitle: string }>({ isOpen: false, reportId: '', reportTitle: '' });
    const [pastReportsDrawer, setPastReportsDrawer] = useState<{ isOpen: boolean; reportId: string; reportTitle: string }>({ isOpen: false, reportId: '', reportTitle: '' });

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ color: 'var(--text-primary)' }}>Reports</h1>
                    <p className="subtitle" style={{ color: 'var(--text-secondary)' }}>Business analytics & insights</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ position: 'relative', width: 300 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search reports..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: 36 }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                {reportCategories.map((category) => {
                    const filteredItems = category.items.filter(item => item.title.toLowerCase().includes(searchQuery.toLowerCase()));
                    if (filteredItems.length === 0) return null;

                    return (
                        <div key={category.title}>
                            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>{category.title}</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                                {filteredItems.map(report => (
                                    <div key={report.id} className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                        <div style={{ padding: 20, flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                                                <report.icon size={18} style={{ color: 'var(--accent-success)' }} />
                                                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>{report.title}</h3>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                {report.fields.map(field => (
                                                    <div key={field} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                        </div>
                                                        {field}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid var(--border-primary)', background: 'var(--bg-secondary)' }}>
                                            <button
                                                onClick={() => setGenerateDrawer({ isOpen: true, reportId: report.id, reportTitle: report.title })}
                                                style={{ padding: '12px', border: 'none', background: 'var(--accent-primary)', color: 'white', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer', margin: 10, borderRadius: 6 }}
                                            >
                                                Generate Report
                                            </button>
                                            <button
                                                onClick={() => setPastReportsDrawer({ isOpen: true, reportId: report.id, reportTitle: report.title })}
                                                style={{ padding: '12px', border: '1px solid var(--accent-primary)', background: 'transparent', color: 'var(--accent-primary)', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer', margin: '10px 10px 10px 0', borderRadius: 6 }}
                                            >
                                                View Past Reports
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Drawers */}
            <ReportGenerateDrawer
                isOpen={generateDrawer.isOpen}
                onClose={() => setGenerateDrawer({ ...generateDrawer, isOpen: false })}
                reportId={generateDrawer.reportId}
                reportTitle={generateDrawer.reportTitle}
            />

            <PastReportsDrawer
                isOpen={pastReportsDrawer.isOpen}
                onClose={() => setPastReportsDrawer({ ...pastReportsDrawer, isOpen: false })}
                reportId={pastReportsDrawer.reportId}
                reportTitle={pastReportsDrawer.reportTitle}
            />
        </div>
    );
}
