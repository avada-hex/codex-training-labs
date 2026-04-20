import { useEffect, useState } from 'react';
import { PageShell } from '../components/PageShell';

const baseMetrics = [
  { label: 'Patients monitored', value: 128, delta: '+12 today', trend: 'Up' },
  { label: 'High-risk alerts', value: 14, delta: '-3 from yesterday', trend: 'Down' },
  { label: 'Avg. oxygen saturation', value: '96.8%', delta: '+0.4%', trend: 'Up' },
  { label: 'Avg. heart rate', value: '84 bpm', delta: '-2 bpm', trend: 'Stable' },
  { label: 'Open follow-ups', value: 21, delta: '+5 pending', trend: 'Attention' },
  { label: 'Critical cases', value: 4, delta: 'Needs review', trend: 'Attention' }
];

const initialActivity = [
  ['PT-1002', 'Urgent clinical review', '09:22'],
  ['PT-1001', 'Vitals refreshed', '09:15'],
  ['PT-1003', 'Follow-up consultation', '09:30']
];

export function DashboardPage() {
  const [clock, setClock] = useState(new Date());
  const [metrics, setMetrics] = useState(baseMetrics);
  const [activity, setActivity] = useState(initialActivity);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setClock(new Date());
      setMetrics((current) =>
        current.map((metric, index) => {
          if (index === 0) {
            return {
              ...metric,
              value: 128 + Math.floor(Math.random() * 3),
              delta: 'Live update',
              trend: 'Up'
            };
          }
          if (index === 1) {
            return {
              ...metric,
              value: 12 + Math.floor(Math.random() * 4),
              delta: 'Live update',
              trend: 'Down'
            };
          }
          if (index === 2) {
            return {
              ...metric,
              value: `${96.5 + Math.random() * 1.2}%`,
              delta: 'Live update',
              trend: 'Up'
            };
          }
          if (index === 3) {
            return {
              ...metric,
              value: `${82 + Math.floor(Math.random() * 4)} bpm`,
              delta: 'Live update',
              trend: 'Stable'
            };
          }
          return {
            ...metric,
            value: 3 + Math.floor(Math.random() * 3),
            delta: 'Live update',
            trend: 'Attention'
          };
        })
      );

      setActivity((current) => [
        [
          `PT-${1000 + Math.floor(Math.random() * 50)}`,
          'Vitals refreshed',
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        ],
        ...current.slice(0, 4)
      ]);
    }, 3500);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <PageShell
      title="Admin Analytics Dashboard"
      description="Live operational view for monitoring patient volume, risk signals, and recent activity."
    >
      <section className="dashboard-grid">
        <article className="card dashboard-hero">
          <div>
            <p className="eyebrow">Real-time analytics</p>
            <h2>{clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</h2>
            <p className="helper-text">Auto-refreshing admin board for clinical oversight.</p>
          </div>
          <div className="status-pill">Streaming live</div>
        </article>

        {metrics.map((metric) => (
          <article key={metric.label} className="card metric-card">
            <p className="metric-label">{metric.label}</p>
            <p className="metric-value">{metric.value}</p>
            <p className={`metric-delta ${metric.trend.toLowerCase()}`}>{metric.delta}</p>
          </article>
        ))}
      </section>

      <section className="card section-card">
        <h2>Current patient distribution</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>Current Value</th>
              <th>Status</th>
              <th>Interpretation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Vitals within range</td>
              <td>87%</td>
              <td>Healthy</td>
              <td>Majority of active patients are stable.</td>
            </tr>
            <tr>
              <td>Needs follow-up</td>
              <td>21%</td>
              <td>Watchlist</td>
              <td>Requires review by care team members.</td>
            </tr>
            <tr>
              <td>Urgent review</td>
              <td>4%</td>
              <td>Critical</td>
              <td>Escalation recommended for active alerts.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="card section-card">
        <h2>Live activity feed</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Event</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {activity.map(([patient, event, time]) => (
              <tr key={`${patient}-${event}-${time}`}>
                <td>{patient}</td>
                <td>{event}</td>
                <td>{time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </PageShell>
  );
}
