import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    IndianRupee,
    CalendarCheck, DoorOpen, Plus,
    UserPlus, CreditCard, UserCheck, FileText, Building2,
    Settings,
} from 'lucide-react';
import { dashboardApi, propertyApi } from '../lib/api';
import { usePropertyStore } from '../stores/propertyStore';

interface DashboardData {
    todays_collection: number;
    monthly_collection: number;
    monthly_dues: number;
    total_dues: number;
    monthly_expenses: number;
    monthly_profit: number;
    total_tenants: number;
    under_notice: number;
    defaulters: number;
    total_deposits: number;
    unpaid_deposits: number;
    pending_bookings: number;
    active_leads: number;
    properties: any[];
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddProperty, setShowAddProperty] = useState(false);
    const [propForm, setPropForm] = useState({ name: '', code: '', type: 'pg', gender: 'co_ed', address: '' });
    const [saving, setSaving] = useState(false);
    const { setProperties, selectedPropertyId } = usePropertyStore();
    const navigate = useNavigate();

    useEffect(() => {
        dashboardApi.overview()
            .then((res) => {
                setData(res.data);
                if (res.data.properties) {
                    setProperties(res.data.properties);
                }
            })
            .catch(() => {
                setData({
                    todays_collection: 0, monthly_collection: 0,
                    monthly_dues: 0, total_dues: 0, monthly_expenses: 0, monthly_profit: 0,
                    total_tenants: 0, under_notice: 0, defaulters: 0,
                    total_deposits: 0, unpaid_deposits: 0, pending_bookings: 0, active_leads: 0,
                    properties: [],
                });
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="page-loading"><div className="spinner"></div></div>;
    }

    const now = new Date();
    const monthName = now.toLocaleDateString('en-IN', { month: 'long' });

    const scrollStats = [
        { label: "Today's Collection", value: data?.todays_collection || 0, color: '#22c55e', link: '/collection' },
        { label: `${monthName}'s Collection`, value: data?.monthly_collection || 0, color: '#6366f1', link: '/collection' },
        { label: `${monthName}'s Dues`, value: data?.monthly_dues || 0, color: '#f59e0b', link: '/dues' },
        { label: 'Total Dues', value: data?.total_dues || 0, color: '#ef4444', link: '/dues' },
        { label: `${monthName}'s Expenses`, value: data?.monthly_expenses || 0, color: '#8b5cf6', link: '/expense' },
        { label: 'Rent Defaulters', value: data?.defaulters || 0, color: '#ef4444', link: '/tenants', isCount: true },
        { label: 'Current Deposit', value: data?.total_deposits || 0, color: '#3b82f6', link: '/tenants' },
        { label: 'Unpaid Deposit', value: data?.unpaid_deposits || 0, color: '#f59e0b', link: '/dues' },
        { label: `${monthName}'s Profit`, value: data?.monthly_profit || 0, color: '#22c55e', link: '/collection' },
    ];

    const quickActions = [
        { label: 'Add Tenant', icon: UserPlus, color: '#3b82f6', path: '/tenants/add' },
        { label: 'Receive Payment', icon: CreditCard, color: '#22c55e', path: '/collection' },
        { label: 'Add Lead', icon: UserCheck, color: '#6366f1', path: '/leads' },
        { label: 'Add Expense', icon: FileText, color: '#ef4444', path: '/expense' },
        { label: 'Add Dues', icon: IndianRupee, color: '#f59e0b', path: '/dues' },
        { label: 'Add Bank Account', icon: Building2, color: '#8b5cf6', path: '/banks' },
        { label: 'Add Booking', icon: CalendarCheck, color: '#06b6d4', path: '/bookings' },
        { label: 'Agreement Settings', icon: Settings, color: '#64748b', path: '/settings' },
    ];

    const selectedProp = data?.properties?.find((p: any) => p.id === selectedPropertyId) || data?.properties?.[0];

    return (
        <div className="page-container">
            {/* Scrollable Stat Bar */}
            <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {monthName} {now.getFullYear()} summary for
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>All {data?.properties?.length || 0} Properties</span>
                </div>
                <div style={{
                    display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 8,
                    scrollbarWidth: 'thin',
                }}>
                    {scrollStats.map((stat, i) => (
                        <div key={i} style={{
                            minWidth: 160, padding: '16px 20px',
                            borderRight: i < scrollStats.length - 1 ? '1px solid var(--border-primary)' : 'none',
                            cursor: 'pointer', transition: 'background 0.2s',
                        }}
                            className="hover-card"
                            onClick={() => navigate(stat.link)}
                        >
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: stat.color, marginBottom: 4 }}>
                                {stat.isCount ? stat.value : `₹${(stat.value || 0).toLocaleString('en-IN')}`}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ height: 4, background: 'linear-gradient(90deg, #22c55e 0%, #6366f1 30%, #f59e0b 60%, #ef4444 100%)', borderRadius: 4, opacity: 0.6 }} />
            </div>

            {/* Dashboard Header with Add New Property */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 16px' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Dashboard</h2>
                <button className="btn btn-primary" onClick={() => setShowAddProperty(!showAddProperty)} style={{ fontSize: '0.8rem' }}>
                    <Plus size={14} /> Add New Property
                </button>
            </div>

            {/* Add Property Form */}
            {showAddProperty && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>New Property</h3>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Property Name *</label>
                            <input className="form-input" placeholder="My PG" value={propForm.name} onChange={e => setPropForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Code</label>
                            <input className="form-input" placeholder="PG01" value={propForm.code} onChange={e => setPropForm(f => ({ ...f, code: e.target.value }))} />
                        </div>
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Type</label>
                            <select className="form-select" value={propForm.type} onChange={e => setPropForm(f => ({ ...f, type: e.target.value }))}>
                                <option value="pg">PG</option>
                                <option value="hostel">Hostel</option>
                                <option value="apartment">Apartment</option>
                                <option value="co_living">Co-Living</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Gender</label>
                            <select className="form-select" value={propForm.gender} onChange={e => setPropForm(f => ({ ...f, gender: e.target.value }))}>
                                <option value="co_ed">Co-Ed</option>
                                <option value="male">Male Only</option>
                                <option value="female">Female Only</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <input className="form-input" placeholder="Full address" value={propForm.address} onChange={e => setPropForm(f => ({ ...f, address: e.target.value }))} />
                    </div>
                    <button className="btn btn-primary" disabled={saving || !propForm.name} onClick={async () => {
                        setSaving(true);
                        try {
                            await propertyApi.create(propForm);
                            setShowAddProperty(false);
                            setPropForm({ name: '', code: '', type: 'pg', gender: 'co_ed', address: '' });
                            window.location.reload();
                        } catch { }
                        setSaving(false);
                    }}>{saving ? 'Saving...' : 'Create Property'}</button>
                </div>
            )}

            {/* Property Card */}
            {selectedProp ? (
                <div className="card" style={{ maxWidth: 340, marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedProp.name}</div>
                        <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Current</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                        <span>{selectedProp.total_rooms || 0} Rooms</span>
                        <span style={{ color: 'var(--border-primary)' }}>——</span>
                        <span>🏠</span>
                        <span style={{ color: 'var(--border-primary)' }}>——</span>
                        <span>{selectedProp.total_beds || 0} Beds</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>🛏️ Occupied Beds</span>
                            <span style={{ fontWeight: 600 }}>{selectedProp.occupied_beds || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>👤 Active Tenants</span>
                            <span style={{ fontWeight: 600 }}>{data?.total_tenants || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>⚠️ Under Notice</span>
                            <span style={{ fontWeight: 600 }}>{data?.under_notice || 0}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>🔴 Pending Dues</span>
                            <span style={{ fontWeight: 600, color: '#ef4444' }}>₹{(data?.total_dues || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>✅ Collection</span>
                            <span style={{ fontWeight: 600, color: '#22c55e' }}>₹{(data?.monthly_collection || 0).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', color: 'var(--accent-primary)', fontSize: '0.8rem', marginTop: 12, cursor: 'pointer' }}>
                        ▾ View More
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="empty-state">
                        <DoorOpen />
                        <h3>No Properties Yet</h3>
                        <p>Add your first property to get started</p>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Quick Actions</h2>
            <div style={{
                display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16,
                scrollbarWidth: 'thin',
            }}>
                {quickActions.map((act, i) => (
                    <div
                        key={i}
                        onClick={() => navigate(act.path)}
                        style={{
                            minWidth: 100, textAlign: 'center', cursor: 'pointer',
                            padding: '20px 12px', borderRadius: 12,
                            border: '1px solid var(--border-primary)',
                            background: 'var(--bg-card)',
                            transition: 'all 0.2s',
                        }}
                        className="hover-card"
                    >
                        <div style={{
                            width: 48, height: 48, borderRadius: 12, margin: '0 auto 10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: `${act.color}15`, color: act.color,
                        }}>
                            <act.icon size={22} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.3 }}>
                            {act.label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
