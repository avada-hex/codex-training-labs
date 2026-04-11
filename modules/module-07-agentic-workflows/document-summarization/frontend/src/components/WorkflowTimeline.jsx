import './WorkflowTimeline.css';

export default function WorkflowTimeline({ stages }) {
  return (
    <div className="workflow-timeline" aria-live="polite">
      {stages.map((stage) => (
        <article key={stage.stage} className={`workflow-step ${stage.status}`}>
          <header className="workflow-step-header">
            <span className="workflow-stage">{stage.stage}</span>
            <span className={`workflow-badge badge-${stage.status}`}>{stage.status}</span>
          </header>
          <p className="workflow-details">{stage.details}</p>
          {stage.metrics && Object.keys(stage.metrics).length > 0 && (
            <dl className="workflow-metrics">
              {Object.entries(stage.metrics).map(([key, value]) => (
                <div key={key} className="metric-row">
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
