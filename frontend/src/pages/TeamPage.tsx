import { useEffect, useState } from 'react';
import { UsersRound, Plus, Phone, Mail } from 'lucide-react';
import { usePropertyStore } from '../stores/propertyStore';
import api from '../lib/api';

interface Staff {
    id: string;
    name: string;
    role: string;
    phone: string;
    email: string;
    salary: string;
    joining_date: string;
    status: string;
}

const roleBadge = (r: string) => {
    const map: Record<string, string> = {
        manager: 'badge-info', warden: 'badge-warning',
        caretaker: 'badge-neutral', cook: 'badge-success',
        security: 'badge-danger', cleaner: 'badge-neutral',
    };
    return map[r] || 'badge-neutral';
};

export default function TeamPage() {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const { selectedPropertyId } = usePropertyStore();

    useEffect(() => {
        if (!selectedPropertyId) { setLoading(false); return; }
        api.get(`/properties/${selectedPropertyId}/staff/`)
            .then(res => setStaff(res.data.results || res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [selectedPropertyId]);

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Team</h1>
                    <p className="subtitle">{staff.length} staff members</p>
                </div>
                <button className="btn btn-primary"><Plus size={16} /> Add Staff</button>
            </div>

            {loading ? (
                <div className="page-loading"><div className="spinner"></div></div>
            ) : staff.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <UsersRound size={48} />
                        <h3>No Staff</h3>
                        <p>Add team members to your property</p>
                    </div>
                </div>
            ) : (
                <div className="grid-3">
                    {staff.map(s => (
                        <div className="card" key={s.id}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                <div style={{
                                    width: 42, height: 42, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', fontWeight: 700, fontSize: '0.8rem',
                                }}>
                                    {s.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                                    <span className={`badge ${roleBadge(s.role)}`}>{s.role}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {s.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={12} /> {s.phone}</div>}
                                {s.email && <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={12} /> {s.email}</div>}
                                {s.salary && <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>₹{Number(s.salary).toLocaleString('en-IN')}/mo</div>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
