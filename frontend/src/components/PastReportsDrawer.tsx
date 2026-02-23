import { useState, useEffect } from 'react';
import { X, FileDown, Clock, Search } from 'lucide-react';
import { reportsApi } from '../lib/api';

interface PastReportsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    reportId: string;
    reportTitle: string;
}

export default function PastReportsDrawer({ isOpen, onClose, reportId, reportTitle }: PastReportsDrawerProps) {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isOpen && reportId) {
            fetchReports();
        }
    }, [isOpen, reportId]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await reportsApi.getPastReports(reportId);
            // In a real scenario, this would return an array from the backend
            // Defaulting to empty array if backend not yet ready
            setReports(res.data?.results || res.data || []);
        } catch (error) {
            setReports([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (fileUrl: string) => {
        // Construct full URL if relative
        const url = fileUrl.startsWith('http') ? fileUrl : `http://localhost:8001${fileUrl}`;
        window.open(url, '_blank');
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isOpen) return null;

    const filteredReports = reports.filter(r =>
        formatDate(r.created_at).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'flex-end'
        }}>
            <div style={{
                width: '450px',
                backgroundColor: 'var(--bg-primary)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
                animation: 'slideInRight 0.3s ease'
            }}>
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--border-primary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg-secondary)'
                }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Reports List</h2>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-primary)' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Search by date..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: 36 }}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: 'var(--bg-secondary)' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                            <div className="spinner"></div>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 60 }}>
                            <Clock size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>No Reports Found</h3>
                            <p style={{ fontSize: '0.85rem' }}>No past reports have been generated for {reportTitle} yet.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {filteredReports.map(report => (
                                <div key={report.id} className="card" style={{ padding: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div>
                                            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>{reportTitle.replace('Report', '').trim()}</h4>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Clock size={12} />
                                                Generated on {formatDate(report.created_at)}
                                            </div>
                                            {report.property_name && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                                    <strong>Property:</strong> {report.property_name}
                                                </div>
                                            )}
                                        </div>
                                        <span className={`badge badge-${report.status === 'completed' ? 'success' : report.status === 'failed' ? 'error' : 'warning'}`}>
                                            {report.status}
                                        </span>
                                    </div>

                                    <button
                                        className="btn btn-outline"
                                        style={{ width: '100%', justifyContent: 'center', padding: '8px', gap: 8 }}
                                        onClick={() => handleDownload(report.file)}
                                        disabled={report.status !== 'completed'}
                                    >
                                        <FileDown size={16} style={{ color: 'var(--accent-success)' }} />
                                        <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>
                                            Download {report.file.endsWith('.pdf') ? 'PDF' : 'Excel'} Report
                                        </span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
