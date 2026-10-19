// src/pages/Home.jsx - hero + live projects + live skills (all from the API).
import { useEffect, useState } from 'react';
import { api } from '../api';
import ProjectCard from '../components/ProjectCard';

function Home() {
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: false });

  useEffect(() => {
    // Fetch BOTH resources in parallel; either failure flips to error state.
    Promise.all([api('/api/projects'), api('/api/skills')])
      .then(([p, s]) => {
        setProjects(p.data);
        setSkills(s.data);
      })
      .catch(() => setStatus((st) => ({ ...st, error: true })))
      .finally(() => setStatus({ loading: false, error: false }));
  }, []);

  return (
    <>
      <header className="hero">
        <p className="hero-kicker">Computer Science @ Shenyang Normal University</p>
        <h1>Hi, I am <span className="accent">Xianshu Ze</span></h1>
        <p className="hero-sub">
          Student developer who builds tools that automate the boring parts of life -
          replay generators, desktop pets, appointment grabbers.
        </p>
        <a href="#projects" className="btn btn-primary">See My Projects</a>
      </header>

      <section id="projects" className="section">
        <h2>Projects ({projects.length} live from the API)</h2>
        {status.loading && <p className="muted">Loading projects...</p>}
        {status.error && <p className="error-text">Failed to load projects from the server.</p>}
        <div className="projects-grid">
          {projects.map((p) => (
            <ProjectCard
              key={p._id}
              title={p.title}
              description={p.description}
              tags={p.tags}
              featured={p.featured}
              liveUrl={p.liveUrl}
              repoUrl={p.repoUrl}
            />
          ))}
        </div>
      </section>

      <section id="skills" className="section">
        <h2>Skills</h2>
        <div className="skills-grid">
          {skills.map((s) => (
            <div key={s._id} className="skill-chip">
              {s.name}
              <span className={`skill-level ${s.level}`}>{s.level}</span>
            </div>
          ))}
        </div>
      </section>

      <ContactForm />
    </>
  );
}

// Contact form -> POST /api/messages (public endpoint, no login needed)
function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      await api('/api/messages', { method: 'POST', body: form });
      setResult({ ok: true, text: 'Message sent! I will reply soon.' });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setResult({ ok: false, text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="contact" className="section">
      <h2>Contact Me</h2>
      <form className="contact-form" onSubmit={onSubmit}>
        <input name="name" placeholder="Your name" value={form.name} onChange={onChange} required />
        <input name="email" type="email" placeholder="Your email" value={form.email} onChange={onChange} required />
        <input name="subject" placeholder="Subject" value={form.subject} onChange={onChange} />
        <textarea name="message" placeholder="Message" rows="5" value={form.message} onChange={onChange} required />
        <button className="btn btn-primary" disabled={busy}>
          {busy ? 'Sending...' : 'Send Message'}
        </button>
        {result && <p className={result.ok ? 'ok-text' : 'error-text'}>{result.text}</p>}
      </form>
    </section>
  );
}

export default Home;
