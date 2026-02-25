import { useEffect, useState } from 'react';
import { Target, Plus, X, Phone, Mail, User, Briefcase, Calendar } from 'lucide-react';
import { leadApi } from '../lib/api';
import { usePropertyStore } from '../stores/propertyStore';
import { useNavigate } from 'react-router-dom';

interface Lead {
    id: string;
    name: string;
    phone: string;
    email: string;
    source: string;
    status: string;
    room_type: string;
    budget_min: string;
    budget_max: string;
    sharing_preference: string;
    expected_move_in: string;
    notes: string;
    created_at: string;
}

interface Stats {
    total: number;
    new: number;
    contacted: number;
    visit_scheduled: number;
    visit_done: number;
    follow_up: number;
    converted: number;
    junk: number;
    lost: number;
}

const statusBadge = (s: string) => {
    const map: Record<string, string> = {
        new: 'badge-info', contacted: 'badge-info',
        visit_scheduled: 'badge-warning', visit_done: 'badge-info', follow_up: 'badge-warning',
        converted: 'badge-success', junk: 'badge-danger', lost: 'badge-danger',
    };
    return map[s] || 'badge-neutral';
};

const pipelineStages = ['new', 'contacted', 'visit_scheduled', 'visit_done', 'follow_up', 'converted', 'lost', 'junk'];
const sourceOptions = ['website', 'walk_in', 'referral', 'whatsapp', 'social_media', 'broker', 'other'];
const sharingOptions = ['single', 'double', 'triple', 'quad', 'dorm'];

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const { selectedPropertyId } = usePropertyStore();
    const navigate = useNavigate();

    // Drawers state
    const [addDrawerOpen, setAddDrawerOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state for creating
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', source: 'walk_in', status: 'new',
        budget_max: '', sharing_preference: 'single', expected_move_in: ''
    });

    const loadData = () => {
        if (!selectedPropertyId) { setLoading(false); return; }
        setLoading(true);
        const params: any = {};
        if (statusFilter) params.status = statusFilter;
        Promise.all([
            leadApi.list(selectedPropertyId, params),
            leadApi.stats(selectedPropertyId),
        ]).then(([leadsRes, statsRes]) => {
            setLeads(leadsRes.data.results || leadsRes.data || []);
            setStats(statsRes.data);
        }).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, [selectedPropertyId, statusFilter]);

    const handleCreateLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPropertyId) return;
        setIsSubmitting(true);
        try {
            await leadApi.create(selectedPropertyId, formData);
            setAddDrawerOpen(false);
            setFormData({ name: '', phone: '', email: '', source: 'walk_in', status: 'new', budget_max: '', sharing_preference: 'single', expected_move_in: '' });
            loadData();
        } catch (err) {
            console.error(err);
            alert("Failed to create lead");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        if (!selectedPropertyId || !selectedLead) return;
        try {
            await leadApi.update(selectedPropertyId, selectedLead.id, { status: newStatus });
            setSelectedLead({ ...selectedLead, status: newStatus });
            loadData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleConvertBooking = async () => {
        if (!selectedPropertyId || !selectedLead) return;
        setIsSubmitting(true);
        try {
            await leadApi.convertBooking(selectedPropertyId, selectedLead.id);
            alert("Lead successfully converted to a Booking!");
            setSelectedLead(null);
            loadData();
            navigate('/bookings');
        } catch (err) {
            console.error(err);
            alert("Failed to convert lead");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-container" style={{ display: 'flex' }}>
            {/* Main Content */}
            <div style={{ flex: 1, marginRight: (addDrawerOpen || selectedLead) ? 400 : 0, transition: 'margin 0.3s' }}>
                <div className="page-header">
                    <div>
                        <h1>Leads</h1>
                        <p className="subtitle">CRM Pipeline — {leads.length} leads</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setAddDrawerOpen(true)}>
                        <Plus size={16} /> Add Lead
                    </button>
                </div>

                {/* Pipeline Funnel */}
                {stats && (
                    <div style={{ display: 'flex', gap: 4, marginBottom: 24, overflowX: 'auto', paddingBottom: 10 }}>
                        {pipelineStages.map(stage => {
                            const count = (stats as any)[stage] || 0;
                            return (
                                <div key={stage} style={{
                                    flex: '1 0 100px', background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-sm)', padding: '10px 12px', textAlign: 'center',
                                    cursor: 'pointer', transition: 'all 0.15s',
                                    borderTopColor: statusFilter === stage ? 'var(--accent-primary)' : 'var(--border-color)',
                                    borderTopWidth: statusFilter === stage ? 3 : 1,
                                }} onClick={() => setStatusFilter(statusFilter === stage ? '' : stage)}>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{count}</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                                        {stage.replace('_', ' ')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {loading ? (
                    <div className="page-loading"><div className="spinner"></div></div>
                ) : leads.length === 0 ? (
                    <div className="card">
                        <div className="empty-state">
                            <Target size={48} />
                            <h3>No Leads</h3>
                            <p>Start tracking your enquiries</p>
                        </div>
                    </div>
                ) : (
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Source</th>
                                    <th>Budget</th>
                                    <th>Move-in</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map(l => (
                                    <tr key={l.id} onClick={() => { setSelectedLead(l); setAddDrawerOpen(false); }} style={{ cursor: 'pointer' }}>
                                        <td>{l.name}</td>
                                        <td>{l.phone}</td>
                                        <td style={{ textTransform: 'capitalize' }}>{l.source.replace('_', ' ')}</td>
                                        <td>{l.budget_max ? `₹${Number(l.budget_max).toLocaleString('en-IN')}` : '—'}</td>
                                        <td>{l.expected_move_in ? new Date(l.expected_move_in).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                                        <td><span className={`badge ${statusBadge(l.status)}`}>{l.status.replace('_', ' ')}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Right Drawer - Add Form */}
            {addDrawerOpen && (
                <div style={{
                    width: 400, position: 'fixed', right: 0, top: 0, bottom: 0,
                    background: 'var(--bg-primary)', borderLeft: '1px solid var(--border-color)',
                    boxShadow: '-4px 0 15px rgba(0,0,0,0.05)', zIndex: 100,
                    display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ padding: 20, borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Add New Lead</h2>
                        <button onClick={() => setAddDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={20} />
                        </button>
                    </div>
                    <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
                        <form id="add-lead-form" onSubmit={handleCreateLead}>
                            <div className="form-group" style={{ marginBottom: 16 }}>
                                <label>Name *</label>
                                <input required className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 16 }}>
                                <label>Phone *</label>
                                <input required className="form-control" type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 16 }}>
                                <label>Email</label>
                                <input className="form-control" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <div className="form-group">
                                    <label>Source</label>
                                    <select className="form-control" value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })}>
                                        {sourceOptions.map(o => <option key={o} value={o}>{o.replace('_', ' ').toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Status</label>
                                    <select className="form-control" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        {pipelineStages.map(o => <option key={o} value={o}>{o.replace('_', ' ').toUpperCase()}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                <div className="form-group">
                                    <label>Max Budget (₹)</label>
                                    <input className="form-control" type="number" value={formData.budget_max} onChange={e => setFormData({ ...formData, budget_max: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Sharing</label>
                                    <select className="form-control" value={formData.sharing_preference} onChange={e => setFormData({ ...formData, sharing_preference: e.target.value })}>
                                        {sharingOptions.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Expected Move-in</label>
                                <input type="date" className="form-control" value={formData.expected_move_in} onChange={e => setFormData({ ...formData, expected_move_in: e.target.value })} />
                            </div>
                        </form>
                    </div>
                    <div style={{ padding: 20, borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                        <button form="add-lead-form" type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save Lead'}
                        </button>
                    </div>
                </div>
            )}

            {/* Right Drawer - Lead Details */}
            {selectedLead && (
                <div style={{
                    width: 400, position: 'fixed', right: 0, top: 0, bottom: 0,
                    background: 'var(--bg-primary)', borderLeft: '1px solid var(--border-color)',
                    boxShadow: '-4px 0 15px rgba(0,0,0,0.05)', zIndex: 100,
                    display: 'flex', flexDirection: 'column'
                }}>
                    <div style={{ padding: 20, borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Lead Profile</h2>
                        <button onClick={() => setSelectedLead(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={20} />
                        </button>
                    </div>
                    <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
                            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: 12 }}>
                                <User size={40} />
                            </div>
                            <h3 style={{ margin: 0 }}>{selectedLead.name}</h3>
                            <span className={`badge ${statusBadge(selectedLead.status)}`} style={{ marginTop: 8 }}>
                                {selectedLead.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>

                        <div className="card" style={{ marginBottom: 16 }}>
                            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Contact Info</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Phone size={16} style={{ color: 'var(--text-muted)' }} /> <span>{selectedLead.phone}</span></div>
                                {selectedLead.email && <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Mail size={16} style={{ color: 'var(--text-muted)' }} /> <span>{selectedLead.email}</span></div>}
                            </div>
                        </div>

                        <div className="card" style={{ marginBottom: 24 }}>
                            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Requirements</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <Briefcase size={16} style={{ color: 'var(--text-muted)' }} />
                                    <span>{selectedLead.sharing_preference.toUpperCase()} Sharing</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ fontWeight: 600, color: 'var(--text-muted)', width: 16 }}>₹</span>
                                    <span>Budget: {selectedLead.budget_max ? `₹${selectedLead.budget_max}` : 'Not specified'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                                    <span>Expected: {selectedLead.expected_move_in ? new Date(selectedLead.expected_move_in).toLocaleDateString() : 'Not specified'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Status Pipeline */}
                        <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>Update Stage</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {pipelineStages.map(stage => (
                                <button key={stage}
                                    onClick={() => handleUpdateStatus(stage)}
                                    style={{
                                        padding: '10px 16px', borderRadius: 8, border: '1px solid var(--border-color)',
                                        background: stage === selectedLead.status ? 'var(--bg-secondary)' : 'transparent',
                                        textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        color: stage === selectedLead.status ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        fontWeight: stage === selectedLead.status ? 600 : 400
                                    }}>
                                    {stage.replace('_', ' ').toUpperCase()}
                                    {stage === selectedLead.status && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)' }} />}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ padding: 20, borderTop: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '12px', background: '#22c55e', borderColor: '#22c55e' }}
                            onClick={handleConvertBooking}
                            disabled={isSubmitting || selectedLead.status === 'converted'}
                        >
                            {isSubmitting ? 'Processing...' : '✅ Convert to Booking'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
