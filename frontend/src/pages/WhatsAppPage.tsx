import { useState } from 'react';
import { MessageCircle, Send, Users } from 'lucide-react';
import { usePropertyStore } from '../stores/propertyStore';
import api from '../lib/api';

export default function WhatsAppPage() {
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState('');
    const { selectedPropertyId } = usePropertyStore();

    const handleBulkReminder = async () => {
        if (!selectedPropertyId) return;
        setSending(true);
        try {
            const res = await api.post(`/properties/${selectedPropertyId}/whatsapp/bulk-reminder/`);
            setResult(`Sent ${res.data.sent_count || 0} reminders`);
        } catch {
            setResult('Failed to send reminders');
        }
        setSending(false);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div><h1>WhatsApp</h1><p className="subtitle">Send messages & payment reminders</p></div>
            </div>

            <div className="grid-2">
                <div className="card">
                    <div className="card-header"><div className="card-title">Bulk Payment Reminder</div></div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                        Send payment reminders to all tenants with unpaid dues via WhatsApp.
                    </p>
                    <button className="btn btn-primary" onClick={handleBulkReminder} disabled={sending}>
                        <Users size={16} /> {sending ? 'Sending...' : 'Send to All Defaulters'}
                    </button>
                    {result && <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--accent-success)' }}>{result}</p>}
                </div>

                <div className="card">
                    <div className="card-header"><div className="card-title">Quick Message</div></div>
                    <div className="form-group">
                        <label className="form-label">Message Template</label>
                        <textarea
                            className="form-textarea"
                            rows={4}
                            placeholder="Hi {tenant_name}, your rent of ₹{amount} is due on {due_date}. Please pay at the earliest."
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" disabled>
                        <Send size={16} /> Send Custom Message
                    </button>
                </div>
            </div>

            <div className="card" style={{ marginTop: 20 }}>
                <div className="empty-state">
                    <MessageCircle size={48} />
                    <h3>Message History</h3>
                    <p>Sent messages will appear here</p>
                </div>
            </div>
        </div>
    );
}
