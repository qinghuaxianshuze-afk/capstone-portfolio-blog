// src/pages/Login.jsx - email/password -> JWT via AuthContext.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message); // "Invalid email or password" (generic 401)
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="section page-pad auth-page">
      <h2>Sign In</h2>
      <form className="auth-form" onSubmit={onSubmit}>
        <input type="email" placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Signing in...' : 'Login'}</button>
        {error && <p className="error-text">{error}</p>}
      </form>
    </section>
  );
}

export default Login;
