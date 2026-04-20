import { PageShell } from '../components/PageShell';

const vitals = [
  ['Temperature', '37.2 C', 'Normal'],
  ['Heart rate', '82 bpm', 'Stable'],
  ['Blood pressure', '128/78', 'Stable'],
  ['Respiratory rate', '16 rpm', 'Normal'],
  ['Oxygen saturation', '98%', 'Good'],
  ['Weight or BMI', '72 kg / 23.5', 'Tracked']
];

export function VitalsPage() {
  return (
    <PageShell
      title="Vitals"
      description="Add or update the latest vital signs for the logged-in patient."
    >
      <section className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Vital</th>
              <th>Latest Reading</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {vitals.map(([name, reading, status]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{reading}</td>
                <td>{status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </PageShell>
  );
}
