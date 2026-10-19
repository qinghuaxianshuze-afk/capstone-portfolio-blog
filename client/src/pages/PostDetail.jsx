// src/pages/PostDetail.jsx - full post + comments.
// Commenting requires login (POST /api/comments needs a JWT).
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, tokenStore } from '../api';
import { useAuth } from '../AuthContext';

function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [note, setNote] = useState('');

  const load = () => {
    api(`/api/posts/${id}`).then((d) => setPost(d.data)).catch(() => setPost('gone'));
    api(`/api/comments/post/${id}`).then((d) => setComments(d.data)).catch(() => {});
  };
  useEffect(load, [id]);

  const submitComment = async (e) => {
    e.preventDefault();
    setNote('');
    try {
      await api(`/api/comments/post/${id}`, {
        method: 'POST',
        body: { content: text },
        token: tokenStore.get(),
      });
      setText('');
      load();
    } catch (err) {
      setNote(err.message);
    }
  };

  if (post === 'gone') return <section className="section page-pad"><p>Post not found. <Link to="/blog">Back to blog</Link></p></section>;
  if (!post) return <section className="section page-pad"><p className="muted">Loading...</p></section>;

  return (
    <section className="section page-pad post-detail">
      <h2>{post.title}</h2>
      <p className="muted">
        {post.category} · by {post.author?.username || 'unknown'} · {new Date(post.createdAt).toLocaleDateString()}
      </p>
      <div className="post-body">
        {post.content.split('\n\n').map((para, i) => <p key={i}>{para}</p>)}
      </div>

      <h3>Comments ({comments.length})</h3>
      {comments.map((c) => (
        <div key={c._id} className="comment">
          <strong>{c.author?.username || 'anonymous'}</strong>
          <span className="muted"> · {new Date(c.createdAt).toLocaleString()}</span>
          <p>{c.content}</p>
        </div>
      ))}

      {user ? (
        <form className="comment-form" onSubmit={submitComment}>
          <textarea rows="3" placeholder="Write a comment..." value={text} onChange={(e) => setText(e.target.value)} required />
          <button className="btn btn-primary">Post Comment</button>
          {note && <p className="error-text">{note}</p>}
        </form>
      ) : (
        <p className="muted"><Link to="/login">Log in</Link> to leave a comment.</p>
      )}
    </section>
  );
}

export default PostDetail;
