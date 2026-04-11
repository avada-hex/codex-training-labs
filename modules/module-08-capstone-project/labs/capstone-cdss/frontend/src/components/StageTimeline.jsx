import './StageTimeline.css';

export default function StageTimeline({ stages = [] }) {
  return (
    <div className="stage-timeline">
      {stages.map((stage) => (
        <article key={stage.stage} className={`stage ${stage.status}`}>
          <header className="stage-header">
            <span className="stage-name">{stage.stage}</span>
            <span className={`badge badge-${stage.status}`}>{stage.status}</span>
          </header>
          <p className="stage-details">{stage.details}</p>
          {stage.metrics && Object.keys(stage.metrics).length > 0 && (
            <dl className="metrics">
              {Object.entries(stage.metrics).map(([key, value]) => (
                <div key={key} className="metric">
                  <dt>{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </article>
      ))}
    </div>
  );
}
