// src/pages/Admin.jsx - the secure admin dashboard.
// Only reachable by role=admin (ProtectedRoute guards the route itself;
// the API ALSO enforces admin-only writes - the UI is never the only gate).
import { useEffect, useState, useCallback } from 'react';
import { api, tokenStore } from '../api';
import { useAuth } from '../AuthContext';

function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState('projects');
  const T = () => tokenStore.get();

  return (
    <section className="section page-pad">
      <h2>Admin Dashboard</h2>
      <p className="muted">Signed in as {user?.username} ({user?.role}). All writes below hit admin-protected endpoints with your JWT.</p>
      <div className="filter-row">
        {['projects', 'posts', 'messages'].map((t) => (
          <button key={t} className={tab === t ? 'chip active' : 'chip'} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      {tab === 'projects' && <ProjectsTab token={T()} />}
      {tab === 'posts' && <PostsTab token={T()} />}
      {tab === 'messages' && <MessagesTab token={T()} />}
    </section>
  );
}

function ProjectsTab({ token }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', tags: '' });
  const refresh = useCallback(() => api('/api/projects').then((d) => setItems(d.data)), []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = async (e) => {
    e.preventDefault();
    await api('/api/projects', {
      method: 'POST', token,
      body: { ...form, tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean) },
    });
    setForm({ title: '', description: '', tags: '' });
    refresh();
  };

  const remove = async (id) => {
    await api(`/api/projects/${id}`, { method: 'DELETE', token });
    refresh();
  };

  return (
    <div className="admin-block">
      <h3>Projects</h3>
      <form className="admin-form" onSubmit={create}>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        <button className="btn btn-primary">Add Project</button>
      </form>
      <ul className="admin-list">
        {items.map((p) => (
          <li key={p._id}>
            {p.title} {p.featured && <span className="tag">featured</span>}
            <button className="btn btn-danger" onClick={() => remove(p._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PostsTab({ token }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', category: 'technology' });
  const refresh = useCallback(() => api('/api/posts').then((d) => setItems(d.data)), []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = async (e) => {
    e.preventDefault();
    await api('/api/posts', { method: 'POST', token, body: form });
    setForm({ title: '', content: '', category: 'technology' });
    refresh();
  };

  const remove = async (id) => {
    await api(`/api/posts/${id}`, { method: 'DELETE', token });
    refresh();
  };

  return (
    <div className="admin-block">
      <h3>Blog Posts</h3>
      <form className="admin-form" onSubmit={create}>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea placeholder="Content" rows="4" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {['technology', 'lifestyle', 'education', 'other'].map((c) => <option key={c}>{c}</option>)}
        </select>
        <button className="btn btn-primary">Publish Post</button>
      </form>
      <ul className="admin-list">
        {items.map((p) => (
          <li key={p._id}>{p.title} <span className="muted">({p.category})</span>
            <button className="btn btn-danger" onClick={() => remove(p._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MessagesTab({ token }) {
  const [items, setItems] = useState([]);
  const refresh = useCallback(() => api('/api/messages', { token }).then((d) => setItems(d.data)), [token]);
  useEffect(() => {
    refresh();
  }, [refresh]);

  const markRead = async (id) => { await api(`/api/messages/${id}/read`, { method: 'PATCH', token }); refresh(); };
  const remove = async (id) => { await api(`/api/messages/${id}`, { method: 'DELETE', token }); refresh(); };

  return (
    <div className="admin-block">
      <h3>Contact Messages</h3>
      <ul className="admin-list">
        {items.map((m) => (
          <li key={m._id} className={m.read ? 'read' : 'unread'}>
            <strong>{m.name}</strong> &lt;{m.email}&gt; - {m.subject || '(no subject)'}
            <p className="muted">{m.message}</p>
            {!m.read && <button className="btn btn-outline" onClick={() => markRead(m._id)}>Mark read</button>}
            <button className="btn btn-danger" onClick={() => remove(m._id)}>Delete</button>
          </li>
        ))}
        {items.length === 0 && <li className="muted">Inbox empty.</li>}
      </ul>
    </div>
  );
}

export default Admin;
