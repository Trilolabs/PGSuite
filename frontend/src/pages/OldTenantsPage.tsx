import { useEffect, useState } from 'react';
import { History, Search } from 'lucide-react';
import { usePropertyStore } from '../stores/propertyStore';
import api from '../lib/api';

interface OldTenant {
    id: string;
    name: string;
    phone: string;
    room_number: string | null;
    move_in: string;
    move_out: string;
    checkout_reason: string;
    total_paid: string;
    pending_dues: string;
    settlement_status: string;
    deposit_refunded: string;
}

export default function OldTenantsPage() {
    const [tenants, setTenants] = useState<OldTenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const { selectedPropertyId } = usePropertyStore();

    useEffect(() => {
        if (!selectedPropertyId) { setLoading(false); return; }
        setLoading(true);
        api.get(`/properties/${selectedPropertyId}/old-tenants/`)
            .then(res => setTenants(res.data.results || res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [selectedPropertyId]);

    const filteredTenants = tenants.filter(t => {
        const matchSearch = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.phone.includes(search);
        let matchStatus = true;
        if (statusFilter === 'settlement_pending') matchStatus = t.settlement_status === 'pending';
        if (statusFilter === 'settled') matchStatus = t.settlement_status === 'settled';
        if (statusFilter === 'has_dues') matchStatus = Number(t.pending_dues) > 0;
        return matchSearch && matchStatus;
    });

    const statCards = [
        { count: tenants.length, label: 'Total Checked Out', color: '#64748b', icon: '🔴', filterValue: 'all' },
        { count: tenants.filter(t => t.settlement_status === 'pending').length, label: 'Settlement Pending', color: '#f59e0b', icon: '⚠️', filterValue: 'settlement_pending' },
        { count: tenants.filter(t => t.settlement_status === 'settled').length, label: 'Settled', color: '#22c55e', icon: '🟢', filterValue: 'settled' },
        { count: tenants.filter(t => Number(t.pending_dues) > 0).length, label: 'Dues Remaining', color: '#ef4444', icon: '⏳', filterValue: 'has_dues' },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Old Tenants</h1>
                    <p className="subtitle">{tenants.length} archived records</p>
                </div>
            </div>

            {/* Stat Cards Row */}
            <div style={{
                display: 'flex', gap: 0, overflowX: 'auto', marginBottom: 20,
                scrollbarWidth: 'thin',
            }}>
                {statCards.map((s, i) => {
                    const isActive = statusFilter === s.filterValue;
                    return (
                        <div key={i}
                            onClick={() => setStatusFilter(s.filterValue)}
                            style={{
                                minWidth: 140, padding: '16px 20px',
                                border: '1px solid var(--border-primary)',
                                borderRight: i < statCards.length - 1 ? 'none' : '1px solid var(--border-primary)',
                                borderRadius: i === 0 ? '10px 0 0 10px' : i === statCards.length - 1 ? '0 10px 10px 0' : 0,
                                background: isActive ? 'var(--bg-secondary)' : 'var(--bg-card)',
                                cursor: 'pointer', transition: 'background 0.2s',
                            }} className="hover-card">
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, marginBottom: 2 }}>{s.count}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                {s.icon} {s.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="card" style={{ padding: '14px 20px', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                    <div className="header-search" style={{ flex: 1 }}>
                        <Search size={16} />
                        <input placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <select className="form-select" style={{ width: 160, fontSize: '0.8rem' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">Settlement Status ▾</option>
                        <option value="settlement_pending">Pending</option>
                        <option value="settled">Settled</option>
                        <option value="has_dues">Has Dues</option>
                    </select>
                </div>
            </div>

            {/* Results Count */}
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
                {filteredTenants.length} Results Found
            </div>

            {loading ? (
                <div className="page-loading"><div className="spinner"></div></div>
            ) : filteredTenants.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <History size={48} />
                        <h3>No Old Tenants</h3>
                        <p>Checked-out tenants will appear here</p>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Room</th>
                                <th>Stay Period</th>
                                <th>Total Paid</th>
                                <th>Pending</th>
                                <th>Reason</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTenants.map(t => (
                                <tr key={t.id}>
                                    <td>{t.name}</td>
                                    <td>{t.phone}</td>
                                    <td>{t.room_number || '—'}</td>
                                    <td style={{ fontSize: '0.8rem' }}>
                                        {t.move_in ? new Date(t.move_in).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }) : ''}
                                        {' → '}
                                        {t.move_out ? new Date(t.move_out).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }) : ''}
                                    </td>
                                    <td style={{ color: 'var(--accent-success)' }}>₹{Number(t.total_paid || 0).toLocaleString('en-IN')}</td>
                                    <td style={{ color: Number(t.pending_dues) > 0 ? 'var(--accent-danger)' : 'var(--text-muted)', fontWeight: 600 }}>
                                        ₹{Number(t.pending_dues || 0).toLocaleString('en-IN')}
                                    </td>
                                    <td style={{ textTransform: 'capitalize', fontSize: '0.8rem' }}>{t.checkout_reason || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
