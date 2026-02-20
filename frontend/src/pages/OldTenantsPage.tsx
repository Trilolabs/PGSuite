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
}

export default function OldTenantsPage() {
    const [tenants, setTenants] = useState<OldTenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { selectedPropertyId } = usePropertyStore();

    useEffect(() => {
        if (!selectedPropertyId) { setLoading(false); return; }
        const params: any = {};
        if (search) params.search = search;
        api.get(`/properties/${selectedPropertyId}/old-tenants/`, { params })
            .then(res => setTenants(res.data.results || res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [selectedPropertyId, search]);

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Old Tenants</h1>
                    <p className="subtitle">{tenants.length} archived records</p>
                </div>
            </div>

            <div className="card" style={{ padding: '14px 20px', marginBottom: 20, display: 'flex', gap: 12 }}>
                <div className="header-search" style={{ flex: 1 }}>
                    <Search size={16} />
                    <input placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {loading ? (
                <div className="page-loading"><div className="spinner"></div></div>
            ) : tenants.length === 0 ? (
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
                            {tenants.map(t => (
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
