import { useNavigate } from 'react-router-dom';
import { IndianRupee, Users, Lock, Wallet, FileText, AlertTriangle } from 'lucide-react';

interface HomeSummaryBarProps {
    data: any;
    monthName: string;
}

export default function HomeSummaryBar({ data, monthName }: HomeSummaryBarProps) {
    const navigate = useNavigate();

    const stats = [
        { label: "Today's Collection", value: data?.todays_collection, color: '#22c55e', link: '/collection', icon: Wallet },
        { label: `${monthName}'s Collection`, value: data?.monthly_collection, color: '#22c55e', link: '/collection', icon: Wallet },
        { label: `${monthName}'s Dues`, value: data?.monthly_dues, color: '#ef4444', link: '/dues', icon: FileText },
        { label: 'Total Dues', value: data?.total_dues, color: '#ef4444', link: '/dues', icon: FileText },
        { label: `${monthName}'s Expenses`, value: data?.monthly_expenses, color: '#f59e0b', link: '/expense', icon: IndianRupee },
        { label: 'Rent Defaulters', value: data?.defaulters, color: '#ef4444', link: '/tenants', icon: AlertTriangle, isCount: true },
        { label: 'Current Deposit', value: data?.total_deposits, color: '#22c55e', link: '/tenants', icon: Lock },
        { label: 'Unpaid Deposit', value: data?.unpaid_deposits, color: '#ef4444', link: '/dues', icon: Lock },
        { label: `${monthName}'s Profit`, value: data?.monthly_profit, color: '#eab308', link: '/reports', icon: IndianRupee },
    ];

    return (
        <div style={{ marginBottom: 32 }}>
            <div style={{
                display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16,
                scrollbarWidth: 'thin', scrollSnapType: 'x mandatory'
            }}>
                {stats.map((stat, i) => (
                    <div key={i} style={{
                        minWidth: 260, padding: '20px', background: 'var(--bg-card)',
                        borderRadius: 12, border: '1px solid var(--border-primary)',
                        cursor: 'pointer', transition: 'transform 0.2s', scrollSnapAlign: 'start',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                    }}
                        className="hover-card"
                        onClick={() => navigate(stat.link)}
                    >
                        <div>
                            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: stat.color, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                                {!stat.isCount && '₹'}{(stat.value || 0).toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                {stat.label}
                            </div>
                        </div>
                        <div style={{ color: stat.color, opacity: 0.8, background: `${stat.color}15`, padding: 12, borderRadius: '50%' }}>
                            <stat.icon size={26} strokeWidth={2.5} />
                        </div>
                    </div>
                ))}
            </div>
            {/* Minimal gradient line */}
            <div style={{ height: 4, background: 'linear-gradient(90deg, #22c55e 0%, #3b82f6 30%, #f59e0b 60%, #ef4444 100%)', borderRadius: 4, opacity: 0.5, marginTop: -8 }} />
        </div>
    );
}
