import { PageShell } from '../components/PageShell';

const records = [
  {
    patientId: 'PT-1001',
    age: 42,
    sex: 'Female',
    origin: 'Urban',
    diet: 'Balanced',
    habits: 'Non-smoker',
    symptoms: 'Fatigue, headache',
    vitals: 'BP 128/78, HR 82, SpO2 98%',
    plan: 'Routine monitoring',
    updated: '2026-04-20 09:15'
  },
  {
    patientId: 'PT-1002',
    age: 61,
    sex: 'Male',
    origin: 'Suburban',
    diet: 'High sodium',
    habits: 'Sedentary',
    symptoms: 'Shortness of breath, chest pain',
    vitals: 'BP 154/96, HR 101, SpO2 94%',
    plan: 'Urgent clinical review',
    updated: '2026-04-20 09:22'
  },
  {
    patientId: 'PT-1003',
    age: 29,
    sex: 'Female',
    origin: 'Rural',
    diet: 'Vegetarian',
    habits: 'Exercises regularly',
    symptoms: 'Cough, fever',
    vitals: 'BP 118/74, HR 88, SpO2 99%',
    plan: 'Follow-up consultation',
    updated: '2026-04-20 09:30'
  }
];

export function PatientRecordsPage() {
  return (
    <PageShell
      title="Patient Records"
      description="Admin view only. Review stored patient profiles and clinical summaries in a structured table."
    >
      <section className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Age</th>
              <th>Sex</th>
              <th>Origin</th>
              <th>Diet</th>
              <th>Habits</th>
              <th>Symptoms</th>
              <th>Vitals</th>
              <th>Plan</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.patientId}>
                <td>{record.patientId}</td>
                <td>{record.age}</td>
                <td>{record.sex}</td>
                <td>{record.origin}</td>
                <td>{record.diet}</td>
                <td>{record.habits}</td>
                <td>{record.symptoms}</td>
                <td>{record.vitals}</td>
                <td>{record.plan}</td>
                <td>{record.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </PageShell>
  );
}
