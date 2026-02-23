import { useState } from 'react';
import { X, Calendar, Building2 } from 'lucide-react';
import { usePropertyStore } from '../stores/propertyStore';
import { reportsApi } from '../lib/api';

interface ReportGenerateDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    reportId: string;
    reportTitle: string;
}

export default function ReportGenerateDrawer({ isOpen, onClose, reportId, reportTitle }: ReportGenerateDrawerProps) {
    const { properties } = usePropertyStore();
    const [dateRange, setDateRange] = useState('this_month');
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [selectAllProps, setSelectAllProps] = useState(true);
    const [selectedProps, setSelectedProps] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [message, setMessage] = useState('');

    const handleSelectProp = (id: string) => {
        setSelectAllProps(false);
        if (selectedProps.includes(id)) {
            setSelectedProps(selectedProps.filter(p => p !== id));
        } else {
            setSelectedProps([...selectedProps, id]);
        }
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        setMessage('');

        // Placeholder for the "Coming Soon" reports
        if (reportId !== 'all_tenant_ledger' && reportId !== 'collection') {
            setTimeout(() => {
                setMessage("This report is currently under development.");
                setIsGenerating(false);
            }, 800);
            return;
        }

        try {
            const res = await reportsApi.generate({
                report_type: reportId,
                date_range: dateRange,
                date_from: customFrom,
                date_to: customTo,
                property_ids: selectAllProps ? [] : selectedProps
            });
            setMessage("Report generated successfully! Starting download...");

            // Auto-trigger download
            if (res.data?.file_url) {
                const fileUrl = res.data.file_url;
                const url = fileUrl.startsWith('http') ? fileUrl : `http://localhost:8001${fileUrl}`;
                window.open(url, '_blank');
            }
        } catch (error) {
            setMessage("Error generating report.");
        } finally {
            setIsGenerating(false);
            // Optionally close drawer after a few seconds
            setTimeout(() => {
                if (!message.includes('Error')) onClose();
            }, 3000);
        }
    };

    if (!isOpen) return null;

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
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Generate {reportTitle}</h2>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

                    <div className="card" style={{ marginBottom: 20 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Select Date Range</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                            {['today', 'yesterday', 'this_month', 'last_7_days', 'custom'].map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setDateRange(opt)}
                                    style={{
                                        padding: '10px',
                                        border: `1px solid ${dateRange === opt ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                        background: dateRange === opt ? 'var(--accent-primary-glow)' : 'transparent',
                                        color: dateRange === opt ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        fontSize: '0.85rem',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {opt.replace(/_/g, ' ')}
                                </button>
                            ))}
                        </div>

                        {dateRange === 'custom' && (
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Start Date</label>
                                    <div style={{ position: 'relative' }}>
                                        <Calendar size={16} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
                                        <input type="date" className="form-input" style={{ paddingLeft: 34 }} value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date</label>
                                    <div style={{ position: 'relative' }}>
                                        <Calendar size={16} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
                                        <input type="date" className="form-input" style={{ paddingLeft: 34 }} value={customTo} onChange={e => setCustomTo(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>Select Properties</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px', border: '1px solid var(--border-primary)', borderRadius: 6, background: 'var(--bg-secondary)' }}>
                                <input
                                    type="checkbox"
                                    checked={selectAllProps}
                                    onChange={(e) => {
                                        setSelectAllProps(e.target.checked);
                                        if (e.target.checked) setSelectedProps([]);
                                    }}
                                />
                                <Building2 size={16} className="text-muted" />
                                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Select All Properties</span>
                            </label>

                            <div style={{ paddingLeft: 10, display: 'flex', flexDirection: 'column', gap: 10, borderLeft: '2px solid var(--border-primary)', marginLeft: 8 }}>
                                {properties.map(p => (
                                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedProps.includes(p.id)}
                                            onChange={() => handleSelectProp(p.id)}
                                            disabled={selectAllProps}
                                        />
                                        <span style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {message && (
                        <div style={{
                            padding: 16,
                            marginTop: 20,
                            borderRadius: 6,
                            background: message.includes('successfully') ? 'rgba(22, 163, 74, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: message.includes('successfully') ? '#22c55e' : '#ef4444',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            textAlign: 'center'
                        }}>
                            {message}
                        </div>
                    )}
                </div>

                <div style={{
                    padding: '20px 24px',
                    borderTop: '1px solid var(--border-primary)',
                    background: 'var(--bg-primary)'
                }}>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
                    >
                        {isGenerating ? 'Generating...' : 'Generate Report'}
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 12 }}>
                        Report generation may take up to 60 seconds.
                    </p>
                </div>
            </div>
        </div>
    );
}
