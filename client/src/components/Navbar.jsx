// src/components/Navbar.jsx - top navigation with auth-aware links.
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function Navbar({ dark, onToggleDark }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        Xianshu Ze<span className="brand-dot">.</span>
      </Link>
      <div className="nav-links">
        <NavLink to="/" end className="nav-link">Home</NavLink>
        <NavLink to="/blog" className="nav-link">Blog</NavLink>
        {user && (
          <NavLink to="/admin" className="nav-link">Admin</NavLink>
        )}
        <button className="nav-toggle" onClick={onToggleDark} aria-label="Toggle theme">
          {dark ? 'Light' : 'Dark'}
        </button>
        {user ? (
          <div className="nav-auth">
            <span className="nav-user">{user.username}</span>
            <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
