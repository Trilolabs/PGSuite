import { useState, useEffect } from 'react';
import { Save, ArrowLeft, RefreshCw, X } from 'lucide-react';
import { roomApi, tenantApi } from '../lib/api';
import { usePropertyStore } from '../stores/propertyStore';
import { useNavigate } from 'react-router-dom';

interface RoomProfileDrawerProps {
    roomId: string;
    onClose: () => void;
}

export default function RoomProfileDrawer({ roomId, onClose }: RoomProfileDrawerProps) {
    const { selectedPropertyId } = usePropertyStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [room, setRoom] = useState<any>(null);
    const [tenants, setTenants] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'details' | 'tenants' | 'settings'>('details');
    const [isEditing, setIsEditing] = useState(false); // Toggle read-only mode

    // Local form state for edits
    const [formData, setFormData] = useState<any>({});

    const allFacilities = ['AC', 'TV', 'Washroom', 'Balcony', 'Food', 'CCTV', 'Laundry', 'WiFi', 'Geyser', 'Cupboard', 'Table', 'Chair'];
    const allTags = ['Corner Room', 'Large Room', 'Furnished', 'Unfurnished', 'Male', 'Female'];

    useEffect(() => {
        if (!selectedPropertyId) return;
        setLoading(true);
        Promise.all([
            roomApi.get(selectedPropertyId, roomId),
            tenantApi.list(selectedPropertyId, { room: roomId }),
            tenantApi.list(selectedPropertyId, { room: roomId, is_booking: true })
        ]).then(([roomRes, tenantsRes, bookingsRes]) => {
            const data = roomRes.data;
            setRoom(data);
            setTenants(tenantsRes.data.results || tenantsRes.data || []);
            setBookings(bookingsRes.data.results || bookingsRes.data || []);

            setFormData({
                number: data.number,
                type: data.type,
                rent_per_bed: data.rent_per_bed,
                remarks: data.remarks || '',
                is_available: data.is_available,
                amenities: data.amenities || [],
                tags: data.tags || [],
                address: data.address || '',
                status: data.status,
                linked_bank: data.linked_bank,
                floor_name: data.floor_name || '', // To support explicit floor selection
                total_beds: data.total_beds,
            });
        }).finally(() => setLoading(false));
    }, [selectedPropertyId, roomId]);

    const handleSave = async () => {
        if (!selectedPropertyId) return;
        setSaving(true);
        try {
            const payload = { ...formData, bed_count: formData.total_beds };
            await roomApi.update(selectedPropertyId, roomId, payload);
            // Optionally fetch again or just close
            setIsEditing(false);
            window.location.reload(); // Refresh the parent table values as well
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const toggleArrayItem = (field: 'amenities' | 'tags', value: string) => {
        if (!isEditing) return; // Prevent edits in read-only mode
        setFormData((prev: any) => {
            const list = prev[field] || [];
            if (list.includes(value)) {
                return { ...prev, [field]: list.filter((i: string) => i !== value) };
            } else {
                return { ...prev, [field]: [...list, value] };
            }
        });
    };

    if (loading) {
        return (
            <div className="drawer-overlay" style={{ zIndex: 1000 }} onClick={onClose}>
                <div className="drawer-container" style={{ width: 550, padding: 20 }} onClick={e => e.stopPropagation()}>
                    <div className="page-loading"><div className="spinner"></div></div>
                </div>
            </div>
        );
    }

    if (!room) return null;

    return (
        <div className="drawer-overlay" style={{ zIndex: 1000 }} onClick={onClose}>
            <div className="drawer-container" style={{ width: 550, display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>

                {/* Header Sequence per UI plan */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 10px 24px', background: 'var(--bg-card)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
                            <ArrowLeft size={20} />
                        </button>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Room {room.number} Details</h2>
                    </div>
                    <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, fontSize: '0.85rem' }}>
                        <RefreshCw size={14} /> Unpublish
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-primary)', padding: '0 24px', background: 'var(--bg-card)' }}>
                    {[
                        { id: 'details', label: 'Room Renting Details' },
                        { id: 'tenants', label: 'Tenant Details' },
                        { id: 'settings', label: 'Settings' }
                    ].map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6,
                                    padding: '12px 16px', background: 'transparent',
                                    border: 'none', borderBottom: `2px solid ${isActive ? 'var(--primary)' : 'transparent'} `,
                                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    fontWeight: isActive ? 600 : 400, cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: 'var(--bg-body)' }}>

                    {activeTab === 'details' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                            <div style={{ padding: 24, paddingBottom: 80, display: 'flex', flexDirection: 'column', gap: 24 }}>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Room Name <span className="text-danger">*</span></label>
                                        <input className="form-input" value={formData.number} onChange={e => isEditing && setFormData({ ...formData, number: e.target.value })} disabled={!isEditing} />
                                    </div>
                                    <div className="form-group" />
                                    <div className="form-group">
                                        <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Unit Type <span className="text-danger">*</span></label>
                                        <select className="form-select" value={formData.type} onChange={e => isEditing && setFormData({ ...formData, type: e.target.value })} disabled={!isEditing}>
                                            <option value="single">Single Sharing</option>
                                            <option value="double">Double Sharing</option>
                                            <option value="triple">Triple Sharing</option>
                                            <option value="quad">Quad Sharing</option>
                                            <option value="dormitory">Dormitory</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Select Floor <span className="text-danger">*</span></label>
                                        <input className="form-input" placeholder="e.g 1st Floor" value={formData.floor_name || ''} onChange={e => isEditing && setFormData({ ...formData, floor_name: e.target.value })} disabled={!isEditing} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Sharing Type <span className="text-danger">*</span></label>
                                        <select className="form-select" value={formData.type} onChange={e => isEditing && setFormData({ ...formData, type: e.target.value })} disabled={!isEditing}>
                                            <option value="single">1 Sharing</option>
                                            <option value="double">2 Sharing</option>
                                            <option value="triple">3 Sharing</option>
                                            <option value="quad">4 Sharing</option>
                                            <option value="dormitory">Dormitory</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ color: 'var(--text-secondary)' }}>No. of Beds *</label>
                                        <input className="form-input" type="number" value={formData.total_beds} onChange={e => isEditing && setFormData({ ...formData, total_beds: parseInt(e.target.value) || 1 })} disabled={!isEditing} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Amount Per Bed</label>
                                        <input className="form-input" type="number" value={formData.rent_per_bed} onChange={e => isEditing && setFormData({ ...formData, rent_per_bed: e.target.value })} disabled={!isEditing} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Room Remarks</label>
                                    <input className="form-input" value={formData.remarks} onChange={e => isEditing && setFormData({ ...formData, remarks: e.target.value })} placeholder="Remarks" disabled={!isEditing} />
                                </div>

                                <div className="form-group">
                                    <label className="form-label" style={{ color: 'var(--text-secondary)' }}>Is this room available to rent <span className="text-danger">*</span></label>
                                    <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: isEditing ? 'pointer' : 'default' }}>
                                            <input type="radio" name="is_available" checked={formData.is_available === true} onChange={() => isEditing && setFormData({ ...formData, is_available: true })} disabled={!isEditing} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
                                            Yes
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: isEditing ? 'pointer' : 'default' }}>
                                            <input type="radio" name="is_available" checked={formData.is_available === false} onChange={() => isEditing && setFormData({ ...formData, is_available: false })} disabled={!isEditing} style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
                                            No
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16, color: 'var(--primary)' }}>Room Facilities</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>Facilities</p>
                                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                        {allFacilities.map(fac => {
                                            const selected = formData.amenities?.includes(fac);
                                            return (
                                                <div
                                                    key={fac}
                                                    onClick={() => toggleArrayItem('amenities', fac)}
                                                    style={{
                                                        padding: '8px 16px', fontSize: '0.85rem', borderRadius: 6, cursor: isEditing ? 'pointer' : 'default',
                                                        display: 'flex', alignItems: 'center', gap: 8,
                                                        border: `1px solid ${selected ? 'var(--primary)' : 'var(--border-disabled)'}`,
                                                        background: selected ? 'var(--bg-primary-light)' : 'transparent',
                                                        color: selected ? 'var(--primary)' : 'var(--text-secondary)',
                                                        opacity: (!isEditing && !selected) ? 0.5 : 1
                                                    }}
                                                >
                                                    <input type="checkbox" checked={selected} readOnly style={{ accentColor: 'var(--primary)', pointerEvents: 'none' }} />
                                                    {fac}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div style={{ marginTop: 8 }}>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>Room Type</p>
                                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                        {allTags.map(tag => {
                                            const selected = formData.tags?.includes(tag);
                                            return (
                                                <div
                                                    key={tag}
                                                    onClick={() => toggleArrayItem('tags', tag)}
                                                    style={{
                                                        padding: '8px 16px', fontSize: '0.85rem', borderRadius: 6, cursor: isEditing ? 'pointer' : 'default',
                                                        display: 'flex', alignItems: 'center', gap: 8,
                                                        border: `1px solid ${selected ? 'var(--primary)' : 'var(--border-disabled)'}`,
                                                        background: selected ? 'var(--bg-primary-light)' : 'transparent',
                                                        color: selected ? 'var(--primary)' : 'var(--text-secondary)',
                                                        opacity: (!isEditing && !selected) ? 0.5 : 1
                                                    }}
                                                >
                                                    <input type="checkbox" checked={selected} readOnly style={{ accentColor: 'var(--primary)', pointerEvents: 'none' }} />
                                                    {tag}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Footer */}
                            <div style={{ position: 'sticky', bottom: 0, left: 0, right: 0, padding: '16px 24px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-primary)', display: 'flex', gap: 16 }}>
                                {isEditing ? (
                                    <>
                                        <button className="btn btn-primary" style={{ flex: 1, height: 44 }} onClick={handleSave} disabled={saving}>
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button className="btn btn-secondary" style={{ flex: 1, height: 44, color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => setIsEditing(false)}>
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn btn-primary" style={{ flex: 1, height: 44 }} onClick={() => setIsEditing(true)}>
                                            Edit
                                        </button>
                                        <button className="btn btn-secondary" style={{ flex: 1, height: 44, color: 'var(--primary)', borderColor: 'var(--primary)' }} onClick={() => { }}>
                                            <X size={16} style={{ marginRight: 6 }} /> Disable for rent
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}




                    {activeTab === 'tenants' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                            <div style={{ padding: 24, paddingBottom: 80, display: 'flex', flexDirection: 'column', gap: 32 }}>

                                {/* Current Tenants Section */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <span style={{ background: 'var(--bg-primary-light)', color: 'var(--primary)', padding: '4px 12px', borderRadius: 16, fontSize: '0.85rem', fontWeight: 600 }}>
                                            {tenants.length} Current Tenants
                                        </span>
                                    </div>
                                    <div style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-primary)' }}>
                                        <table style={{ width: '100%', minWidth: 500, borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-primary)' }}>
                                                <tr>
                                                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>NAME</th>
                                                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>UNIT / BED</th>
                                                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>RENT</th>
                                                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>DATE OF JOINING</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tenants.map(tenant => (
                                                    <tr key={tenant.id} style={{ borderBottom: '1px solid var(--border-primary)', cursor: 'pointer' }} onClick={() => navigate(`/tenants/${tenant.id}`)}>
                                                        <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                                            <div style={{ width: 28, height: 28, borderRadius: 14, background: 'var(--bg-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 600, fontSize: '0.8rem' }}>
                                                                {tenant.name.charAt(0)}
                                                            </div>
                                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{tenant.name}</span>
                                                        </td>
                                                        <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                            {room.number}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', fontSize: '0.9rem', fontWeight: 600, color: '#16a34a' }}>
                                                            ₹{tenant.rent ? tenant.rent.toLocaleString() : '0'}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                            {tenant.move_in_date || 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {tenants.length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No active tenants in this room</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Future Bookings Section */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '4px 12px', borderRadius: 16, fontSize: '0.85rem', fontWeight: 600 }}>
                                            {bookings.length} Bookings
                                        </span>
                                    </div>
                                    <div style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-primary)' }}>
                                        <table style={{ width: '100%', minWidth: 500, borderCollapse: 'collapse', textAlign: 'left' }}>
                                            <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-primary)' }}>
                                                <tr>
                                                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>NAME</th>
                                                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>UNIT / BED</th>
                                                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>BOOKING AMOUNT</th>
                                                    <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>BOOKING DATE</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bookings.map(booking => (
                                                    <tr key={booking.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                                        <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                                            <div style={{ width: 28, height: 28, borderRadius: 14, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', fontWeight: 600, fontSize: '0.8rem' }}>
                                                                B
                                                            </div>
                                                            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Booking #{booking.id.slice(0, 5)}</span>
                                                        </td>
                                                        <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                            {room.number}
                                                        </td>
                                                        <td style={{ padding: '12px 16px', fontSize: '0.9rem', fontWeight: 600, color: '#16a34a' }}>
                                                            ₹0
                                                        </td>
                                                        <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                                            {booking.expected_move_in || 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {bookings.length === 0 && (
                                                    <tr>
                                                        <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No upcoming bookings</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Footer */}
                            <div style={{ position: 'sticky', bottom: 0, left: 0, right: 0, padding: '16px 24px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-primary)' }}>
                                <button className="btn btn-primary" style={{ width: '100%', height: 44, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }} onClick={() => navigate('/tenants/add')}>
                                    Add Tenant
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                            <div style={{ padding: 24, paddingBottom: 80, display: 'flex', flexDirection: 'column', gap: 24 }}>

                                <div className="card" style={{ padding: 20 }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Specific Room Address</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                                        If this room/flat has a different physical address than the main property (common in distributed Co-Living setups), configure it here.
                                    </p>
                                    <textarea className="form-input" rows={3} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Full address..."></textarea>
                                </div>

                                <div className="card" style={{ padding: 20 }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Linked Bank</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
                                        Select Bank Account or UPI
                                    </p>
                                    <select className="form-select" value={formData.linked_bank || ''} onChange={e => setFormData({ ...formData, linked_bank: e.target.value })}>
                                        <option value="">Choose a bank account or UPI...</option>
                                        <option value="bank_1">HDFC Bank - **** 1234</option>
                                        <option value="bank_2">SBI - **** 5678</option>
                                    </select>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Agreement Parties</h3>
                                    <div style={{
                                        border: '1px dashed var(--border-disabled)',
                                        borderRadius: 8,
                                        padding: 32,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: '#f8fafc',
                                        gap: 8
                                    }}>
                                        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>No agreement parties added yet</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click Edit Settings to add agreement parties</p>
                                    </div>
                                </div>
                            </div>

                            {/* Sticky Footer */}
                            <div style={{ position: 'sticky', bottom: 0, left: 0, right: 0, padding: '16px 24px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-primary)' }}>
                                <button className="btn btn-primary" style={{ width: '100%', height: 44, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                                    Edit Settings
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                {/* Legacy Footer (Hidden on Details and Tenants Tabs to prevent duplicates) */}
                {activeTab === 'settings' && (
                    <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-primary)', background: 'var(--bg-card)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <button className="btn btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                        </button>
                    </div>
                )}
            </div>
        </div >
    );
}
