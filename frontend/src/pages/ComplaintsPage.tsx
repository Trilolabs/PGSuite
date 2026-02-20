import { useEffect, useState } from 'react';
import { AlertTriangle, Plus, CheckCircle2, Clock, User } from 'lucide-react';
import { complaintApi } from '../lib/api';
import { usePropertyStore } from '../stores/propertyStore';

interface Complaint {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    tenant_name: string;
    room_number: string | null;
    assigned_to_name: string | null;
    created_at: string;
}

const priorityBadge = (p: string) => {
    const map: Record<string, string> = { high: 'badge-danger', medium: 'badge-warning', low: 'badge-info' };
    return map[p] || 'badge-neutral';
};
const statusBadge = (s: string) => {
    const map: Record<string, string> = {
        open: 'badge-danger', acknowledged: 'badge-warning',
        in_progress: 'badge-info', resolved: 'badge-success', closed: 'badge-neutral',
    };
    return map[s] || 'badge-neutral';
};

export default function ComplaintsPage() {
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const { selectedPropertyId } = usePropertyStore();

    useEffect(() => {
        if (!selectedPropertyId) { setLoading(false); return; }
        complaintApi.list(selectedPropertyId)
            .then(res => setComplaints(res.data.results || res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [selectedPropertyId]);

    const open = complaints.filter(c => ['open', 'acknowledged', 'in_progress'].includes(c.status)).length;

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Complaints</h1>
                    <p className="subtitle">{open} open, {complaints.length - open} resolved</p>
                </div>
                <button className="btn btn-primary"><Plus size={16} /> New Complaint</button>
            </div>

            {loading ? (
                <div className="page-loading"><div className="spinner"></div></div>
            ) : complaints.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <AlertTriangle size={48} />
                        <h3>No Complaints</h3>
                        <p>All clear! No issues to report.</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                    {complaints.map(c => (
                        <div className="card" key={c.id} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                                background: c.status === 'resolved' ? 'var(--accent-success-bg)' : 'var(--accent-warning-bg)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                            }}>
                                {c.status === 'resolved' ? <CheckCircle2 size={20} style={{ color: 'var(--accent-success)' }} /> : <Clock size={20} style={{ color: 'var(--accent-warning)' }} />}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                    <strong>{c.title}</strong>
                                    <span className={`badge ${priorityBadge(c.priority)}`}>{c.priority}</span>
                                    <span className={`badge ${statusBadge(c.status)}`}>{c.status.replace('_', ' ')}</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>{c.description}</p>
                                <div style={{ display: 'flex', gap: 16, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    <span><User size={12} style={{ verticalAlign: 'middle' }} /> {c.tenant_name}</span>
                                    {c.room_number && <span>Room {c.room_number}</span>}
                                    {c.assigned_to_name && <span>→ {c.assigned_to_name}</span>}
                                    <span>{new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
