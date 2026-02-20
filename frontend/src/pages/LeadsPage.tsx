import { useEffect, useState } from 'react';
import { Target, Plus } from 'lucide-react';
import { leadApi } from '../lib/api';
import { usePropertyStore } from '../stores/propertyStore';

interface Lead {
    id: string;
    name: string;
    phone: string;
    email: string;
    source: string;
    status: string;
    room_type: string;
    budget: string;
    move_in_date: string;
    notes: string;
    created_at: string;
}

interface Stats {
    total: number;
    new: number;
    contacted: number;
    interested: number;
    visit_scheduled: number;
    visited: number;
    converted: number;
    lost: number;
}

const statusBadge = (s: string) => {
    const map: Record<string, string> = {
        new: 'badge-info', contacted: 'badge-info',
        interested: 'badge-warning', visit_scheduled: 'badge-warning',
        visited: 'badge-info', converted: 'badge-success', lost: 'badge-danger',
    };
    return map[s] || 'badge-neutral';
};

const pipelineStages = ['new', 'contacted', 'interested', 'visit_scheduled', 'visited', 'converted', 'lost'];

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const { selectedPropertyId } = usePropertyStore();

    useEffect(() => {
        if (!selectedPropertyId) { setLoading(false); return; }
        const params: any = {};
        if (statusFilter) params.status = statusFilter;
        Promise.all([
            leadApi.list(selectedPropertyId, params),
            leadApi.stats(selectedPropertyId),
        ]).then(([leadsRes, statsRes]) => {
            setLeads(leadsRes.data.results || leadsRes.data || []);
            setStats(statsRes.data);
        }).catch(() => { }).finally(() => setLoading(false));
    }, [selectedPropertyId, statusFilter]);

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Leads</h1>
                    <p className="subtitle">CRM Pipeline — {leads.length} leads</p>
                </div>
                <button className="btn btn-primary"><Plus size={16} /> Add Lead</button>
            </div>

            {/* Pipeline Funnel */}
            {stats && (
                <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
                    {pipelineStages.map(stage => {
                        const count = (stats as any)[stage] || 0;
                        stats.total;
                        return (
                            <div key={stage} style={{
                                flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border-color)',
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
                                <tr key={l.id}>
                                    <td>{l.name}</td>
                                    <td>{l.phone}</td>
                                    <td style={{ textTransform: 'capitalize' }}>{l.source}</td>
                                    <td>{l.budget ? `₹${Number(l.budget).toLocaleString('en-IN')}` : '—'}</td>
                                    <td>{l.move_in_date ? new Date(l.move_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</td>
                                    <td><span className={`badge ${statusBadge(l.status)}`}>{l.status.replace('_', ' ')}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
