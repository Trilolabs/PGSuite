import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { UserPlus, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { tenantApi, roomApi, duesPackageApi } from '../lib/api';
import { usePropertyStore } from '../stores/propertyStore';

const STEPS = ['Personal Details', 'Stay Details', 'Rent & Payment', 'KYC & Documents'];

interface Room {
    id: string;
    number: string;
    type: string;
    floor_name: string;
    beds: { id: string; label: string; status: string }[];
}

function calcOpeningBalance(rent: number, deposit: number, moveIn: string) {
    if (!moveIn || rent <= 0) return [];
    const d = new Date(moveIn);
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const daysStaying = lastDay - day + 1;
    const monthName = d.toLocaleDateString('en-IN', { month: 'short' });
    const proratedRent = Math.round((rent / lastDay) * daysStaying);

    const nextMonth = new Date(year, month + 1, 1);
    const nextMonthName = nextMonth.toLocaleDateString('en-IN', { month: 'short' });
    const nextLastDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate();

    const items = [];
    if (deposit > 0) items.push({ type: 'Security Deposit', amount: deposit, desc: 'Security Deposit - added by Owner' });
    if (proratedRent > 0) items.push({ type: `Rent for ${monthName}`, amount: proratedRent, desc: `Due from ${day} ${monthName} to ${lastDay} ${monthName}. Duration: ${daysStaying} Days.` });
    items.push({ type: `Rent for ${nextMonthName}`, amount: rent, desc: `Due from 01 ${nextMonthName} to ${nextLastDay} ${nextMonthName}. Duration: ${nextLastDay} Days.` });

    return items;
}

export default function AddTenantPage() {
    const [step, setStep] = useState(0);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [createdTenantId, setCreatedTenantId] = useState('');
    const { selectedPropertyId } = usePropertyStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const isBooking = location.state?.isBooking;
    const preselectedRoomId = searchParams.get('room') || '';

    const [form, setForm] = useState({
        name: '', phone: '', email: '', gender: 'male',
        tenant_type: 'student', dob: '',
        father_name: '', father_phone: '', mother_name: '', mother_phone: '',
        permanent_address: '', emergency_contact: '',
        room: '', bed_id: '',
        move_in: isBooking
            ? new Date(Date.now() + 86400000).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        rent: '', deposit: '', rent_start_date: '1',
        payment_mode: 'cash', agreement_period: '11',
        lock_in_period: '3', stay_type: 'long_stay',
        aadhar_number: '', pan_number: '',
        id_proof_type: 'aadhar', id_proof_number: '',
    });

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(f => ({ ...f, [key]: e.target.value }));

    useEffect(() => {
        if (selectedPropertyId) {
            // Fetch Rooms for dropdown
            roomApi.list(selectedPropertyId)
                .then(res => {
                    const fetchedRooms = res.data.results || res.data || [];
                    setRooms(fetchedRooms);
                    // Pre-fill room if coming from Rooms page with ?room=ID
                    if (preselectedRoomId && fetchedRooms.some((r: Room) => r.id === preselectedRoomId)) {
                        setForm(f => ({ ...f, room: preselectedRoomId }));
                    }
                })
                .catch(() => { });

            // Fetch Dues Packages to auto-populate Security Deposit
            duesPackageApi.list(selectedPropertyId)
                .then(res => {
                    const packages = res.data.results || res.data || [];
                    const depositPkg = packages.find((p: any) => p.name === 'Security Deposit');
                    if (depositPkg) {
                        setForm(f => ({
                            ...f,
                            deposit: (depositPkg.is_active && depositPkg.type === 'fixed' && Number(depositPkg.default_amount) > 0)
                                ? String(depositPkg.default_amount)
                                : ''
                        }));
                    }
                })
                .catch(() => { });
        }
    }, [selectedPropertyId]);

    const vacantBeds = rooms
        .filter(r => r.id === form.room)
        .flatMap(r => r.beds?.filter(b => b.status === 'vacant') || []);

    const openingBalance = calcOpeningBalance(Number(form.rent) || 0, Number(form.deposit) || 0, form.move_in);
    const totalOpening = openingBalance.reduce((s, i) => s + i.amount, 0);

    const handleSubmit = async () => {
        if (!selectedPropertyId) return;
        setSubmitting(true);
        setError('');
        try {
            const payload: any = {
                ...form,
                rent: Number(form.rent) || 0,
                deposit: Number(form.deposit) || 0,
                rent_start_date: Number(form.rent_start_date) || 1,
                lock_in_period: Number(form.lock_in_period) || 0,
                agreement_period: Number(form.agreement_period) || 11,
            };
            // Remove empty optional fields to avoid backend validation errors
            if (!payload.dob) delete payload.dob;
            if (!payload.bed_id) delete payload.bed_id;
            if (!payload.room) delete payload.room;
            const res = await tenantApi.create(selectedPropertyId, payload);
            setCreatedTenantId(res.data.id);
            setShowSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || JSON.stringify(err.response?.data) || 'Failed to add tenant');
        } finally {
            setSubmitting(false);
        }
    };

    // Success Modal
    if (showSuccess) {
        return (
            <div style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            }}>
                <div style={{
                    background: 'var(--bg-card)', borderRadius: 16, padding: 40, textAlign: 'center',
                    maxWidth: 420, width: '90%', border: '1px solid var(--border-primary)',
                }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                    }}>
                        <Check size={32} style={{ color: '#22c55e' }} />
                    </div>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8 }}>Tenant Added Successfully!</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 8 }}>
                        <strong>{form.name}</strong> has been added to Room {rooms.find(r => r.id === form.room)?.number || '-'}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 24 }}>
                        {openingBalance.length} dues auto-generated totalling ₹{totalOpening.toLocaleString('en-IN')}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <button className="btn btn-secondary" onClick={() => navigate(`/tenants/${createdTenantId}`)}>
                            View Profile
                        </button>
                        <button className="btn btn-primary" onClick={() => navigate(`/tenants/${createdTenantId}`)}>
                            Check Added Dues ↗
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ maxWidth: 800 }}>
            <div className="page-header">
                <div>
                    <h1>Add Tenant</h1>
                    <p className="subtitle">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
                </div>
            </div>

            {/* Step Indicator */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
                {STEPS.map((s, i) => (
                    <div key={s} style={{
                        flex: 1, height: 4, borderRadius: 2,
                        background: i <= step ? 'var(--accent-primary)' : 'var(--border-color)',
                        transition: 'background 0.3s',
                    }} />
                ))}
            </div>

            {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

            <div className="card">
                {/* Step 1: Personal Details */}
                {step === 0 && (
                    <div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Full Name *</label>
                                <input className="form-input" placeholder="Tenant name" value={form.name} onChange={set('name')} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone *</label>
                                <input className="form-input" type="tel" placeholder="+91 9876543210" value={form.phone} onChange={set('phone')} required />
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input className="form-input" type="email" placeholder="tenant@email.com" value={form.email} onChange={set('email')} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date of Birth</label>
                                <input className="form-input" type="date" value={form.dob} onChange={set('dob')} />
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Gender</label>
                                <select className="form-select" value={form.gender} onChange={set('gender')}>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tenant Type</label>
                                <select className="form-select" value={form.tenant_type} onChange={set('tenant_type')}>
                                    <option value="student">Student</option>
                                    <option value="working">Working Professional</option>
                                    <option value="family">Family</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Father's Name</label>
                                <input className="form-input" placeholder="Father's name" value={form.father_name} onChange={set('father_name')} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Father's Phone</label>
                                <input className="form-input" type="tel" value={form.father_phone} onChange={set('father_phone')} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Permanent Address</label>
                            <textarea className="form-textarea" rows={3} placeholder="Full address" value={form.permanent_address} onChange={set('permanent_address') as any} />
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Emergency Contact</label>
                                <input className="form-input" value={form.emergency_contact} onChange={set('emergency_contact')} placeholder="Name and phone" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Stay Details */}
                {step === 1 && (
                    <div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Room *</label>
                                <select className="form-select" value={form.room} onChange={set('room')}>
                                    <option value="">Select Room</option>
                                    {rooms.filter(r => r.beds?.some(b => b.status === 'vacant')).map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.floor_name} → Room {r.number} ({r.type}) — {r.beds?.filter(b => b.status === 'vacant').length} bed(s) vacant
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Bed</label>
                                <select className="form-select" value={form.bed_id} onChange={set('bed_id')}>
                                    <option value="">Select Bed</option>
                                    {vacantBeds.map(b => (
                                        <option key={b.id} value={b.id}>Bed {b.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Move-in Date *</label>
                                <input className="form-input" type="date" value={form.move_in} onChange={set('move_in')} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Agreement Duration (months)</label>
                                <input className="form-input" type="number" value={form.agreement_period} onChange={set('agreement_period')} />
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Lock-in Period (months)</label>
                                <input className="form-input" type="number" value={form.lock_in_period} onChange={set('lock_in_period')} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Stay Type</label>
                                <select className="form-select" value={form.stay_type} onChange={set('stay_type')}>
                                    <option value="long_stay">Long Stay</option>
                                    <option value="short_stay">Short Stay</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Rent & Payment */}
                {step === 2 && (
                    <div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Monthly Rent (₹) *</label>
                                <input className="form-input" type="number" placeholder="8000" value={form.rent} onChange={set('rent')} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Security Deposit (₹)</label>
                                <input className="form-input" type="number" placeholder="16000" value={form.deposit} onChange={set('deposit')} />
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Rent Start Date (day of month)</label>
                                <input className="form-input" type="number" min="1" max="28" value={form.rent_start_date} onChange={set('rent_start_date')} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Payment Mode</label>
                                <select className="form-select" value={form.payment_mode} onChange={set('payment_mode')}>
                                    <option value="cash">Cash</option>
                                    <option value="upi">UPI</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="cheque">Cheque</option>
                                </select>
                            </div>
                        </div>

                        {/* Opening Balance Preview */}
                        {openingBalance.length > 0 && (
                            <div style={{ marginTop: 24 }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)' }}>
                                    📋 Opening Balance (Auto-generated Dues)
                                </h3>
                                <div style={{ border: '1px solid var(--border-primary)', borderRadius: 8, overflow: 'hidden' }}>
                                    <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: 'var(--bg-tertiary)' }}>
                                                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Type</th>
                                                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Description</th>
                                                <th style={{ padding: '10px 14px', textAlign: 'right' }}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {openingBalance.map((item, i) => (
                                                <tr key={i} style={{ borderTop: '1px solid var(--border-primary)' }}>
                                                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{item.type}</td>
                                                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{item.desc}</td>
                                                    <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>₹{item.amount.toLocaleString('en-IN')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr style={{ borderTop: '2px solid var(--border-primary)', background: 'var(--bg-tertiary)' }}>
                                                <td colSpan={2} style={{ padding: '10px 14px', fontWeight: 700 }}>Total Opening Balance</td>
                                                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#ef4444' }}>₹{totalOpening.toLocaleString('en-IN')}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8 }}>
                                    * These dues will be automatically created when you add the tenant
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 4: KYC */}
                {step === 3 && (
                    <div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Aadhar Number</label>
                                <input className="form-input" placeholder="1234 5678 9012" value={form.aadhar_number} onChange={set('aadhar_number')} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">PAN Number</label>
                                <input className="form-input" placeholder="ABCDE1234F" value={form.pan_number} onChange={set('pan_number')} />
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">ID Proof Type</label>
                                <select className="form-select" value={form.id_proof_type} onChange={set('id_proof_type')}>
                                    <option value="aadhar">Aadhar Card</option>
                                    <option value="passport">Passport</option>
                                    <option value="voter_id">Voter ID</option>
                                    <option value="driving_license">Driving License</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">ID Proof Number</label>
                                <input className="form-input" value={form.id_proof_number} onChange={set('id_proof_number')} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
                    <ChevronLeft size={16} /> Previous
                </button>
                {step < STEPS.length - 1 ? (
                    <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
                        Next <ChevronRight size={16} />
                    </button>
                ) : (
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                        <UserPlus size={16} /> {submitting ? 'Saving...' : 'Add Tenant'}
                    </button>
                )}
            </div>
        </div>
    );
}
