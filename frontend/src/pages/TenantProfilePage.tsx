import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePropertyStore } from '../stores/propertyStore';
import { tenantApi, duesPackageApi, duesApi } from '../lib/api';
import {
    Home, ChevronLeft, Download, FileText,
    Clock, Upload, ChevronDown, Check, X as CloseIcon, Plus
} from 'lucide-react';

export default function TenantProfilePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { selectedPropertyId } = usePropertyStore();

    const [tenant, setTenant] = useState<any>(null);
    const [passbook, setPassbook] = useState<any>(null);
    const [duesPackages, setDuesPackages] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');

    // UI states
    const [showActions, setShowActions] = useState(false);
    const [showAddDues, setShowAddDues] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<any>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (selectedPropertyId && id) {
            fetchTenantData();
            fetchDuesPackages();
        }
    }, [selectedPropertyId, id]);

    const fetchTenantData = async () => {
        try {
            setLoading(true);
            const [tenantRes, passbookRes] = await Promise.all([
                tenantApi.get(selectedPropertyId!, id!),
                tenantApi.passbook(selectedPropertyId!, id!)
            ]);
            setTenant(tenantRes.data);
            setPassbook(passbookRes.data);
            setEditForm(tenantRes.data);
        } catch (error) {
            console.error('Failed to fetch tenant', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDuesPackages = async () => {
        try {
            const res = await duesPackageApi.list(selectedPropertyId!);
            const pkgs = res.data.results || res.data || [];
            // Only show active packages by default
            setDuesPackages(pkgs.filter((p: any) => p.is_active));
        } catch (error) {
            console.error(error);
        }
    };

    const handleAction = async (action: string) => {
        setShowActions(false);
        if (!selectedPropertyId || !id) return;
        try {
            if (action === 'notice') {
                if (window.confirm("Are you sure you want to give notice?")) {
                    await tenantApi.giveNotice(selectedPropertyId, id);
                    fetchTenantData();
                }
            } else if (action === 'checkout') {
                if (window.confirm('Are you sure you want to check out this tenant?')) {
                    await tenantApi.checkout(selectedPropertyId, id);
                    navigate('/tenants');
                }
            } else if (action === 'edit') {
                setIsEditing(true);
                setActiveTab('profile'); // Force profile tab for editing
            }
        } catch (e) { console.error(e); }
    };

    const saveEdit = async () => {
        if (!selectedPropertyId || !id) return;
        setSaving(true);
        try {
            await tenantApi.update(selectedPropertyId, id, editForm);
            setIsEditing(false);
            fetchTenantData();
        } catch (e) { console.error(e); }
        setSaving(false);
    };

    const handleAddDue = async (pkg: any) => {
        if (!selectedPropertyId) return;
        const amount = window.prompt(`Enter amount for ${pkg.name}:`, pkg.default_amount || '0');
        if (amount === null) return;

        try {
            await duesApi.create(selectedPropertyId, {
                tenant_id: id,
                dues_package_id: pkg.id,
                amount: parseFloat(amount),
                due_date: new Date().toISOString().split('T')[0],
                status: 'pending',
                notes: `Added via Profile`
            });
            setShowAddDues(false);
            fetchTenantData(); // Refresh passbook
            alert("Due added successfully");
        } catch (e) {
            console.error(e);
            alert("Failed to add due");
        }
    };

    if (loading) return <div className="p-8 text-center" style={{ color: 'var(--text-muted)', padding: 40 }}>Loading profile...</div>;
    if (!tenant) return <div className="p-8 text-center" style={{ color: 'var(--accent-danger)', padding: 40 }}>Tenant not found.</div>;

    const tabs = [
        { id: 'joining', label: 'Joining Form' },
        { id: 'profile', label: 'Profile Details' },
        { id: 'documents', label: 'Documents' },
        { id: 'passbook', label: 'Passbook' },
    ];

    // Form inputs helper
    const renderField = (label: string, fieldKey: string, type: string = 'text', options?: string[]) => {
        if (!isEditing) {
            let val = tenant[fieldKey];
            if (val === null || val === undefined || val === '') val = '-';
            if (type === 'boolean') val = val === true ? '✅ Yes' : (val === '-' ? '-' : '❌ No');
            return (
                <div style={{ fontSize: '0.85rem' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontSize: '0.78rem' }}>{label}</div>
                    <div style={{ fontWeight: 500 }}>{String(val)}</div>
                </div>
            );
        }

        return (
            <div style={{ fontSize: '0.85rem' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontSize: '0.78rem' }}>{label}</div>
                {type === 'select' && options ? (
                    <select
                        className="form-input"
                        style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                        value={editForm[fieldKey] || ''}
                        onChange={e => setEditForm({ ...editForm, [fieldKey]: e.target.value })}
                    >
                        <option value="">Select...</option>
                        {options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                ) : type === 'boolean' ? (
                    <select
                        className="form-input"
                        style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                        value={editForm[fieldKey] ? 'true' : 'false'}
                        onChange={e => setEditForm({ ...editForm, [fieldKey]: e.target.value === 'true' })}
                    >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                ) : (
                    <input
                        type={type}
                        className="form-input"
                        style={{ padding: '6px 10px', fontSize: '0.85rem' }}
                        value={editForm[fieldKey] || ''}
                        onChange={e => setEditForm({ ...editForm, [fieldKey]: e.target.value })}
                    />
                )}
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', height: '100%', background: 'var(--bg-primary)', color: 'var(--text-primary)', position: 'relative' }}>
            {/* ===== LEFT SIDEBAR ===== */}
            <div style={{
                width: 340, borderRight: '1px solid var(--border-primary)', background: 'var(--bg-secondary)',
                padding: 24, overflowY: 'auto', flexShrink: 0,
            }}>
                <button
                    onClick={() => navigate('/tenants')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, padding: 0 }}
                >
                    <ChevronLeft size={16} /> Back to Tenants
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
                    <img
                        src={tenant.photo_url || `https://ui-avatars.com/api/?name=${tenant.name}&background=6366f1&color=fff&size=96`}
                        alt="Avatar"
                        style={{ width: 96, height: 96, borderRadius: '50%', marginBottom: 12, border: '3px solid rgba(99,102,241,0.2)' }}
                    />
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{tenant.name}</h2>
                    <span style={{
                        padding: '3px 12px', borderRadius: 20, fontSize: '0.75rem', marginTop: 8,
                        background: tenant.status === 'active' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                        color: tenant.status === 'active' ? '#22c55e' : '#f59e0b',
                        border: `1px solid ${tenant.status === 'active' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
                    }}>
                        {tenant.status === 'active' ? '● Active' : tenant.status?.replace('_', ' ')}
                    </span>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Home size={14} /> Room: {tenant.room_number || 'Unassigned'}
                    </div>
                </div>

                {/* Renting Summary */}
                <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 20, marginBottom: 12, border: '1px solid var(--border-primary)' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Renting Summary</h3>
                    {[
                        ['Date of Joining:', tenant.move_in],
                        ['Move Out Date:', tenant.move_out || 'N/A'],
                        ['Staying Since:', tenant.move_in ? `${Math.floor((Date.now() - new Date(tenant.move_in).getTime()) / (1000 * 60 * 60 * 24))} days` : '-'],
                        ['Rent Amount:', `₹${tenant.rent}`],
                        ['Add Rent On:', '1st of every month'],
                    ].map(([label, val], i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8 }}>
                            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                            <span style={{ fontWeight: 500 }}>{val}</span>
                        </div>
                    ))}
                </div>

                {/* Financial Summary */}
                <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 20, marginBottom: 12, border: '1px solid var(--border-primary)' }}>
                    <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 }}>Financial Summary</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Total Dues</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: '#ef4444', fontWeight: 600 }}>₹{passbook?.total_dues?.toLocaleString('en-IN') || 0}</span>
                            <span style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('passbook')}>View</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Total Collection</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: '#22c55e', fontWeight: 600 }}>₹{passbook?.total_paid?.toLocaleString('en-IN') || 0}</span>
                            <span style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('passbook')}>View</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Total Deposit</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 600 }}>₹0 / ₹{Number(tenant.deposit || 0).toLocaleString('en-IN')}</span>
                            <span style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('passbook')}>View</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Food</span>
                        <span>N/A</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Assigned Packages</span>
                        <span style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer' }}>View</span>
                    </div>
                </div>

                {/* Checkin Summary */}
                <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 20, border: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>Checkin Summary</h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>Web Check-in</p>
                    </div>
                    <button style={{
                        padding: '6px 14px', fontSize: '0.75rem', border: '1px solid var(--accent-primary)',
                        color: 'var(--accent-primary)', borderRadius: 6, background: 'none', cursor: 'pointer',
                    }}>
                        Check-in ↗
                    </button>
                </div>
            </div>

            {/* ===== MAIN CONTENT ===== */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
                {/* Action Bar */}
                <div style={{
                    height: 56, borderBottom: '1px solid var(--border-primary)', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0,
                }}>
                    <div>
                        <button className="btn btn-primary" style={{ fontSize: '0.8rem' }} onClick={() => setShowAddDues(true)}>
                            ₹ Add Dues
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => { setIsEditing(false); setEditForm(tenant); }}
                                    style={{ padding: '6px 12px', border: '1px solid var(--border-primary)', borderRadius: 6, background: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}
                                >
                                    <CloseIcon size={16} /> Cancel
                                </button>
                                <button
                                    onClick={saveEdit} disabled={saving}
                                    style={{ padding: '6px 12px', border: 'none', borderRadius: 6, background: '#22c55e', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}
                                >
                                    <Check size={16} /> {saving ? 'Saving...' : 'Save'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setShowHistory(true)}
                                    style={{ padding: '6px 8px', border: '1px solid var(--border-primary)', borderRadius: 6, background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                >
                                    <Clock size={16} />
                                </button>
                                <button
                                    onClick={() => setShowActions(!showActions)}
                                    style={{ padding: '6px 14px', border: '1px solid var(--border-primary)', borderRadius: 6, background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 500 }}
                                >
                                    Actions <ChevronDown size={14} />
                                </button>
                                {showActions && (
                                    <div style={{
                                        position: 'absolute', top: '100%', right: 0, marginTop: 4,
                                        background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
                                        borderRadius: 8, padding: 4, minWidth: 180, zIndex: 100,
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                                    }}>
                                        {[
                                            { label: 'Edit Tenant', action: 'edit', color: 'var(--text-primary)' },
                                            { label: 'Give Notice', action: 'notice', color: '#f59e0b' },
                                            { label: 'Change Room', action: 'room', color: '#3b82f6' },
                                            { label: 'Checkout Tenant', action: 'checkout', color: '#ef4444' },
                                        ].map(item => (
                                            <div key={item.action}
                                                onClick={() => handleAction(item.action)}
                                                style={{
                                                    padding: '10px 14px', cursor: 'pointer', borderRadius: 6,
                                                    fontSize: '0.85rem', color: item.color, fontWeight: 500,
                                                }}
                                                className="hover-card"
                                            >
                                                {item.label}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ padding: '0 24px', marginTop: 16 }}>
                    <div style={{ display: 'flex', gap: 32, borderBottom: '2px solid var(--border-primary)' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => !isEditing && setActiveTab(tab.id)} // disable tab switch while editing
                                style={{
                                    paddingBottom: 12, fontSize: '0.85rem', fontWeight: 500,
                                    cursor: isEditing ? 'not-allowed' : 'pointer',
                                    borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                                    color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
                                    opacity: isEditing && activeTab !== tab.id ? 0.4 : 1,
                                    background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid',
                                    borderBottomColor: activeTab === tab.id ? 'var(--accent-primary)' : 'transparent',
                                    marginBottom: -2,
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>

                    {/* ===== PROFILE DETAILS TAB ===== */}
                    {activeTab === 'profile' && (
                        <div>
                            {/* Renting Details */}
                            <div style={{ background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-primary)', marginBottom: 20 }}>
                                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                                    Renting Details
                                </div>
                                <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px 24px' }}>
                                    {renderField('Full Name', 'name')}
                                    {renderField('Fixed Rent', 'rent', 'number')}
                                    {renderField('Add Rent On', 'rent_cycle', 'select', ['1', '5', '10', '15'])}
                                    {renderField('Rental Frequency', 'rental_frequency', 'select', ['Monthly', 'Daily', 'Yearly'])}
                                    {renderField('Stay Type', 'stay_type', 'select', ['Long Stay', 'Short Stay'])}
                                    {renderField('Lockin Period (Months)', 'lockin_period', 'number')}
                                    {renderField('Security Deposit', 'deposit', 'number')}
                                    {renderField('Room', 'room_number')}
                                    {renderField('Date Of Joining', 'move_in', 'date')}
                                    {renderField('Move Out Date', 'move_out', 'date')}
                                    {renderField('Notice Period (Days)', 'notice_period', 'number')}
                                    {renderField('Agreement Period (Months)', 'agreement_period', 'number')}
                                    {renderField('Referred By', 'referred_by')}
                                    {renderField('Booked By', 'booked_by')}
                                    {renderField('Last Meter Reading', 'last_meter_reading', 'number')}
                                    {renderField('Renting Type', 'renting_type', 'select', ['Sharing', 'Private'])}
                                </div>
                            </div>

                            {/* Tenant Personal Details */}
                            <div style={{ background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-primary)', marginBottom: 20 }}>
                                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                                    Tenant Personal Details
                                </div>
                                <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px 24px' }}>
                                    {renderField('Remarks', 'remarks', 'text')}
                                    {renderField('Contact Number', 'phone', 'tel')}
                                    {renderField('Alternate Number', 'alternate_phone', 'tel')}
                                    {renderField('Email', 'email', 'email')}
                                    {renderField('Date of Birth', 'date_of_birth', 'date')}
                                    {renderField('Blood Group', 'blood_group', 'select', ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'])}
                                    {renderField('Gender', 'gender', 'select', ['Male', 'Female', 'Other'])}
                                    {renderField('Occupation', 'tenant_type', 'select', ['Student', 'Professional', 'Other'])}
                                    {renderField('Permanent Address', 'permanent_address')}
                                    {renderField('Current Address', 'current_address')}
                                    <div style={{ fontSize: '0.85rem' }}>
                                        <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontSize: '0.78rem' }}>Nationality</div>
                                        <div style={{ fontWeight: 500 }}>Indian</div>
                                    </div>
                                </div>
                            </div>

                            {/* Emergency Contacts */}
                            <div style={{ background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-primary)' }}>
                                <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                                    Emergency Contacts
                                </div>
                                <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px 24px' }}>
                                    {renderField("Father's Name", 'father_name')}
                                    {renderField("Father's Contact", 'father_phone')}
                                    {renderField("Mother's Name", 'mother_name')}
                                    {renderField("Mother's Contact", 'mother_phone')}
                                    {renderField("Guardian Name", 'guardian_name')}
                                    {renderField("Guardian Contact", 'guardian_phone')}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ===== JOINING FORM TAB ===== */}
                    {activeTab === 'joining' && (
                        <div style={{ background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-primary)', padding: 24 }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>Joining Form / Agreement</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 40px' }}>
                                {[
                                    ['Full Name', tenant.name],
                                    ['Phone', tenant.phone],
                                    ['Email', tenant.email || '-'],
                                    ['Gender', tenant.gender || '-'],
                                    ['Tenant Type', tenant.tenant_type || '-'],
                                    ['Room', tenant.room_number || '-'],
                                    ['Move In Date', tenant.move_in],
                                    ['Stay Type', tenant.stay_type || 'Long Stay'],
                                    ['Monthly Rent', `₹${tenant.rent}`],
                                    ['Security Deposit', `₹${tenant.deposit}`],
                                    ['Notice Period', `${tenant.notice_period || 30} days`],
                                    ['Agreement Period', tenant.agreement_period ? `${tenant.agreement_period} months` : '-'],
                                    ["Father's Name", tenant.father_name || '-'],
                                    ["Father's Phone", tenant.father_phone || '-'],
                                    ['Permanent Address', tenant.permanent_address || '-'],
                                    ['ID Proof (Aadhaar/PAN)', tenant.id_proof_number || '-'],
                                ].map(([label, val], i) => (
                                    <div key={i} style={{ fontSize: '0.85rem', paddingBottom: 12, borderBottom: '1px solid var(--border-primary)' }}>
                                        <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontSize: '0.78rem' }}>{label}</div>
                                        <div style={{ fontWeight: 500 }}>{val}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ marginTop: 20 }}>
                                <button className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
                                    <Download size={14} /> Download Joining Form PDF
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ===== DOCUMENTS TAB ===== */}
                    {activeTab === 'documents' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Documents uploaded</h3>
                                <button className="btn btn-secondary" style={{ fontSize: '0.8rem', background: 'none', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}>
                                    Add More Documents ⊕
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                {['Govt ID Front', 'Govt ID Back', 'College / Job ID Front', 'College / Job ID Back'].map((docType, i) => (
                                    <div key={i} style={{
                                        background: 'var(--bg-card)', borderRadius: 10, border: '1px solid var(--border-primary)',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            padding: 40, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)',
                                            display: 'flex', justifyContent: 'center', alignItems: 'center'
                                        }}>
                                            <button className="btn btn-secondary" style={{ fontSize: '0.8rem', background: '#fff', border: '1px dashed var(--border-primary)', color: 'var(--text-secondary)' }}>
                                                <Upload size={14} style={{ marginRight: 6 }} /> Upload
                                            </button>
                                        </div>
                                        <div style={{ padding: '12px 16px', fontSize: '0.85rem', fontWeight: 600 }}>
                                            {docType}
                                            <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontWeight: 500 }}>
                                                <FileText size={12} /> Image
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ===== PASSBOOK TAB ===== */}
                    {activeTab === 'passbook' && (
                        <div>
                            {/* Stats Row */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 32, background: 'var(--bg-card)', padding: 16, borderRadius: 10,
                                border: '1px solid var(--border-primary)', marginBottom: 20, overflowX: 'auto',
                            }}>
                                {[
                                    { label: 'Total Dues', value: passbook?.total_dues || 0, color: '#ef4444' },
                                    { label: 'Total Collection', value: passbook?.total_paid || 0, color: '#22c55e' },
                                    { label: 'Security Deposit', value: tenant.deposit || 0, color: '#6366f1' },
                                    { label: 'Advance', value: 0, color: '#6366f1' },
                                    { label: 'Total Discount', value: 0, color: '#f59e0b' },
                                ].map((stat, i) => (
                                    <div key={i}>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: stat.color }}>₹{Number(stat.value).toLocaleString('en-IN')}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{stat.label}</div>
                                    </div>
                                ))}
                                <div style={{ borderLeft: '1px solid var(--border-primary)', paddingLeft: 32 }}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#6b21a8', cursor: 'pointer' }} onClick={() => setShowAddDues(true)}>Add Dues</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Add Dues</div>
                                </div>
                            </div>

                            <button className="btn btn-primary" style={{ marginBottom: 20, fontSize: '0.8rem', background: '#1e40af' }}>
                                <Download size={14} /> Download PDF
                            </button>

                            {/* Ledger Table */}
                            <div style={{
                                background: '#fff', borderRadius: 8, padding: 24, color: '#1e293b',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.08)', minHeight: 400,
                            }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#1e40af', color: '#fff', padding: '10px 16px', borderRadius: 6, fontSize: '0.8rem', marginBottom: 20 }}>
                                    <div>
                                        {tenant.property_name}
                                        <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>{id}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div>Property Managed by :</div>
                                        <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>Contact : -</div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: '0.8rem', marginBottom: 20 }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{tenant.name}</div>
                                        <div>{tenant.phone}</div>
                                        <div>DOJ : {tenant.move_in}</div>
                                        <div>Rent Cycle Date : 1</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div>Place of rent : <strong>{tenant.room_number || '-'}</strong></div>
                                        <div>Security Deposit : Rs {tenant.deposit}</div>
                                        <div>Monthly Rent : Rs {tenant.rent}</div>
                                    </div>
                                </div>

                                {/* Summary Box */}
                                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 120px)', border: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.75rem', borderRadius: 4, overflow: 'hidden' }}>
                                        <div style={{ padding: 10, background: '#f8fafc' }}>
                                            <div>Total Added Dues (+)</div>
                                            <div style={{ color: '#ef4444', fontWeight: 600, marginTop: 4 }}>Rs {passbook?.total_dues || 0}</div>
                                        </div>
                                        <div style={{ padding: 10, background: '#f8fafc', borderLeft: '1px solid #e2e8f0' }}>
                                            <div>Total Collection (-)</div>
                                            <div style={{ color: '#3b82f6', fontWeight: 600, marginTop: 4 }}>Rs {passbook?.total_paid || 0}</div>
                                        </div>
                                        <div style={{ padding: 10, background: '#f8fafc', borderLeft: '1px solid #e2e8f0' }}>
                                            <div>Total Used Discount (-)</div>
                                            <div style={{ color: '#64748b', fontWeight: 600, marginTop: 4 }}>Rs 0</div>
                                        </div>
                                        <div style={{ padding: 10, background: '#f8fafc', borderLeft: '1px solid #e2e8f0' }}>
                                            <div>Net Balance</div>
                                            <div style={{ color: '#ef4444', fontWeight: 600, marginTop: 4 }}>Rs {passbook?.net_balance || 0}</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#3b82f6', marginBottom: 20, cursor: 'pointer' }}>
                                    All transactions
                                </div>

                                {/* Ledger Rows */}
                                <div style={{ border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px 100px 120px', background: '#f1f5f9', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>
                                        <div style={{ padding: 10, textAlign: 'center' }}>Traxn Date</div>
                                        <div style={{ padding: 10, borderLeft: '1px solid #e2e8f0' }}>Dues/Payment Details</div>
                                        <div style={{ padding: 10, textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>Dues Amt</div>
                                        <div style={{ padding: 10, textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>Paid Amt</div>
                                        <div style={{ padding: 10, textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>Balance</div>
                                    </div>

                                    {passbook?.ledger?.map((monthGroup: any, idx: number) => (
                                        <div key={idx}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 100px 100px 120px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                                <div style={{ padding: '8px 10px', fontWeight: 700, color: '#1e40af', textAlign: 'center' }}>{monthGroup.month_name}</div>
                                                <div style={{ padding: '8px 10px', borderLeft: '1px solid #e2e8f0' }}></div>
                                                <div style={{ padding: '8px 10px', borderLeft: '1px solid #e2e8f0' }}></div>
                                                <div style={{ padding: '8px 10px', borderLeft: '1px solid #e2e8f0' }}></div>
                                                <div style={{ padding: '8px 10px', textAlign: 'center', borderLeft: '1px solid #e2e8f0', color: '#22c55e', fontSize: '0.7rem' }}>
                                                    (Opening Balance : <span style={{ color: '#22c55e' }}>Rs {monthGroup.opening_balance} Advance</span> )
                                                </div>
                                            </div>
                                            {monthGroup.entries.map((item: any, i: number) => (
                                                <div key={i} style={{
                                                    display: 'grid', gridTemplateColumns: '100px 1fr 100px 100px 120px',
                                                    borderBottom: '1px solid #e2e8f0',
                                                    background: item.type === 'due' ? '#fef2f250' : '#f0fdf450',
                                                }}>
                                                    <div style={{ padding: '8px 10px', textAlign: 'center', color: '#64748b' }}>
                                                        {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                                    </div>
                                                    <div style={{ padding: '8px 10px', borderLeft: '1px solid #e2e8f0' }}>
                                                        <div style={{ fontWeight: 600 }}>{item.data.type || 'Payment'} added by Owner</div>
                                                        <div style={{ fontSize: '0.65rem', color: '#64748b', fontStyle: 'italic', marginTop: 2 }}>
                                                            Manual Remarks : {item.data.description || item.data.notes || ''}
                                                        </div>
                                                    </div>
                                                    <div style={{ padding: '8px 10px', textAlign: 'center', borderLeft: '1px solid #e2e8f0', background: item.type === 'due' ? '#fee2e2' : 'transparent', color: item.type === 'due' ? '#991b1b' : 'inherit' }}>
                                                        {item.type === 'due' ? item.amount : ''}
                                                    </div>
                                                    <div style={{ padding: '8px 10px', textAlign: 'center', borderLeft: '1px solid #e2e8f0', background: item.type === 'payment' ? '#dcfce7' : 'transparent', color: item.type === 'payment' ? '#166534' : 'inherit' }}>
                                                        {item.type === 'payment' ? item.amount : ''}
                                                    </div>
                                                    <div style={{ padding: '8px 10px', textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>
                                                        <span style={{ color: item.running_balance > 0 ? '#ef4444' : '#22c55e' }}>
                                                            {Math.abs(item.running_balance)} {item.running_balance > 0 ? 'Dues' : 'Adv'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                            {/* Month Total */}
                                            <div style={{
                                                display: 'grid', gridTemplateColumns: '100px 1fr 100px 100px 120px',
                                                borderBottom: '1px solid #e2e8f0', background: '#f8fafc',
                                            }}>
                                                <div style={{ padding: '8px 10px' }}></div>
                                                <div style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600, borderLeft: '1px solid #e2e8f0' }}>
                                                    {monthGroup.month_name} Total
                                                </div>
                                                <div style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600, borderLeft: '1px solid #e2e8f0' }}>
                                                    {monthGroup.month_total_dues}
                                                </div>
                                                <div style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600, borderLeft: '1px solid #e2e8f0' }}>
                                                    {monthGroup.month_total_paid}
                                                </div>
                                                <div style={{ padding: '8px 10px', borderLeft: '1px solid #e2e8f0' }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== ADD DUES SIDE DRAWER ===== */}
            {showAddDues && (
                <div style={{
                    position: 'absolute', top: 0, right: 0, bottom: 0, width: 400,
                    background: 'var(--bg-primary)', borderLeft: '1px solid var(--border-primary)',
                    boxShadow: '-8px 0 24px rgba(0,0,0,0.1)', zIndex: 200, display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Add Invoice</h3>
                        <button onClick={() => setShowAddDues(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <CloseIcon size={20} />
                        </button>
                    </div>

                    <div style={{ padding: 16 }}>
                        <div style={{ position: 'relative', marginBottom: 16 }}>
                            <input className="form-input" placeholder="Search due types..." style={{ paddingLeft: 32, fontSize: '0.85rem' }} />
                            <FileText size={16} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: 'calc(100vh - 140px)' }}>
                            {duesPackages.map(pkg => (
                                <div key={pkg.id} style={{
                                    border: '1px solid var(--border-primary)', borderRadius: 8, padding: 16,
                                    background: 'var(--bg-card)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{pkg.name}</div>
                                            {/* We mock pending since we don't have per-package split in our API yet */}
                                            <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: 4 }}>Pending: ₹0</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due: -</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8 }}>
                                                {pkg.type === 'fixed' ? `Fixed Amount: ₹${pkg.default_amount}` : 'Fixed Amount: Not fixed'}
                                            </div>
                                        </div>
                                        <button
                                            className="btn btn-primary"
                                            style={{ padding: '4px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4, background: '#3b82f6' }}
                                            onClick={() => handleAddDue(pkg)}
                                        >
                                            <Plus size={14} /> Add
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {duesPackages.length === 0 && (
                                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    No active dues packages found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ===== HISTORY SIDE DRAWER ===== */}
            {showHistory && (
                <div style={{
                    position: 'absolute', top: 0, right: 0, bottom: 0, width: 360,
                    background: 'var(--bg-primary)', borderLeft: '1px solid var(--border-primary)',
                    boxShadow: '-8px 0 24px rgba(0,0,0,0.1)', zIndex: 200, display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Activity Logs</h3>
                        <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <CloseIcon size={20} />
                        </button>
                    </div>

                    <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
                        <div style={{ paddingBottom: 16, borderLeft: '2px solid #e2e8f0', position: 'relative', marginLeft: 8 }}>
                            <div style={{ position: 'absolute', left: -7, top: 0, width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }}></div>
                            <div style={{ paddingLeft: 16 }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tenant Profile Created</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{tenant.created_at ? new Date(tenant.created_at).toLocaleString('en-IN') : 'Recently'}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 4 }}>By: Owner</div>
                            </div>
                        </div>
                        {/* More mocked history items would go here */}
                    </div>
                </div>
            )}
        </div>
    );
}
