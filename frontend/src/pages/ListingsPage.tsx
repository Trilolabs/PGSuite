import { useEffect, useState } from 'react';
import { Globe, Eye, EyeOff, ExternalLink, RefreshCw, Building2 } from 'lucide-react';
import api from '../lib/api';

interface Listing {
    id: string;
    property_name: string;
    property_type: string;
    status: string;
    rent_min: string;
    rent_max: string;
    total_views: number;
    total_enquiries: number;
    website_slug: string | null;
    description: string;
    amenities: string[];
    photos: string[];
}

interface ListingStats {
    listed: number;
    unlisted: number;
    draft: number;
    total_views: number;
    total_enquiries: number;
}

const statusBadge = (s: string) => {
    const map: Record<string, string> = { listed: 'badge-success', unlisted: 'badge-danger', draft: 'badge-warning' };
    return map[s] || 'badge-neutral';
};

export default function ListingsPage() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [stats, setStats] = useState<ListingStats>({ listed: 0, unlisted: 0, draft: 0, total_views: 0, total_enquiries: 0 });
    const [loading, setLoading] = useState(true);
    const [autoCreating, setAutoCreating] = useState(false);

    const fetchData = () => {
        setLoading(true);
        Promise.all([
            api.get('/listings/'),
            api.get('/listings/stats/'),
        ])
            .then(([listingsRes, statsRes]) => {
                setListings(listingsRes.data.results || listingsRes.data || []);
                setStats(statsRes.data);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, []);

    const handleToggleStatus = (id: string) => {
        api.post(`/listings/${id}/toggle-status/`)
            .then(() => fetchData())
            .catch(() => { });
    };

    const handleAutoCreate = () => {
        setAutoCreating(true);
        api.post('/listings/auto-create/')
            .then(() => fetchData())
            .catch(() => { })
            .finally(() => setAutoCreating(false));
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Listings</h1>
                    <p className="subtitle">{listings.length} listings • {stats.listed} live</p>
                </div>
                <button className="btn btn-primary" onClick={handleAutoCreate} disabled={autoCreating}>
                    <RefreshCw size={16} className={autoCreating ? 'spinning' : ''} /> {autoCreating ? 'Creating...' : 'Auto-Create Listings'}
                </button>
            </div>

            <div className="stats-grid" style={{ marginBottom: 16 }}>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--accent-success)' }}>{stats.listed}</div>
                    <div className="stat-label">Listed</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--accent-danger)' }}>{stats.unlisted}</div>
                    <div className="stat-label">Unlisted</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--accent-warning)' }}>{stats.draft}</div>
                    <div className="stat-label">Draft</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.total_views}</div>
                    <div className="stat-label">Total Views</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.total_enquiries}</div>
                    <div className="stat-label">Total Enquiries</div>
                </div>
            </div>

            {loading ? (
                <div className="page-loading"><div className="spinner"></div></div>
            ) : listings.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <Globe size={48} />
                        <h3>No Listings</h3>
                        <p>Create listings to showcase your properties online.</p>
                        <button className="btn btn-primary" onClick={handleAutoCreate} disabled={autoCreating} style={{ marginTop: 12 }}>
                            <RefreshCw size={16} /> Create Listings
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid-2">
                    {listings.map(l => (
                        <div className="card" key={l.id}>
                            <div style={{
                                height: 120, borderRadius: 'var(--radius-sm)', marginBottom: 12,
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                            }}>
                                <Building2 size={36} />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <strong style={{ flex: 1 }}>{l.property_name}</strong>
                                <span className={`badge ${statusBadge(l.status)}`}>{l.status}</span>
                            </div>

                            {l.property_type && (
                                <span className="badge badge-neutral" style={{ marginBottom: 8, display: 'inline-block' }}>
                                    {l.property_type}
                                </span>
                            )}

                            {(l.rent_min || l.rent_max) && (
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 8 }}>
                                    ₹{Number(l.rent_min || 0).toLocaleString('en-IN')} – ₹{Number(l.rent_max || 0).toLocaleString('en-IN')}/mo
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                                <span><Eye size={12} style={{ verticalAlign: 'middle' }} /> {l.total_views} views</span>
                                <span>{l.total_enquiries} enquiries</span>
                            </div>

                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn" style={{ fontSize: '0.8rem' }}
                                    onClick={() => handleToggleStatus(l.id)}>
                                    {l.status === 'listed'
                                        ? <><EyeOff size={14} /> Unlist</>
                                        : <><Eye size={14} /> List</>}
                                </button>
                                {l.website_slug && (
                                    <a className="btn" style={{ fontSize: '0.8rem', textDecoration: 'none' }}
                                        href={`/listing/${l.website_slug}`} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink size={14} /> View Website
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
