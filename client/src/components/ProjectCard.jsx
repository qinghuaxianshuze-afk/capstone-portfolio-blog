// src/components/ProjectCard.jsx - reusable card (Props from Lab 6.4).
function ProjectCard({ title, description, tags = [], featured, liveUrl, repoUrl }) {
  return (
    <div className={featured ? 'project-card featured-card' : 'project-card'}>
      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>
      {tags.length > 0 && (
        <div className="card-tags">
          {tags.map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
      )}
      <div className="card-actions">
        {liveUrl && <a href={liveUrl} target="_blank" rel="noopener noreferrer" className="card-link">Live Site</a>}
        {repoUrl && <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="card-link">Source</a>}
      </div>
    </div>
  );
}

export default ProjectCard;
