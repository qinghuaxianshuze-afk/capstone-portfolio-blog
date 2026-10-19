// src/pages/Blog.jsx - post list, category filter.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

function Blog() {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api(category ? `/api/posts?category=${category}` : '/api/posts')
      .then((d) => setPosts(d.data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [category]);

  const cats = ['technology', 'lifestyle', 'education', 'other'];

  return (
    <section className="section page-pad">
      <h2>Blog</h2>
      <div className="filter-row">
        <button className={category === '' ? 'chip active' : 'chip'} onClick={() => setCategory('')}>All</button>
        {cats.map((c) => (
          <button key={c} className={category === c ? 'chip active' : 'chip'} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>
      {loading && <p className="muted">Loading posts...</p>}
      {!loading && posts.length === 0 && <p className="muted">No posts yet.</p>}
      <div className="blog-list">
        {posts.map((p) => (
          <article key={p._id} className="blog-item">
            <h3><Link to={`/blog/${p._id}`}>{p.title}</Link></h3>
            <p className="muted">
              {p.category} · by {p.author?.username || 'unknown'} · {new Date(p.createdAt).toLocaleDateString()}
            </p>
            <p>{p.content.slice(0, 160)}...</p>
            <Link className="card-link" to={`/blog/${p._id}`}>Read more →</Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export default Blog;
