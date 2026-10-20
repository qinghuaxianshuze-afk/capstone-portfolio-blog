// src/pages/ContactPage.jsx - dedicated /contact page (spec Phase 8).
// Posts to the spec-named endpoint POST /api/contact.
import { useState } from 'react';
import { api } from '../api';

function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      await api('/api/contact', { method: 'POST', body: form });
      setResult({ ok: true, text: 'Message sent! I will reply soon.' });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setResult({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="section page-pad">
      <h2>Contact Me</h2>
      <p className="muted">Have a question, a project idea, or just want to say hello?</p>
      <form className="contact-form" onSubmit={onSubmit}>
        <input name="name" placeholder="Your name" value={form.name} onChange={onChange} required />
        <input name="email" type="email" placeholder="Your email" value={form.email} onChange={onChange} required />
        <input name="subject" placeholder="Subject" value={form.subject} onChange={onChange} />
        <textarea name="message" placeholder="Message" rows="5" value={form.message} onChange={onChange} required />
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Sending...' : 'Send Message'}</button>
        {result && <p className={result.ok ? 'ok-text' : 'error-text'}>{result.text}</p>}
      </form>
    </section>
  );
}

export default ContactPage;
