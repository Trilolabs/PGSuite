import { useEffect, useState } from 'react';
import { CalendarCheck, Plus, ArrowRight } from 'lucide-react';
import { bookingApi } from '../lib/api';
import { usePropertyStore } from '../stores/propertyStore';

interface Booking {
    id: string;
    name: string;
    phone: string;
    email: string;
    room_type: string;
    check_in_date: string;
    status: string;
    advance_amount: string;
    notes: string;
    created_at: string;
}

const statusBadge = (s: string) => {
    const map: Record<string, string> = {
        pending: 'badge-warning', confirmed: 'badge-info',
        converted: 'badge-success', cancelled: 'badge-danger',
    };
    return map[s] || 'badge-neutral';
};

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const { selectedPropertyId } = usePropertyStore();

    useEffect(() => {
        if (!selectedPropertyId) { setLoading(false); return; }
        bookingApi.list(selectedPropertyId)
            .then(res => setBookings(res.data.results || res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [selectedPropertyId]);

    const handleConvert = async (id: string) => {
        if (!selectedPropertyId) return;
        try {
            await bookingApi.convert(selectedPropertyId, id);
            window.location.reload();
        } catch { }
    };

    const pending = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Bookings</h1>
                    <p className="subtitle">{pending} pending • {bookings.length} total</p>
                </div>
                <button className="btn btn-primary"><Plus size={16} /> New Booking</button>
            </div>

            {loading ? (
                <div className="page-loading"><div className="spinner"></div></div>
            ) : bookings.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <CalendarCheck size={48} />
                        <h3>No Bookings</h3>
                        <p>Create bookings for upcoming tenants</p>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Room Type</th>
                                <th>Check-in</th>
                                <th>Advance</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(b => (
                                <tr key={b.id}>
                                    <td>{b.name}</td>
                                    <td>{b.phone}</td>
                                    <td style={{ textTransform: 'capitalize' }}>{b.room_type}</td>
                                    <td>{b.check_in_date ? new Date(b.check_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                                    <td>₹{Number(b.advance_amount || 0).toLocaleString('en-IN')}</td>
                                    <td><span className={`badge ${statusBadge(b.status)}`}>{b.status}</span></td>
                                    <td>
                                        {b.status === 'confirmed' && (
                                            <button className="btn btn-ghost" onClick={() => handleConvert(b.id)} title="Convert to Tenant">
                                                <ArrowRight size={16} /> Convert
                                            </button>
                                        )}
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
