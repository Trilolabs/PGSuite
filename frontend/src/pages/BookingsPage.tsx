import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarCheck, Plus, Search, Phone, ExternalLink, X } from 'lucide-react';
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

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { selectedPropertyId } = usePropertyStore();
    const navigate = useNavigate();

    const [cancelModal, setCancelModal] = useState<{ open: boolean; tenantId: string | null }>({ open: false, tenantId: null });
    const [cancelReason, setCancelReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const [isAccepting, setIsAccepting] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState('all');

    const loadBookings = () => {
        if (!selectedPropertyId) { setLoading(false); return; }
        setLoading(true);
        tenantApi.list(selectedPropertyId, { is_booking: true })
            .then((res) => {
                setBookings(res.data.results || res.data || []);
            })
            .catch(() => setBookings([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadBookings();
    }, [selectedPropertyId]);

    const filteredBookings = bookings.filter((t) => {
        const matchesSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.phone.includes(searchQuery);
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleAcceptBooking = async (tenantId: string) => {
        if (!selectedPropertyId) return;
        setIsAccepting(tenantId);
        try {
            await tenantApi.acceptBooking(selectedPropertyId, tenantId);
            loadBookings();
        } catch (err) {
            console.error(err);
        } finally {
            setIsAccepting(null);
        }
    };

    const handleCancelSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPropertyId || !cancelModal.tenantId) return;
        setIsCancelling(true);
        try {
            await tenantApi.cancelBooking(selectedPropertyId, cancelModal.tenantId, { reason: cancelReason });
            setCancelModal({ open: false, tenantId: null });
            setCancelReason('');
            loadBookings();
        } catch (err) {
            console.error(err);
        } finally {
            setIsCancelling(false);
        }
    };

    const statCards = [
        { count: bookings.length, label: 'Total Bookings', color: '#3b82f6', icon: '👤', filterValue: 'all' },
        { count: bookings.filter(b => b.status === 'active' || b.status === 'booking_pending').length, label: 'New Bookings', color: '#22c55e', icon: '🟢', filterValue: 'booking_pending' },
        { count: 0, label: 'Under Notice', color: '#f59e0b', icon: '⚠️', filterValue: 'under_notice' },
        { count: bookings.filter(b => b.status === 'cancelled').length, label: 'Cancelled', color: '#ef4444', icon: '🔴', filterValue: 'cancelled' },
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Bookings</h1>
                    <p className="subtitle">{bookings.length} upcoming tenants</p>
                </div>
                <Link to="/tenants/add" state={{ isBooking: true }} className="btn btn-primary">
                    <Plus size={16} /> Add Booking
                </Link>
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

            {/* Search + Filters */}
            <div className="card" style={{ padding: '14px 20px', marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="header-search" style={{ minWidth: 300, flex: 1 }}>
                        <Search size={16} />
                        <input
                            placeholder="Search your tenants..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Results Count */}
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
                {filteredBookings.length} Results Found
            </div>

            {loading ? (
                <div className="page-loading"><div className="spinner"></div></div>
            ) : filteredBookings.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <CalendarCheck size={48} />
                        <h3>No Bookings Found</h3>
                        <p>{selectedPropertyId ? 'Book a room for future tenants to get started' : 'Select a property first'}</p>
                        {selectedPropertyId && (
                            <Link to="/tenants/add" state={{ isBooking: true }} className="btn btn-primary" style={{ marginTop: 16 }}>
                                <Plus size={16} /> Add Booking
                            </Link>
                        )}
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ cursor: 'pointer' }}>TENANT ↕</th>
                                <th style={{ cursor: 'pointer' }}>RENT ↕</th>
                                <th style={{ cursor: 'pointer' }}>ROOM ↕</th>
                                <th style={{ cursor: 'pointer' }}>DATE OF JOINING ↕</th>
                                <th>DUES</th>
                                <th>TOKEN PAID</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map((t) => (
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
                                    <td style={{ fontWeight: 600 }}>₹{Number(t.rent || 0).toLocaleString('en-IN')}</td>
                                    <td>
                                        <span style={{
                                            background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                                            padding: '3px 10px', borderRadius: 6, fontWeight: 600, fontSize: '0.8rem',
                                        }}>
                                            {t.room_number ? `Room: ${t.room_number}` : 'Unassigned'}
                                        </span>
                                    </td>
                                    <td>{t.move_in ? new Date(t.move_in).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : '—'}</td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => navigate(`/tenants/${t.id}`)}
                                            style={{
                                                background: 'none', border: '1px solid var(--border-primary)', borderRadius: 6,
                                                padding: '4px 10px', fontSize: '0.8rem', color: 'var(--text-primary)',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                            }}>
                                            Dues: {t.total_dues || 0} <ExternalLink size={12} style={{ color: 'var(--primary-color)' }} />
                                        </button>
                                    </td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => navigate(`/tenants/${t.id}`)}
                                            style={{
                                                background: 'none', border: '1px solid var(--border-primary)', borderRadius: 6,
                                                padding: '4px 10px', fontSize: '0.8rem', color: 'var(--text-primary)',
                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                            }}>
                                            Token Paid: {Number(t.deposit || 0)} <ExternalLink size={12} style={{ color: 'var(--primary-color)' }} />
                                        </button>
                                    </td>
                                    <td onClick={(e) => e.stopPropagation()}>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {t.status === 'booking_pending' && (
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                                                    onClick={() => handleAcceptBooking(t.id)}
                                                    disabled={isAccepting === t.id}
                                                >
                                                    {isAccepting === t.id ? '...' : 'Accept'}
                                                </button>
                                            )}
                                            {t.status !== 'cancelled' ? (
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ color: '#ef4444', borderColor: '#ef4444', background: 'transparent', padding: '6px 12px', fontSize: '0.75rem' }}
                                                    onClick={() => setCancelModal({ open: true, tenantId: t.id })}
                                                >
                                                    Cancel
                                                </button>
                                            ) : (
                                                <span style={{
                                                    background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                                                    padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 500,
                                                }}>
                                                    Cancelled
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Cancel Booking Modal */}
            {cancelModal.open && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'var(--bg-card)', width: '100%', maxWidth: 400,
                        borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{
                            padding: '16px 20px', borderBottom: '1px solid var(--border-primary)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Cancel Booking</h3>
                            <button onClick={() => setCancelModal({ open: false, tenantId: null })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleCancelSubmit}>
                            <div style={{ padding: 20 }}>
                                <div className="form-group">
                                    <label>Reasons for cancellation</label>
                                    <select
                                        className="form-control"
                                        required
                                        value={cancelReason}
                                        onChange={e => setCancelReason(e.target.value)}
                                        style={{ marginTop: 8 }}
                                    >
                                        <option value="">Select a reason</option>
                                        <option value="Change of plans">Change of plans</option>
                                        <option value="Found another place">Found another place</option>
                                        <option value="Financial issues">Financial issues</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{
                                padding: '16px 20px', borderTop: '1px solid var(--border-primary)',
                                display: 'flex', justifyContent: 'flex-end', gap: 12, background: 'var(--bg-secondary)'
                            }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setCancelModal({ open: false, tenantId: null })}>Close</button>
                                <button type="submit" className="btn btn-primary" style={{ background: '#ef4444' }} disabled={isCancelling}>
                                    {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
