// src/pages/Register.jsx - create an account (spec Phase 8: /register route).
// Successful registration logs the user straight in (the API returns a JWT).
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form.username, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="section page-pad auth-page">
      <h2>Create Account</h2>
      <form className="auth-form" onSubmit={onSubmit}>
        <input name="username" placeholder="Username" value={form.username} onChange={onChange} required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
        <input name="password" type="password" placeholder="Password (min 8 characters)" value={form.password} onChange={onChange} required minLength={8} />
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Creating...' : 'Register'}</button>
        {error && <p className="error-text">{error}</p>}
        <p className="muted">Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </section>
  );
}

export default Register;
