import { useEffect, useState } from 'react';
import { MessageCircle, Send, Users, CalendarCheck, Phone, MapPin, CreditCard } from 'lucide-react';
import { usePropertyStore } from '../stores/propertyStore';
import api from '../lib/api';

interface WhatsAppMessage {
    id: string;
    phone: string;
    tenant?: { name: string };
    template_name: string;
    message_body: string;
    status: string;
    sent_at: string | null;
    created_at: string;
}

type Tab = 'tenants' | 'bookings';

export default function WhatsAppPage() {
    const [activeTab, setActiveTab] = useState<Tab>('tenants');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState('');
    const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const { selectedPropertyId } = usePropertyStore();

    useEffect(() => {
        if (!selectedPropertyId) { setLoading(false); return; }
        api.get(`/properties/${selectedPropertyId}/whatsapp/`)
            .then(res => setMessages(res.data.results || res.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [selectedPropertyId]);

    const handleBulkReminder = async () => {
        if (!selectedPropertyId) return;
        setSending(true);
        try {
            await api.post(`/properties/${selectedPropertyId}/whatsapp/send-bulk/`, {
                template: 'payment_reminder',
                target: activeTab,
            });
            setResult('Reminders queued successfully!');
        } catch {
            setResult('Failed to send reminders');
        }
        setSending(false);
    };

    const handleSendCustom = async () => {
        if (!selectedPropertyId || !message.trim()) return;
        setSending(true);
        try {
            await api.post(`/properties/${selectedPropertyId}/whatsapp/`, {
                message_body: message,
                phone: 'bulk',
                template_name: 'custom',
            });
            setResult('Message queued!');
            setMessage('');
        } catch {
            setResult('Failed to send message');
        }
        setSending(false);
    };

    const statusColor = (s: string) => {
        const map: Record<string, string> = { sent: 'var(--accent-success)', delivered: 'var(--accent-info)', read: 'var(--accent-primary)', failed: 'var(--accent-danger)', queued: 'var(--accent-warning)' };
        return map[s] || 'var(--text-muted)';
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>WhatsApp</h1>
                    <p className="subtitle">Send messages & payment reminders</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {[
                    { key: 'tenants' as Tab, label: 'Tenants', icon: Users },
                    { key: 'bookings' as Tab, label: 'Bookings', icon: CalendarCheck },
                ].map(tab => (
                    <button
                        key={tab.key}
                        className={`btn ${activeTab === tab.key ? 'btn-primary' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                        style={activeTab !== tab.key ? { background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' } : {}}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
                <div className="stat-card" style={{ '--stat-color': '#25D366' } as any}>
                    <div className="label">Bulk Reminder</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        Send to all {activeTab === 'tenants' ? 'tenants with dues' : 'upcoming bookings'}
                    </div>
                    <button className="btn btn-primary" onClick={handleBulkReminder} disabled={sending} style={{ marginTop: 10, background: '#25D366', fontSize: '0.8rem' }}>
                        <Send size={14} /> {sending ? 'Sending...' : 'Send Reminders'}
                    </button>
                </div>
                <div className="stat-card" style={{ '--stat-color': 'var(--accent-info)' } as any} onClick={() => {}}>
                    <div className="label"><Phone size={14} /> Share Location</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        Share property location via WhatsApp
                    </div>
                </div>
                <div className="stat-card" style={{ '--stat-color': 'var(--accent-warning)' } as any}>
                    <div className="label"><MapPin size={14} /> Follow Up</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        One-click follow up on WhatsApp
                    </div>
                </div>
                <div className="stat-card" style={{ '--stat-color': 'var(--accent-success)' } as any}>
                    <div className="label"><CreditCard size={14} /> Payment Link</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                        Send payment link with QR code
                    </div>
                </div>
            </div>

            {result && (
                <div style={{ padding: '10px 16px', background: 'var(--bg-tertiary)', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem', color: 'var(--accent-success)' }}>
                    {result}
                </div>
            )}

            <div className="grid-2">
                <div className="card">
                    <div className="card-header"><div className="card-title">Quick Message</div></div>
                    <div className="form-group">
                        <label className="form-label">Message Template</label>
                        <textarea
                            className="form-textarea"
                            rows={4}
                            placeholder={activeTab === 'tenants'
                                ? "Hi {tenant_name}, your rent of ₹{amount} is due on {due_date}. Please pay at the earliest."
                                : "Hi {name}, your booking at {property_name} is confirmed for {move_in_date}. Welcome!"}
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={handleSendCustom} disabled={sending || !message.trim()} style={{ background: '#25D366' }}>
                        <Send size={16} /> Send Custom Message
                    </button>
                </div>

                <div className="card">
                    <div className="card-header"><div className="card-title">Message Templates</div></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                            { name: 'Payment Reminder', desc: 'Remind tenants about pending dues' },
                            { name: 'Welcome Message', desc: 'Send welcome message to new tenants' },
                            { name: 'Notice Period', desc: 'Notify about notice period start' },
                            { name: 'Rent Receipt', desc: 'Share payment receipt confirmation' },
                            { name: 'Maintenance Update', desc: 'Update on complaint resolution' },
                        ].map(t => (
                            <div key={t.name} style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8, cursor: 'pointer' }}
                                onClick={() => setMessage(`[${t.name}] `)}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: 20 }}>
                <div className="card-header"><div className="card-title">Message History</div></div>
                {loading ? (
                    <div className="page-loading"><div className="spinner"></div></div>
                ) : messages.length === 0 ? (
                    <div className="empty-state">
                        <MessageCircle size={48} />
                        <h3>No Messages Yet</h3>
                        <p>Sent messages will appear here</p>
                    </div>
                ) : (
                    <div style={{ padding: 0, overflow: 'hidden' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Phone</th>
                                    <th>Template</th>
                                    <th>Message</th>
                                    <th>Status</th>
                                    <th>Sent At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.map(m => (
                                    <tr key={m.id}>
                                        <td>{m.phone}</td>
                                        <td><span className="badge">{m.template_name || 'Custom'}</span></td>
                                        <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.message_body}</td>
                                        <td><span className="badge" style={{ background: statusColor(m.status), color: '#fff' }}>{m.status}</span></td>
                                        <td>{m.sent_at ? new Date(m.sent_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
