import { useState, useEffect } from 'react';
import { Settings, Home, X, Users, MessageSquare, Briefcase, FileText, Lock, Globe, Bell, Stamp, Save, Plus, Mail, MapPin, Building2 } from 'lucide-react';
import PropertySettingsDrawer from '../components/PropertySettingsDrawer';
import { useAuthStore } from '../stores/authStore';
import { usePropertyStore } from '../stores/propertyStore';
import { propertyApi } from '../lib/api';

export default function SettingsPage() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [placeholderModal, setPlaceholderModal] = useState<string | null>(null);

    // Legacy Settings State
    const [properties, setProperties] = useState<any[]>([]);
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

    const categories = [
        {
            title: "Property Management & Financial",
            items: [
                { id: 'property', label: 'Property Settings', desc: 'View and update property details', icon: Home, highlight: true },
                { id: 'management', label: 'Management Details', desc: 'Configure management settings', icon: Users },
                { id: 'rules', label: 'Renting & Stay Rules', desc: 'Set rules for renting and stays', icon: FileText },
                { id: 'payment', label: 'Dues & Payment Settings', desc: 'Configure payment settings', icon: Briefcase },
                { id: 'website', label: 'My Website Details', desc: 'Manage your website information', icon: Globe },
                { id: 'chat', label: 'Chat Widget Settings', desc: 'Configure WhatsApp chat widget', icon: MessageSquare },
            ]
        },
        {
            title: "Tenant Management",
            items: [
                { id: 'kyc', label: 'Tenant Onboarding & KYC', desc: 'Manage verification process', icon: Users },
                { id: 'eviction', label: 'Eviction Settings', desc: 'Configure eviction policies', icon: X },
                { id: 'checkin', label: 'Web Checkin Settings', desc: 'Manage web check-in', icon: Globe },
            ]
        },
        {
            title: "Attendance & Food",
            items: [
                { id: 'attendance', label: 'Attendance Settings', desc: 'Manage attendance configs', icon: Users },
                { id: 'food', label: 'Food Attendance Settings', desc: 'Manage food timings', icon: FileText },
            ]
        },
        {
            title: "Agreement Settings",
            items: [
                { id: 'template', label: 'Agreement Template', desc: 'Manage agreement template', icon: FileText },
                { id: 'first_party', label: 'First Party Agreement', desc: 'Manage first party agreement', icon: FileText },
                { id: 'stamps', label: 'Stamps', desc: 'Manage stamps', icon: Stamp },
            ]
        },
        {
            title: "Communication",
            items: [
                { id: 'notifications', label: 'Notification & Messages', desc: 'Manage alerts', icon: Bell },
            ]
        },
        {
            title: "Security",
            items: [
                { id: 'security', label: 'Security Settings', desc: 'Passwords and 2FA', icon: Lock },
            ]
        }
    ];

    const handleItemClick = (id: string, label: string) => {
        if (id === 'property') {
            setDrawerOpen(true);
        } else {
            setPlaceholderModal(label);
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="page-header" style={{ marginBottom: 30 }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        Settings
                    </h1>
                </div>
            </div>

            {/* Legacy Account & Properties Section (Restored) */}
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Your Properties</h2>
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
                <div className="card" style={{ marginBottom: 30 }}>
                    <div className="empty-state">
                        <Building2 size={48} />
                        <h3>No Properties</h3>
                        <p>Add your first PG property to get started</p>
                    </div>
                </div>
            ) : (
                <div className="grid-2" style={{ marginBottom: 30 }}>
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

            <div style={{ borderBottom: '2px solid var(--border-primary)', margin: '40px 0 30px' }}></div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 60 }}>
                {categories.map((category, idx) => (
                    <div key={idx}>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>
                            {category.title}
                        </h2>
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16
                        }}>
                            {category.items.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => handleItemClick(item.id, item.label)}
                                    style={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-primary)',
                                        borderRadius: 8,
                                        padding: '20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 16,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                                    }}
                                    className="hover-card"
                                >
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 8,
                                        background: 'var(--bg-secondary)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'var(--text-muted)'
                                    }}>
                                        <item.icon size={20} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 2 }}>{item.label}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <PropertySettingsDrawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
            />

            {/* Placeholder Modal for non-functional settings */}
            {placeholderModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
                }} onClick={() => setPlaceholderModal(null)}>
                    <div style={{
                        background: 'var(--bg-card)', width: '100%', maxWidth: 400,
                        borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                        animation: 'fadeIn 0.2s', padding: 24, textAlign: 'center'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-secondary)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                            <Settings size={32} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>{placeholderModal}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 24 }}>
                            This configuration section is currently under development. Detailed settings for <strong>{placeholderModal.toLowerCase()}</strong> will be available in the upcoming release.
                        </p>
                        <button onClick={() => setPlaceholderModal(null)} className="btn btn-primary" style={{ width: '100%' }}>
                            Got it
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .hover-card:hover { border-color: var(--accent-primary) !important; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important; }
            `}</style>
        </div>
    );
}
