import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Plus, Search, Phone, ExternalLink, PhoneCall, Settings as SettingsIcon } from 'lucide-react';
import { tenantApi } from '../lib/api';
import { usePropertyStore } from '../stores/propertyStore';

interface Tenant {
    id: string;
    name: string;
    phone: string;
    email: string;
    tenant_type: string;
    gender: string;
    room_number: string | null;
    property_name: string;
    rent: string;
    deposit: string;
    move_in: string;
    move_out: string | null;
    status: string;
    kyc_status: string;
    photo_url: string | null;
    total_dues?: number;
}

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: 'rgba(34,197,94,0.1)', text: '#22c55e', label: '🟢 Active' },
    under_notice: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', label: '🟡 Under Notice' },
    checked_out: { bg: 'rgba(100,116,139,0.1)', text: '#64748b', label: '🔴 Checked Out' },
};

export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [kycFilter, setKycFilter] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [stayTypeFilter, setStayTypeFilter] = useState('');
    const { selectedPropertyId } = usePropertyStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!selectedPropertyId) { setLoading(false); return; }
        setLoading(true);
        const params: any = {};
        if (searchQuery) params.search = searchQuery;
        if (statusFilter) params.status = statusFilter;
        if (kycFilter) params.kyc_status = kycFilter;
        if (genderFilter) params.gender = genderFilter;
        tenantApi.list(selectedPropertyId, params)
            .then((res) => setTenants(res.data.results || res.data || []))
            .catch(() => setTenants([]))
            .finally(() => setLoading(false));
    }, [selectedPropertyId, searchQuery, statusFilter, kycFilter, genderFilter]);

    const totalTenants = tenants.length;
    const activeTenants = tenants.filter(t => t.status === 'active').length;
    const underNotice = tenants.filter(t => t.status === 'under_notice').length;

    const statCards = [
        { count: totalTenants, label: 'Total Tenants', color: '#3b82f6', icon: '👤' },
        { count: activeTenants, label: 'Active Tenants', color: '#22c55e', icon: '🟢' },
        { count: underNotice, label: 'Under Notice', color: '#f59e0b', icon: '⚠️' },
        { count: 0, label: 'Joining Requests', color: '#ef4444', icon: '📩' },
        { count: 0, label: 'Not on App', color: '#ef4444', icon: '📱' },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Tenants</h1>
                    <p className="subtitle">{totalTenants} total tenants</p>
                </div>
                <Link to="/tenants/add" className="btn btn-primary">
                    <Plus size={16} /> Add Tenant
                </Link>
            </div>

            {/* Stat Cards Row */}
            <div style={{
                display: 'flex', gap: 0, overflowX: 'auto', marginBottom: 20,
                scrollbarWidth: 'thin',
            }}>
                {statCards.map((s, i) => (
                    <div key={i} style={{
                        minWidth: 140, padding: '16px 20px',
                        border: '1px solid var(--border-primary)',
                        borderRight: i < statCards.length - 1 ? 'none' : '1px solid var(--border-primary)',
                        borderRadius: i === 0 ? '10px 0 0 10px' : i === statCards.length - 1 ? '0 10px 10px 0' : 0,
                        background: 'var(--bg-card)', cursor: 'pointer', transition: 'background 0.2s',
                    }} className="hover-card">
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, marginBottom: 2 }}>{s.count}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {s.icon} {s.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Search + Filters */}
            <div className="card" style={{ padding: '14px 20px', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                    <div className="header-search" style={{ minWidth: 300, flex: 1 }}>
                        <Search size={16} />
                        <input
                            placeholder="Search your tenants..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <select className="form-select" style={{ width: 140, fontSize: '0.8rem' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">Tenant Status ▾</option>
                        <option value="active">Active</option>
                        <option value="under_notice">Under Notice</option>
                        <option value="checked_out">Checked Out</option>
                    </select>
                    <select className="form-select" style={{ width: 130, fontSize: '0.8rem' }} value={kycFilter} onChange={(e) => setKycFilter(e.target.value)}>
                        <option value="">KYC Status ▾</option>
                        <option value="verified">Verified</option>
                        <option value="pending">Pending</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <select className="form-select" style={{ width: 130, fontSize: '0.8rem' }} value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
                        <option value="">Gender ▾</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                    <select className="form-select" style={{ width: 130, fontSize: '0.8rem' }} value={stayTypeFilter} onChange={(e) => setStayTypeFilter(e.target.value)}>
                        <option value="">Stay Type ▾</option>
                        <option value="Long Stay">Long Stay</option>
                        <option value="Short Stay">Short Stay</option>
                    </select>
                </div>
            </div>

            {/* Results Count */}
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
                {tenants.length} Results Found
            </div>

            {loading ? (
                <div className="page-loading"><div className="spinner"></div></div>
            ) : tenants.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <Users size={48} />
                        <h3>No Tenants Found</h3>
                        <p>{selectedPropertyId ? 'Add your first tenant to get started' : 'Select a property first'}</p>
                        {selectedPropertyId && (
                            <Link to="/tenants/add" className="btn btn-primary" style={{ marginTop: 16 }}>
                                <Plus size={16} /> Add Tenant
                            </Link>
                        )}
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ cursor: 'pointer' }}>NAME ↕</th>
                                <th style={{ cursor: 'pointer' }}>ROOM ↕</th>
                                <th style={{ cursor: 'pointer' }}>RENT ↕</th>
                                <th style={{ cursor: 'pointer' }}>DATE OF JOINING ↕</th>
                                <th>CHECK OUT DATE</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.map((t) => (
                                <tr key={t.id} onClick={() => navigate(`/tenants/${t.id}`)} style={{ cursor: 'pointer' }}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <img
                                                src={t.photo_url || `https://ui-avatars.com/api/?name=${t.name}&background=e0e7ff&color=6366f1&size=36`}
                                                alt=""
                                                style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0 }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Phone size={10} />{t.phone}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                                            padding: '3px 10px', borderRadius: 6, fontWeight: 600, fontSize: '0.8rem',
                                        }}>
                                            {t.room_number || '—'}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>₹{Number(t.rent || 0).toLocaleString('en-IN')}</td>
                                    <td>{t.move_in ? new Date(t.move_in).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                                    <td>{t.move_out ? new Date(t.move_out).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                                    <td>
                                        <span style={{
                                            background: statusColors[t.status]?.bg || 'rgba(100,116,139,0.1)',
                                            color: statusColors[t.status]?.text || '#64748b',
                                            padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 500,
                                        }}>
                                            {statusColors[t.status]?.label || t.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{
                                                border: '1px solid var(--border-primary)', borderRadius: 6,
                                                padding: '4px 10px', fontSize: '0.75rem', color: 'var(--text-secondary)',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                                            }}
                                                onClick={() => navigate(`/tenants/${t.id}`)}
                                            >
                                                Dues: ₹{t.total_dues || 0} <ExternalLink size={11} />
                                            </span>
                                            <PhoneCall size={16} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
                                            <SettingsIcon size={16} style={{ color: 'var(--text-muted)', cursor: 'pointer' }} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
