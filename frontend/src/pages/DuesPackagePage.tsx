import { useEffect, useState } from 'react';
import { Plus, MoreVertical, X, Search } from 'lucide-react';
import { duesPackageApi } from '../lib/api';
import { usePropertyStore } from '../stores/propertyStore';
import { useNavigate } from 'react-router-dom';

interface DuesPackage {
    id: string;
    name: string;
    type: 'fixed' | 'variable' | 'unit_based';
    default_amount: string;
    frequency: string;
    is_active: boolean;
    is_system: boolean;
    icon: string;
    description: string;
}

export default function DuesPackagePage() {
    const [packages, setPackages] = useState<DuesPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [menuOpen, setMenuOpen] = useState<string | null>(null);
    const [editPkg, setEditPkg] = useState<DuesPackage | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [addForm, setAddForm] = useState({ name: '', type: 'variable' as string });
    const [editForm, setEditForm] = useState({ is_active: true, name: '', type: 'variable', default_amount: '0' });
    const [saving, setSaving] = useState(false);
    const { selectedPropertyId } = usePropertyStore();
    const navigate = useNavigate();

    const loadData = () => {
        if (!selectedPropertyId) { setLoading(false); return; }
        duesPackageApi.list(selectedPropertyId)
            .then(res => setPackages(res.data.results || res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, [selectedPropertyId]);

    const handleToggle = async (pkg: DuesPackage) => {
        if (!selectedPropertyId) return;
        try {
            await duesPackageApi.toggle(selectedPropertyId, pkg.id);
            setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, is_active: !p.is_active } : p));
        } catch { }
    };

    const handleEdit = (pkg: DuesPackage) => {
        setEditPkg(pkg);
        setEditForm({
            is_active: pkg.is_active,
            name: pkg.name,
            type: pkg.type,
            default_amount: pkg.default_amount || '0',
        });
        setMenuOpen(null);
    };

    const handleSaveEdit = async () => {
        if (!selectedPropertyId || !editPkg) return;
        setSaving(true);
        try {
            await duesPackageApi.update(selectedPropertyId, editPkg.id, editForm);
            setEditPkg(null);
            loadData();
        } catch { }
        setSaving(false);
    };

    const handleDelete = async (pkg: DuesPackage) => {
        if (!selectedPropertyId || pkg.is_system) return;
        if (!confirm(`Delete "${pkg.name}"? This cannot be undone.`)) return;
        try {
            await duesPackageApi.delete(selectedPropertyId, pkg.id);
            setPackages(prev => prev.filter(p => p.id !== pkg.id));
        } catch { }
        setMenuOpen(null);
    };

    const handleAdd = async () => {
        if (!selectedPropertyId || !addForm.name.trim()) return;
        setSaving(true);
        try {
            await duesPackageApi.create(selectedPropertyId, {
                name: addForm.name.trim(),
                type: addForm.type,
                is_active: false,
            });
            setShowAdd(false);
            setAddForm({ name: '', type: 'variable' });
            loadData();
        } catch { }
        setSaving(false);
    };

    const filtered = packages.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );
    const totalCount = packages.length;
    const activeCount = packages.filter(p => p.is_active).length;

    const getBillingInfo = (pkg: DuesPackage) => {
        if (pkg.type === 'unit_based') return `₹${Number(pkg.default_amount || 0).toLocaleString('en-IN')}/Electricity Unit`;
        if (pkg.type === 'fixed' && Number(pkg.default_amount) > 0) return `₹${Number(pkg.default_amount).toLocaleString('en-IN')} fixed`;
        return 'Variable Amount';
    };

    if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

    return (
        <div className="page-container" onClick={() => setMenuOpen(null)}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>Dues Package</h1>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage due categories and billing settings</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
                    <Plus size={16} /> Add Category
                </button>
            </div>

            {/* Stats */}
            <div className="card" style={{ display: 'flex', gap: 40, marginBottom: 24, padding: '20px 28px' }}>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Total Categories</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{totalCount}</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Active Categories</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#22c55e' }}>{activeCount}</div>
                </div>
            </div>

            {/* Search */}
            <div style={{ position: 'relative', marginBottom: 20 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                <input
                    className="form-input"
                    placeholder="Search due categories..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ paddingLeft: 36 }}
                />
            </div>

            {/* Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {filtered.map(pkg => (
                    <div
                        key={pkg.id}
                        className="card"
                        style={{
                            padding: '20px',
                            borderLeft: pkg.is_active ? '4px solid #22c55e' : '4px solid var(--border-primary)',
                            position: 'relative',
                        }}
                    >
                        {/* Card header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: '1.4rem' }}>{pkg.icon}</span>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{pkg.name}</div>
                                    <span style={{
                                        display: 'inline-block',
                                        fontSize: '0.6rem',
                                        fontWeight: 700,
                                        padding: '2px 8px',
                                        borderRadius: 4,
                                        marginTop: 4,
                                        background: pkg.is_active ? '#dcfce7' : '#fef3c7',
                                        color: pkg.is_active ? '#166534' : '#92400e',
                                    }}>
                                        {pkg.is_active ? 'ACTIVE' : 'DISABLED'}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {/* Toggle */}
                                <button
                                    onClick={e => { e.stopPropagation(); handleToggle(pkg); }}
                                    style={{
                                        width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                                        background: pkg.is_active ? '#22c55e' : '#94a3b8',
                                        position: 'relative', transition: 'background 0.2s',
                                    }}
                                >
                                    <div style={{
                                        width: 18, height: 18, borderRadius: '50%', background: '#fff',
                                        position: 'absolute', top: 3,
                                        left: pkg.is_active ? 21 : 3,
                                        transition: 'left 0.2s',
                                    }} />
                                </button>
                                {/* Menu button */}
                                <div style={{ position: 'relative' }}>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={e => { e.stopPropagation(); setMenuOpen(menuOpen === pkg.id ? null : pkg.id); }}
                                        style={{ padding: 4 }}
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                    {menuOpen === pkg.id && (
                                        <div
                                            onClick={e => e.stopPropagation()}
                                            style={{
                                                position: 'absolute', right: 0, top: 30, zIndex: 10,
                                                background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
                                                borderRadius: 8, minWidth: 130, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <button
                                                onClick={() => handleEdit(pkg)}
                                                style={{
                                                    display: 'block', width: '100%', padding: '10px 16px',
                                                    textAlign: 'left', border: 'none', background: 'none',
                                                    cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)',
                                                }}
                                                className="hover-card"
                                            >
                                                ✏️ Edit
                                            </button>
                                            {!pkg.is_system && (
                                                <button
                                                    onClick={() => handleDelete(pkg)}
                                                    style={{
                                                        display: 'block', width: '100%', padding: '10px 16px',
                                                        textAlign: 'left', border: 'none', background: 'none',
                                                        cursor: 'pointer', fontSize: '0.85rem', color: '#ef4444',
                                                    }}
                                                    className="hover-card"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Billing info */}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                            {getBillingInfo(pkg)}
                        </div>

                        {/* Action button */}
                        {pkg.is_active ? (
                            <button
                                className="btn btn-primary"
                                style={{ fontSize: '0.75rem', padding: '6px 14px' }}
                                onClick={() => navigate('/dues')}
                            >
                                Add Dues
                            </button>
                        ) : (
                            <button
                                className="btn"
                                style={{
                                    fontSize: '0.75rem', padding: '6px 14px',
                                    background: '#166534', color: '#fff', border: 'none',
                                }}
                                onClick={() => handleToggle(pkg)}
                            >
                                Enable
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <p style={{ color: 'var(--text-muted)' }}>No categories found</p>
                </div>
            )}

            {/* ====== Edit Modal ====== */}
            {editPkg && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
                }}
                    onClick={() => setEditPkg(null)}
                >
                    <div className="card" style={{ width: 440, padding: 28 }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Edit Category</h2>
                            <button className="btn btn-ghost" onClick={() => setEditPkg(null)}><X size={18} /></button>
                        </div>

                        {/* Enable toggle */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Enable Category</label>
                            <button
                                onClick={() => setEditForm(f => ({ ...f, is_active: !f.is_active }))}
                                style={{
                                    width: 48, height: 26, borderRadius: 14, border: 'none', cursor: 'pointer',
                                    background: editForm.is_active ? '#22c55e' : '#94a3b8',
                                    position: 'relative', transition: 'background 0.2s',
                                }}
                            >
                                <div style={{
                                    width: 20, height: 20, borderRadius: '50%', background: '#fff',
                                    position: 'absolute', top: 3,
                                    left: editForm.is_active ? 25 : 3,
                                    transition: 'left 0.2s',
                                }} />
                            </button>
                        </div>

                        {/* Name */}
                        <div className="form-group">
                            <label className="form-label">Category Name</label>
                            <input
                                className="form-input"
                                value={editForm.name}
                                onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                                disabled={editPkg.is_system}
                                style={editPkg.is_system ? { opacity: 0.6 } : {}}
                            />
                        </div>

                        {/* Billing Mode */}
                        <div className="form-group" style={{ marginTop: 16 }}>
                            <label className="form-label">Billing Mode</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                    <input
                                        type="radio" name="billing_mode"
                                        checked={editForm.type === 'variable'}
                                        onChange={() => setEditForm(f => ({ ...f, type: 'variable', default_amount: '0' }))}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Variable Amount</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            Dues amount can be different for each tenant/room
                                        </div>
                                    </div>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                    <input
                                        type="radio" name="billing_mode"
                                        checked={editForm.type === 'fixed'}
                                        onChange={() => setEditForm(f => ({ ...f, type: 'fixed' }))}
                                    />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Fixed Amount</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            Same amount for all tenants
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Fixed Amount Input */}
                        {editForm.type === 'fixed' && (
                            <div className="form-group" style={{ marginTop: 16 }}>
                                <label className="form-label">Fixed Amount (₹)</label>
                                <input
                                    className="form-input"
                                    type="number"
                                    value={editForm.default_amount}
                                    onChange={e => setEditForm(f => ({ ...f, default_amount: e.target.value }))}
                                />
                            </div>
                        )}

                        {/* Unit rate for electricity */}
                        {editPkg?.type === 'unit_based' && (
                            <div className="form-group" style={{ marginTop: 16 }}>
                                <label className="form-label">Cost per Unit (₹)</label>
                                <input
                                    className="form-input"
                                    type="number"
                                    value={editForm.default_amount}
                                    onChange={e => setEditForm(f => ({ ...f, default_amount: e.target.value }))}
                                />
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                            <button className="btn" onClick={() => setEditPkg(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSaveEdit} disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ====== Add Modal ====== */}
            {showAdd && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
                }}
                    onClick={() => setShowAdd(false)}
                >
                    <div className="card" style={{ width: 420, padding: 28 }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Add Category</h2>
                            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}><X size={18} /></button>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Due Type Name</label>
                            <input
                                className="form-input"
                                placeholder="e.g. Water Bill"
                                value={addForm.name}
                                onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                            />
                        </div>

                        <div className="form-group" style={{ marginTop: 16 }}>
                            <label className="form-label">Billing Mode</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                    <input
                                        type="radio" name="add_billing"
                                        checked={addForm.type === 'variable'}
                                        onChange={() => setAddForm(f => ({ ...f, type: 'variable' }))}
                                    />
                                    <span style={{ fontSize: '0.85rem' }}>Variable Amount</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                    <input
                                        type="radio" name="add_billing"
                                        checked={addForm.type === 'fixed'}
                                        onChange={() => setAddForm(f => ({ ...f, type: 'fixed' }))}
                                    />
                                    <span style={{ fontSize: '0.85rem' }}>Fixed Amount</span>
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                            <button className="btn" onClick={() => setShowAdd(false)}>Cancel</button>
                            <button
                                className="btn btn-primary"
                                onClick={handleAdd}
                                disabled={saving || !addForm.name.trim()}
                            >
                                {saving ? 'Creating...' : 'Add Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
