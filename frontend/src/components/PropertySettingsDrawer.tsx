import { useState, useEffect } from 'react';
import { X, Edit2, MapPin, Download } from 'lucide-react';
import { propertyApi } from '../lib/api';
import { usePropertyStore } from '../stores/propertyStore';

interface PropertySettingsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PropertySettingsDrawer({ isOpen, onClose }: PropertySettingsDrawerProps) {
    const { selectedPropertyId } = usePropertyStore();
    const [property, setProperty] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // Edit state
    const [editMode, setEditMode] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    useEffect(() => {
        if (isOpen && selectedPropertyId) {
            loadProperty();
        }
    }, [isOpen, selectedPropertyId]);

    const loadProperty = async () => {
        if (!selectedPropertyId) return;
        setLoading(true);
        try {
            const res = await propertyApi.get(selectedPropertyId);
            setProperty(res.data);
            setEditForm(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedPropertyId) return;
        try {
            await propertyApi.update(selectedPropertyId, editForm);
            setProperty(editForm);
            setEditMode(null);
        } catch (err) {
            console.error(err);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1050, display: 'flex', justifyContent: 'flex-end',
            background: 'rgba(0,0,0,0.4)'
        }}>
            <div style={{
                position: 'fixed', inset: 0, zIndex: -1
            }} onClick={onClose}></div>

            <div style={{
                width: 450, background: 'var(--bg-primary)', height: '100%',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column',
                animation: 'slideInRight 0.3s ease-out'
            }}>
                <div style={{
                    padding: '16px 24px', borderBottom: '1px solid var(--border-primary)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)'
                }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Property Settings</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: 24, paddingBottom: 100 }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner"></div></div>
                    ) : property ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Basic Details */}
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Basic Details</h3>
                                    {editMode !== 'basic' ? (
                                        <button onClick={() => setEditMode('basic')} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', fontWeight: 600 }}>
                                            <Edit2 size={14} /> Edit
                                        </button>
                                    ) : (
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => setEditMode(null)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Cancel</button>
                                            <button onClick={handleSave} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Save</button>
                                        </div>
                                    )}
                                </div>

                                {editMode === 'basic' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Property Name</label>
                                            <input className="form-input" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Property Type</label>
                                            <select className="form-select" value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })}>
                                                <option value="pg">PG Rooms</option>
                                                <option value="hostel">Hostel</option>
                                                <option value="apartment">Apartment</option>
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Property Name</span>
                                            <span style={{ fontWeight: 500 }}>{property.name}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Property Type</span>
                                            <span style={{ fontWeight: 500 }}>{property.type === 'pg' ? 'PG Rooms' : property.type}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>RentOk ID</span>
                                            <span style={{ fontWeight: 500, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {property.code || property.id.split('-')[0].toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Location */}
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{property.name}</h3>
                                    <button onClick={() => setEditMode('location')} style={{ background: 'none', border: '1px solid var(--accent-primary)', borderRadius: 4, color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', padding: '4px 8px' }}>
                                        <MapPin size={12} /> Update Location
                                    </button>
                                </div>
                                {editMode === 'location' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <input className="form-input" placeholder="Address" value={editForm.address || ''} onChange={e => setEditForm({ ...editForm, address: e.target.value })} />
                                        <input className="form-input" placeholder="City" value={editForm.city || ''} onChange={e => setEditForm({ ...editForm, city: e.target.value })} />
                                        <input className="form-input" placeholder="State" value={editForm.state || ''} onChange={e => setEditForm({ ...editForm, state: e.target.value })} />
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => setEditMode(null)} className="btn btn-secondary">Cancel</button>
                                            <button onClick={handleSave} className="btn btn-primary">Save Location</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: 'var(--text-secondary)' }}>
                                        <MapPin size={16} style={{ marginTop: 2, flexShrink: 0, color: 'var(--accent-primary)' }} />
                                        <span style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                                            {property.address || 'Address not set'}{property.city ? `, ${property.city}` : ''} {property.state ? `- ${property.state}` : ''}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Preferred Tenant Type */}
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Preferred Tenant Type</h3>
                                    {editMode !== 'tenant' ? (
                                        <button onClick={() => setEditMode('tenant')} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', fontWeight: 600 }}>
                                            <Edit2 size={14} /> Edit
                                        </button>
                                    ) : (
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => setEditMode(null)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Cancel</button>
                                            <button onClick={handleSave} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Save</button>
                                        </div>
                                    )}
                                </div>

                                {editMode === 'tenant' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Available For</label>
                                            <select className="form-select" value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })}>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="co_ed">Co-ed</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Preferred Tenant</label>
                                            <select className="form-select" value={editForm.preferred_tenant_type || 'student'} onChange={e => setEditForm({ ...editForm, preferred_tenant_type: e.target.value })}>
                                                <option value="student">Student</option>
                                                <option value="professional">Professional</option>
                                                <option value="both">Both</option>
                                            </select>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Available For</span>
                                            <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{property.gender || 'Not Set'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Preferred Tenant</span>
                                            <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{property.preferred_tenant_type || 'Not Set'}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Curfew Timing */}
                            <div className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Curfew Timing</h3>
                                    {editMode !== 'curfew' ? (
                                        <button onClick={() => setEditMode('curfew')} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', fontWeight: 600 }}>
                                            <Edit2 size={14} /> Edit
                                        </button>
                                    ) : (
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => setEditMode(null)} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Cancel</button>
                                            <button onClick={handleSave} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>Save</button>
                                        </div>
                                    )}
                                </div>
                                {editMode === 'curfew' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div>
                                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Last Entry Time</label>
                                            <input type="time" className="form-input" value={editForm.curfew_time || ''} onChange={e => setEditForm({ ...editForm, curfew_time: e.target.value })} />
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Last Entry Time</span>
                                        <span style={{ fontWeight: 500 }}>{property.curfew_time || 'Not Set'}</span>
                                    </div>
                                )}
                            </div>

                            {/* Virtual Business Card */}
                            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-primary)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 600 }}>
                                        <span style={{ width: 16, height: 12, background: 'var(--accent-primary)', borderRadius: 2, display: 'inline-block' }}></span>
                                        Share Your Business Card
                                    </div>
                                    <button style={{ border: '1px solid var(--accent-primary)', background: 'transparent', color: 'var(--accent-primary)', borderRadius: 4, padding: '4px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                                        <Download size={14} /> Download
                                    </button>
                                </div>
                                <div style={{ padding: 20, background: '#f8fafc' }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #0284c7, #0d9488)',
                                        borderRadius: 8, padding: 20, color: 'white', position: 'relative',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                    }}>
                                        <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.2)', padding: '4px 8px', borderRadius: 4, fontSize: '0.65rem' }}>
                                            RentOk ID<br /><strong style={{ fontSize: '0.8rem' }}>{property.code || property.id.split('-')[0].toUpperCase()}</strong>
                                        </div>
                                        <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>{property.name}</h3>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.9, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 1 }}>Premium Accommodation</div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ fontSize: '12px' }}>👤</span>
                                                </div>
                                                <span style={{ fontSize: '0.85rem' }}>Owner/Manager</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ fontSize: '12px' }}>📞</span>
                                                </div>
                                                <span style={{ fontSize: '0.85rem' }}>{property.phone || '+91 0000000000'}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ fontSize: '12px' }}>✉️</span>
                                                </div>
                                                <span style={{ fontSize: '0.85rem' }}>{property.email || 'contact@property.com'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center', marginTop: 16, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                        <strong>Proaxon Tech Pvt Ltd</strong><br />
                                        Terms & Conditions • Refund Policy • Privacy Policy
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
