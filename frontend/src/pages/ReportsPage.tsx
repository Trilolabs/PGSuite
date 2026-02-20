import { TrendingUp, TrendingDown } from 'lucide-react';

export default function ReportsPage() {
    const reports = [
        { title: 'Monthly Revenue', desc: 'Collection vs Dues vs Expenses', icon: TrendingUp, color: 'var(--accent-success)' },
        { title: 'Occupancy Report', desc: 'Bed utilization and vacancy trends', icon: TrendingUp, color: 'var(--accent-info)' },
        { title: 'Defaulter Report', desc: 'Tenants with overdue payments', icon: TrendingDown, color: 'var(--accent-danger)' },
        { title: 'Expense Breakdown', desc: 'Category-wise expense analysis', icon: TrendingDown, color: 'var(--accent-warning)' },
        { title: 'Tenant Turnover', desc: 'Check-ins and check-outs by month', icon: TrendingUp, color: 'var(--accent-primary)' },
        { title: 'Deposit Summary', desc: 'Security deposit tracking', icon: TrendingUp, color: '#8b5cf6' },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <div><h1>Reports</h1><p className="subtitle">Business analytics & insights</p></div>
            </div>
            <div className="grid-3">
                {reports.map(r => (
                    <div className="card" key={r.title} style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                                background: `${r.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <r.icon size={20} style={{ color: r.color }} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 4 }}>{r.title}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
