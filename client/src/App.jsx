// src/App.jsx - route table + dark-mode shell.
import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Blog from './pages/Blog';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';
import Admin from './pages/Admin';

function App() {
  const [dark, setDark] = useState(true);

  return (
    <div className={dark ? 'app dark' : 'app'}>
      <Navbar dark={dark} onToggleDark={() => setDark(!dark)} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<PostDetail />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Routes>
      <footer className="footer">
        <p>Built with React + Express + MongoDB - Capstone Project by Xianshu Ze (24998025)</p>
      </footer>
    </div>
  );
}

export default App;
