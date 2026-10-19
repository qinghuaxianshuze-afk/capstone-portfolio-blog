// src/AuthContext.jsx - global auth state (token + user) via React Context.
// Any component can read { user, login, logout } - no prop drilling.
import { createContext, useContext, useState } from 'react';
import { api, tokenStore } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Hydrate from localStorage on first render (survives page refresh).
    const cached = localStorage.getItem('capstone_user');
    return cached ? JSON.parse(cached) : null;
  });

  const login = async (email, password) => {
    const data = await api('/api/users/login', {
      method: 'POST',
      body: { email, password },
    });
    tokenStore.set(data.token);
    const u = { _id: data._id, username: data.username, email: data.email, role: data.role };
    setUser(u);
    localStorage.setItem('capstone_user', JSON.stringify(u));
    return u;
  };

  const logout = () => {
    tokenStore.clear();
    localStorage.removeItem('capstone_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
