import { useNavigate } from 'react-router-dom';

interface HomeSummaryBarProps {
    data: any;
    monthName: string;
}

export default function HomeSummaryBar({ data, monthName }: HomeSummaryBarProps) {
    const navigate = useNavigate();

    const formatCurrency = (amount: number | string) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount));

    const stats = [
        { label: "Today's Collection", value: data?.todays_collection, color: '#22c55e', link: '/collection' },
        { label: `${monthName}'s Collection`, value: data?.monthly_collection, color: '#22c55e', link: '/collection' },
        { label: `${monthName}'s Dues`, value: data?.monthly_dues, color: '#ef4444', link: '/dues' },
        { label: 'Total Dues', value: data?.total_dues, color: '#ef4444', link: '/dues' },
        { label: `${monthName}'s Expenses`, value: data?.monthly_expenses, color: '#f59e0b', link: '/expense' },
        { label: 'Rent Defaulters', value: data?.defaulters, color: '#ef4444', link: '/tenants', isCount: true },
        { label: 'Current Deposit', value: data?.total_deposits, color: '#22c55e', link: '/tenants' },
        { label: 'Unpaid Deposit', value: data?.unpaid_deposits, color: '#ef4444', link: '/dues' },
        { label: `${monthName}'s Profit`, value: data?.monthly_profit, color: '#eab308', link: '/reports' },
    ];

    return (
        <div style={{ marginBottom: 24 }}>
            <div style={{
                display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16,
                scrollbarWidth: 'none'
            }}>
                {stats.map((stat, i) => (
                    <div key={i} style={{
                        cursor: 'pointer', minWidth: 160, padding: '14px 16px', borderRadius: 10,
                        background: 'var(--bg-secondary, #1e293b)',
                        border: '1px solid var(--border-primary, #334155)',
                        transition: 'all 0.2s', flexShrink: 0,
                    }}
                        onClick={() => navigate(stat.link)}
                    >
                        <div style={{ color: stat.color, fontSize: '1.15rem', fontWeight: 700, marginBottom: 4, whiteSpace: 'nowrap' }}>
                            {stat.isCount ? '' : ''}{stat.isCount ? (stat.value || 0) : formatCurrency(stat.value || 0)}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.78rem', lineHeight: 1.3 }}>
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
