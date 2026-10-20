// src/pages/ProjectsPage.jsx - dedicated /projects gallery (spec Phase 8).
// Same live data as the home page, presented as a full-page gallery.
import { useEffect, useState } from 'react';
import { api } from '../api';
import ProjectCard from '../components/ProjectCard';

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api('/api/projects')
      .then((d) => setProjects(d.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section page-pad">
      <h2>Projects Gallery ({projects.length})</h2>
      {loading && <p className="muted">Loading projects...</p>}
      {error && <p className="error-text">Failed to load projects.</p>}
      <div className="projects-grid">
        {projects.map((p) => (
          <ProjectCard key={p._id} title={p.title} description={p.description} tags={p.tags} featured={p.featured} liveUrl={p.liveUrl} repoUrl={p.repoUrl} />
        ))}
      </div>
    </section>
  );
}

export default ProjectsPage;
