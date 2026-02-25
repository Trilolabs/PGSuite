import { useEffect, useState } from 'react';
import { Star, Plus, MessageSquare, Send } from 'lucide-react';
import { usePropertyStore } from '../stores/propertyStore';
import api from '../lib/api';

interface Review {
    id: string;
    tenant_name: string;
    category: string;
    rating: number;
    comment: string;
    admin_response: string | null;
    is_published: boolean;
    created_at: string;
}

interface ReviewSummary {
    average_rating: number;
    total_reviews: number;
    published: number;
    unpublished: number;
}

const categoryBadge = (c: string) => {
    const map: Record<string, string> = {
        cleanliness: 'badge-info', food: 'badge-warning',
        maintenance: 'badge-danger', staff: 'badge-success',
        amenities: 'badge-neutral', overall: 'badge-info',
    };
    return map[c] || 'badge-neutral';
};

const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (i < rating ? '★' : '☆')).join('');

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [summary, setSummary] = useState<ReviewSummary>({ average_rating: 0, total_reviews: 0, published: 0, unpublished: 0 });
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('');
    const [filterRating, setFilterRating] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [respondingTo, setRespondingTo] = useState<string | null>(null);
    const [responseText, setResponseText] = useState('');
    const [newReview, setNewReview] = useState({ tenant_name: '', category: 'overall', rating: 5, comment: '' });
    const { selectedPropertyId } = usePropertyStore();

    const fetchData = () => {
        if (!selectedPropertyId) { setLoading(false); return; }
        setLoading(true);
        Promise.all([
            api.get(`/maintenance/properties/${selectedPropertyId}/reviews/`),
            api.get(`/maintenance/properties/${selectedPropertyId}/reviews/summary/`),
        ])
            .then(([reviewsRes, summaryRes]) => {
                setReviews(reviewsRes.data.results || reviewsRes.data || []);
                setSummary(summaryRes.data);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchData(); }, [selectedPropertyId]);

    const handleAddReview = () => {
        if (!selectedPropertyId) return;
        api.post(`/maintenance/properties/${selectedPropertyId}/reviews/`, newReview)
            .then(() => {
                setShowAddForm(false);
                setNewReview({ tenant_name: '', category: 'overall', rating: 5, comment: '' });
                fetchData();
            })
            .catch(() => { });
    };

    const handleRespond = (id: string) => {
        if (!selectedPropertyId || !responseText.trim()) return;
        api.post(`/maintenance/properties/${selectedPropertyId}/reviews/${id}/respond/`, { response: responseText })
            .then(() => {
                setRespondingTo(null);
                setResponseText('');
                fetchData();
            })
            .catch(() => { });
    };

    const filtered = reviews.filter(r => {
        if (filterCategory && r.category !== filterCategory) return false;
        if (filterRating && r.rating !== Number(filterRating)) return false;
        return true;
    });

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Reviews</h1>
                    <p className="subtitle">{summary.total_reviews} reviews • {summary.average_rating.toFixed(1)} avg rating</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                    <Plus size={16} /> Add Review
                </button>
            </div>

            <div className="stats-grid" style={{ marginBottom: 16 }}>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--accent-warning)' }}>
                        {summary.average_rating.toFixed(1)} ★
                    </div>
                    <div className="stat-label">Average Rating</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{summary.total_reviews}</div>
                    <div className="stat-label">Total Reviews</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--accent-success)' }}>{summary.published}</div>
                    <div className="stat-label">Published</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value" style={{ color: 'var(--accent-danger)' }}>{summary.unpublished}</div>
                    <div className="stat-label">Unpublished</div>
                </div>
            </div>

            {showAddForm && (
                <div className="card" style={{ marginBottom: 16 }}>
                    <h3 style={{ marginBottom: 12 }}>Add Review</h3>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Tenant Name</label>
                            <input className="form-input" value={newReview.tenant_name}
                                onChange={e => setNewReview({ ...newReview, tenant_name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-select" value={newReview.category}
                                onChange={e => setNewReview({ ...newReview, category: e.target.value })}>
                                <option value="overall">Overall</option>
                                <option value="cleanliness">Cleanliness</option>
                                <option value="food">Food</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="staff">Staff</option>
                                <option value="amenities">Amenities</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Rating</label>
                            <select className="form-select" value={newReview.rating}
                                onChange={e => setNewReview({ ...newReview, rating: Number(e.target.value) })}>
                                {[5, 4, 3, 2, 1].map(r => (
                                    <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-group" style={{ marginTop: 8 }}>
                        <label className="form-label">Comment</label>
                        <textarea className="form-textarea" rows={3} value={newReview.comment}
                            onChange={e => setNewReview({ ...newReview, comment: e.target.value })} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button className="btn btn-primary" onClick={handleAddReview}>Submit Review</button>
                        <button className="btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <select className="form-select" style={{ width: 'auto' }} value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    <option value="overall">Overall</option>
                    <option value="cleanliness">Cleanliness</option>
                    <option value="food">Food</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="staff">Staff</option>
                    <option value="amenities">Amenities</option>
                </select>
                <select className="form-select" style={{ width: 'auto' }} value={filterRating}
                    onChange={e => setFilterRating(e.target.value)}>
                    <option value="">All Ratings</option>
                    {[5, 4, 3, 2, 1].map(r => (
                        <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="page-loading"><div className="spinner"></div></div>
            ) : filtered.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <Star size={48} />
                        <h3>No Reviews</h3>
                        <p>No reviews found for this property.</p>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                    {filtered.map(r => (
                        <div className="card" key={r.id}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                                    background: r.rating >= 4 ? 'var(--accent-success-bg)' : r.rating >= 3 ? 'var(--accent-warning-bg)' : 'var(--accent-danger-bg)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                    fontSize: '1rem', fontWeight: 700,
                                    color: r.rating >= 4 ? 'var(--accent-success)' : r.rating >= 3 ? 'var(--accent-warning)' : 'var(--accent-danger)',
                                }}>
                                    {r.rating}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                        <strong>{r.tenant_name}</strong>
                                        <span className={`badge ${categoryBadge(r.category)}`}>{r.category}</span>
                                        <span style={{ color: 'var(--accent-warning)', fontSize: '0.85rem' }}>{renderStars(r.rating)}</span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>{r.comment}</p>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>

                                    {r.admin_response && (
                                        <div style={{
                                            marginTop: 10, padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                                            background: 'var(--bg-secondary)', fontSize: '0.8rem',
                                        }}>
                                            <strong style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admin Response:</strong>
                                            <p style={{ marginTop: 2 }}>{r.admin_response}</p>
                                        </div>
                                    )}

                                    {respondingTo === r.id ? (
                                        <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                                            <textarea className="form-textarea" rows={2} style={{ flex: 1 }}
                                                value={responseText} onChange={e => setResponseText(e.target.value)}
                                                placeholder="Write your response..." />
                                            <button className="btn btn-primary" onClick={() => handleRespond(r.id)}
                                                style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Send size={14} /> Send
                                            </button>
                                            <button className="btn" onClick={() => { setRespondingTo(null); setResponseText(''); }}>
                                                Cancel
                                            </button>
                                        </div>
                                    ) : !r.admin_response && (
                                        <button className="btn" style={{ marginTop: 8, fontSize: '0.8rem' }}
                                            onClick={() => { setRespondingTo(r.id); setResponseText(''); }}>
                                            <MessageSquare size={14} /> Respond
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
