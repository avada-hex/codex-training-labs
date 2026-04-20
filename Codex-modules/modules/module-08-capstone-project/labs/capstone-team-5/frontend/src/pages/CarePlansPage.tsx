import { PageShell } from '../components/PageShell';

const carePlans = [
  ['Routine monitoring', 'Low', 'Stable vitals, mild symptoms'],
  ['Diet and lifestyle improvement', 'Moderate', 'Diet and habits need support'],
  ['Follow-up consultation', 'Moderate', 'Repeated symptom updates'],
  ['Urgent clinical review', 'High', 'Elevated vitals and chest symptoms'],
  ['Chronic condition management support', 'Medium', 'Long-term history needs attention']
];

export function CarePlansPage() {
  return (
    <PageShell
      title="Suggested Care Plans"
      description="Compare the recommended plans and select the one the patient wants to follow."
    >
      <section className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Care Plan</th>
              <th>Priority</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {carePlans.map(([name, priority, reason]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{priority}</td>
                <td>{reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </PageShell>
  );
}
