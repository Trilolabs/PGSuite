import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function RegisterPage() {
    const [form, setForm] = useState({
        name: '', email: '', phone: '', password: '', confirm_password: '',
    });
    const { register, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(form);
            navigate('/dashboard');
        } catch { }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="logo-icon">PG</div>
                    <h1>PG <span>Manager</span></h1>
                </div>
                <div className="auth-title">
                    <h2>Create your account</h2>
                    <p>Start managing your PG properties</p>
                </div>
                {error && <div className="auth-error" onClick={clearError}>{error}</div>}
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-input" placeholder="John Doe" value={form.name} onChange={set('name')} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input className="form-input" type="tel" placeholder="+91 9876543210" value={form.phone} onChange={set('phone')} />
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input className="form-input" type="password" placeholder="Min 8 chars" value={form.password} onChange={set('password')} required />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm</label>
                            <input className="form-input" type="password" placeholder="Re-enter" value={form.confirm_password} onChange={set('confirm_password')} required />
                        </div>
                    </div>
                    <button className="btn btn-primary" type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Account'}
                    </button>
                </form>
                <div className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></div>
            </div>
        </div>
    );
}
