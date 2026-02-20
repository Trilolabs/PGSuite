import { useEffect, useState } from 'react';
import { Building2, Plus, Save, Mail, MapPin } from 'lucide-react';
import { propertyApi } from '../lib/api';
import { usePropertyStore } from '../stores/propertyStore';
import { useAuthStore } from '../stores/authStore';

interface Property {
    id: string;
    name: string;
    code: string;
    type: string;
    gender: string;
    address: string;
    city: string;
    state: string;
    phone: string;
    email: string;
    total_rooms: number;
    total_beds: number;
    occupied_beds: number;
}

export default function SettingsPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ name: '', code: '', type: 'pg', gender: 'male', address: '', city: '', state: '', phone: '', email: '' });
    const { user } = useAuthStore();
    const { selectedPropertyId, setSelectedProperty } = usePropertyStore();

    useEffect(() => {
        propertyApi.list()
            .then(res => setProperties(res.data.results || res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const handleAdd = async () => {
        try {
            const res = await propertyApi.create(form);
            setProperties(prev => [...prev, res.data]);
            setShowAdd(false);
            setForm({ name: '', code: '', type: 'pg', gender: 'male', address: '', city: '', state: '', phone: '', email: '' });
            if (!selectedPropertyId) setSelectedProperty(res.data.id);
        } catch { }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Settings</h1>
                    <p className="subtitle">Manage your properties and account</p>
                </div>
            </div>

            {/* Account Info */}
            <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                    <div className="card-title">Account</div>
                </div>
                <div className="grid-3">
                    <div>
                        <div className="form-label">Name</div>
                        <div style={{ fontWeight: 600 }}>{user?.name || '—'}</div>
                    </div>
                    <div>
                        <div className="form-label">Email</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Mail size={14} style={{ color: 'var(--text-muted)' }} />
                            {user?.email}
                        </div>
                    </div>
                    <div>
                        <div className="form-label">Role</div>
                        <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
                    </div>
                </div>
            </div>

            {/* Properties */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Properties</h2>
                <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
                    <Plus size={16} /> Add Property
                </button>
            </div>

            {showAdd && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>New Property</h3>
                    <div className="grid-3">
                        <div className="form-group">
                            <label className="form-label">Property Name *</label>
                            <input className="form-input" placeholder="My PG" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Code *</label>
                            <input className="form-input" placeholder="PG01" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Type</label>
                            <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                                <option value="pg">PG</option>
                                <option value="hostel">Hostel</option>
                                <option value="apartment">Apartment</option>
                                <option value="co_living">Co-Living</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid-3">
                        <div className="form-group">
                            <label className="form-label">Gender</label>
                            <select className="form-select" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="co_ed">Co-Ed</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input className="form-input" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                        </div>
                    </div>
                    <div className="grid-3">
                        <div className="form-group">
                            <label className="form-label">Address</label>
                            <input className="form-input" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">City</label>
                            <input className="form-input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">State</label>
                            <input className="form-input" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleAdd}><Save size={16} /> Create Property</button>
                </div>
            )}

            {loading ? (
                <div className="page-loading"><div className="spinner"></div></div>
            ) : properties.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <Building2 size={48} />
                        <h3>No Properties</h3>
                        <p>Add your first PG property to get started</p>
                    </div>
                </div>
            ) : (
                <div className="grid-2">
                    {properties.map(p => (
                        <div className="card" key={p.id} style={{
                            borderColor: p.id === selectedPropertyId ? 'var(--accent-primary)' : undefined,
                            cursor: 'pointer',
                        }} onClick={() => setSelectedProperty(p.id)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 2 }}>{p.name}</h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.code}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <span className="badge badge-info">{p.type}</span>
                                    <span className="badge badge-neutral">{p.gender}</span>
                                </div>
                            </div>
                            {p.address && (
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <MapPin size={12} /> {p.address}{p.city ? `, ${p.city}` : ''}
                                </div>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: '0.85rem' }}>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Rooms</span>
                                    <strong style={{ display: 'block' }}>{p.total_rooms}</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Total Beds</span>
                                    <strong style={{ display: 'block' }}>{p.total_beds}</strong>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Occupied</span>
                                    <strong style={{ display: 'block', color: 'var(--accent-success)' }}>{p.occupied_beds}</strong>
                                </div>
                            </div>
                            {p.id === selectedPropertyId && (
                                <div style={{ marginTop: 10, fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 600 }}>✓ Currently Selected</div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
