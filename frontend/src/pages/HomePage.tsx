import { useEffect, useState } from 'react';
import { Plus, DoorOpen } from 'lucide-react';
import { dashboardApi, propertyApi } from '../lib/api';
import { usePropertyStore } from '../stores/propertyStore';
import HomeSummaryBar from '../components/home/HomeSummaryBar';
import PropertyCard from '../components/home/PropertyCard';
import QuickActionsGrid from '../components/home/QuickActionsGrid';

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

export default function HomePage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAddProperty, setShowAddProperty] = useState(false);
    const [propForm, setPropForm] = useState({ name: '', code: '', type: 'pg', gender: 'co_ed', address: '', city: '', state: '', phone: '', email: '' });
    const [saving, setSaving] = useState(false);
    const [filterPropertyId, setFilterPropertyId] = useState<string>('all');
    const { setProperties } = usePropertyStore();

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
    }, [setProperties]);

    if (loading) {
        return <div className="page-loading"><div className="spinner"></div></div>;
    }

    const now = new Date();
    const monthName = now.toLocaleDateString('en-IN', { month: 'long' });

    const filteredProperties = data?.properties ? data.properties.filter(p => filterPropertyId === 'all' || p.id === filterPropertyId) : [];

    return (
        <div className="page-container">
            {/* Global Financial Metrics Scrollable Bar */}
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                {monthName} {now.getFullYear()} summary for
                <select
                    className="form-select"
                    style={{
                        width: 'auto', display: 'inline-block', fontWeight: 800, color: 'var(--accent-primary)',
                        background: 'transparent', border: 'none', cursor: 'pointer', padding: 0
                    }}
                    value={filterPropertyId}
                    onChange={(e) => setFilterPropertyId(e.target.value)}
                >
                    <option value="all" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                        All {data?.properties?.length || 0} Properties
                    </option>
                    {data?.properties?.map(p => (
                        <option key={p.id} value={p.id} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            <HomeSummaryBar data={data} monthName={monthName} />

            {/* Dashboard / Properties Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Dashboard</h2>
                <button className="btn btn-primary" onClick={() => setShowAddProperty(!showAddProperty)} style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                    <Plus size={16} /> Add New Property
                </button>
            </div>

            {/* Add Property Form */}
            {showAddProperty && (
                <div className="card" style={{ marginBottom: 24, animation: 'fadeIn 0.2s ease-out' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>New Property</h3>
                    <div className="grid-3">
                        <div className="form-group">
                            <label className="form-label">Property Name *</label>
                            <input className="form-input" placeholder="My PG" value={propForm.name} onChange={e => setPropForm(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Code *</label>
                            <input className="form-input" placeholder="PG01" value={propForm.code} onChange={e => setPropForm(f => ({ ...f, code: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Type</label>
                            <select className="form-select" value={propForm.type} onChange={e => setPropForm(f => ({ ...f, type: e.target.value }))}>
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
                            <select className="form-select" value={propForm.gender} onChange={e => setPropForm(f => ({ ...f, gender: e.target.value }))}>
                                <option value="co_ed">Co-Ed</option>
                                <option value="male">Male Only</option>
                                <option value="female">Female Only</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input className="form-input" placeholder="Contact Number" type="tel" value={propForm.phone} onChange={e => setPropForm(f => ({ ...f, phone: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input className="form-input" placeholder="Email Address" type="email" value={propForm.email} onChange={e => setPropForm(f => ({ ...f, email: e.target.value }))} />
                        </div>
                    </div>
                    <div className="grid-3">
                        <div className="form-group">
                            <label className="form-label">Address</label>
                            <input className="form-input" placeholder="Full address" value={propForm.address} onChange={e => setPropForm(f => ({ ...f, address: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">City</label>
                            <input className="form-input" placeholder="City" value={propForm.city} onChange={e => setPropForm(f => ({ ...f, city: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">State</label>
                            <input className="form-input" placeholder="State" value={propForm.state} onChange={e => setPropForm(f => ({ ...f, state: e.target.value }))} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button className="btn btn-outline" onClick={() => setShowAddProperty(false)}>Cancel</button>
                        <button className="btn btn-primary" disabled={saving || !propForm.name} onClick={async () => {
                            setSaving(true);
                            try {
                                await propertyApi.create({
                                    ...propForm,
                                    total_floors: 1, gst_number: '', pan_number: ''
                                });
                                setShowAddProperty(false);
                                setPropForm({ name: '', code: '', type: 'pg', gender: 'co_ed', address: '', city: '', state: '', phone: '', email: '' });
                                window.location.reload();
                            } catch { }
                            setSaving(false);
                        }}>{saving ? 'Saving...' : 'Create Property'}</button>
                    </div>
                </div>
            )}

            {/* Property Cards Grid */}
            {data?.properties && data.properties.length > 0 ? (
                <>
                    {filteredProperties.length > 0 ? (
                        <div className="grid-2">
                            {filteredProperties.map(property => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    ) : (
                        <div className="card">
                            <div className="empty-state">
                                <DoorOpen size={48} color="var(--text-muted)" />
                                <h3 style={{ marginTop: 16 }}>No Matches</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>No properties match the current filter.</p>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="card">
                    <div className="empty-state">
                        <DoorOpen size={48} color="var(--text-muted)" />
                        <h3 style={{ marginTop: 16 }}>No Properties Yet</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Add your first property to get started managing tenants and collections.</p>
                    </div>
                </div>
            )}

            {/* Quick Actions at Bottom */}
            <QuickActionsGrid />
        </div>
    );
}
