import { useNavigate } from 'react-router-dom';
import {
    UserPlus, CreditCard, UserCheck, FileText,
    IndianRupee, Building2, CalendarCheck, Share2, Settings
} from 'lucide-react';

export default function QuickActionsGrid() {
    const navigate = useNavigate();

    const quickActions = [
        { label: 'Add Tenant', icon: UserPlus, color: '#3b82f6', path: '/tenants/add' },
        { label: 'Receive Payment', icon: CreditCard, color: '#22c55e', path: '/collection' },
        { label: 'Add Lead', icon: UserCheck, color: '#6366f1', path: '/leads' },
        { label: 'Add Expense', icon: FileText, color: '#eab308', path: '/expense' },
        { label: 'Add Dues', icon: IndianRupee, color: '#ef4444', path: '/dues' },
        { label: 'Add Bank Account', icon: Building2, color: '#8b5cf6', path: '/banks' },
        { label: 'Add Booking', icon: CalendarCheck, color: '#0ea5e9', path: '/bookings' },
        { label: 'Share Website', icon: Share2, color: '#3b82f6', action: () => alert('Share website preview') },
        { label: 'Agreement Settings', icon: Settings, color: '#64748b', path: '/settings' },
    ];

    return (
        <div style={{ marginTop: 24, marginBottom: 40 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 20, color: 'var(--text-primary)' }}>Quick Actions</h3>
            <div style={{
                display: 'flex',
                gap: 20,
                overflowX: 'auto',
                paddingBottom: 16,
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }} className="no-scrollbar">
                {quickActions.map((act, i) => (
                    <div
                        key={i}
                        onClick={() => act.path ? navigate(act.path) : act.action?.()}
                        style={{
                            flex: '0 0 auto',
                            width: 140,
                            textAlign: 'center', cursor: 'pointer',
                            padding: '24px 16px', borderRadius: 16,
                            background: 'var(--bg-card)',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                            border: '1px solid var(--border-primary)',
                            transition: 'all 0.2s',
                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                        }}
                        className="hover-card"
                    >
                        <div style={{
                            width: 60, height: 60, borderRadius: 16, margin: '0 0 16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: `${act.color}15`, color: act.color,
                        }}>
                            <act.icon size={28} strokeWidth={2.5} />
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.3 }}>
                            {act.label}
                        </div>
                    </div>
                ))}
            </div>
            <style>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
