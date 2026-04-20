import { PageShell } from '../components/PageShell';

const symptoms = [
  ['Fever', 'Low', '2026-04-20 08:45'],
  ['Cough', 'Moderate', '2026-04-20 09:00'],
  ['Fatigue', 'Moderate', '2026-04-20 09:12'],
  ['Shortness of breath', 'None', '2026-04-20 08:55'],
  ['Chest pain', 'None', '2026-04-20 08:55'],
  ['Headache', 'Mild', '2026-04-20 09:18'],
  ['Dizziness', 'None', '2026-04-20 09:18'],
  ['Pain level', '2/10', '2026-04-20 09:18']
];

export function SymptomsPage() {
  return (
    <PageShell
      title="Symptoms"
      description="Capture symptom updates so the dashboard can track history and trends."
    >
      <section className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Symptom</th>
              <th>Severity</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {symptoms.map(([name, severity, updated]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{severity}</td>
                <td>{updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </PageShell>
  );
}
