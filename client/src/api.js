// src/api.js - one tiny fetch wrapper for the whole app.
// Base URL comes from VITE_API_URL (.env at build time) so the same code
// runs against http://localhost:5000 in dev and the Render URL in prod.
const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function api(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const tokenStore = {
  get: () => localStorage.getItem('capstone_token'),
  set: (t) => localStorage.setItem('capstone_token', t),
  clear: () => localStorage.removeItem('capstone_token'),
};
