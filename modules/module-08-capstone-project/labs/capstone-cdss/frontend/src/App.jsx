import { useEffect, useMemo, useState } from 'react';
import StageTimeline from './components/StageTimeline';
import './App.css';

const STAGE_SEQUENCE = ['Understanding', 'Decomposing', 'Executing', 'Checking', 'Adjusting', 'Completed'];

const createIdleStages = () =>
  STAGE_SEQUENCE.map((stage) => ({
    stage,
    status: 'idle',
    details: 'Pending the Codex reasoning step.',
    metrics: {}
  }));

const symptomOptions = [
  'Chest pain',
  'Shortness of breath',
  'Dizziness',
  'Confusion',
  'Nausea/Vomiting',
  'Fever'
];

const DEFAULT_FIELDS = {
  heartRate: 98,
  respiratoryRate: 18,
  temperature: 37,
  systolicBP: 130,
  diastolicBP: 78,
  oxygenSaturation: 97
};

function App() {
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [symptoms, setSymptoms] = useState([]);
  const [stages, setStages] = useState(createIdleStages());
  const [assessment, setAssessment] = useState(null);
  const [statusMessage, setStatusMessage] = useState(
    'Fill the vitals and choose symptoms to let Codex explain what to monitor.'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedSymptoms = useMemo(() => symptoms.length, [symptoms]);

  useEffect(() => {
    if (!isLoading) {
      return undefined;
    }

    let current = 0;
    const intervalId = setInterval(() => {
      setStages((previous) =>
        previous.map((stage, index) => {
          if (index < current) {
            return { ...stage, status: 'done' };
          }
          if (index === current) {
            return { ...stage, status: 'running', details: 'Codex is performing this step.' };
          }
          return { ...stage, status: 'idle', details: 'Waiting in the pipeline.' };
        })
      );

      current += 1;
      if (current >= STAGE_SEQUENCE.length) {
        clearInterval(intervalId);
      }
    }, 400);

    return () => clearInterval(intervalId);
  }, [isLoading]);

  const handleChange = (field, value) => {
    setFields((prev) => ({ ...prev, [field]: Number(value) }));
  };

  const handleSymptomToggle = (symptom) => {
    setSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((item) => item !== symptom)
        : [...prev, symptom]
    );
  };

  const normalizeStages = (incoming = []) =>
    STAGE_SEQUENCE.map((stageName) => {
      const match = incoming.find((item) => item.stage === stageName);
      if (!match) {
        return { stage: stageName, status: 'idle', details: 'Awaiting backend data.' };
      }
      return {
        stage: stageName,
        status: match.status || 'done',
        details: match.details || '',
        metrics: match.metrics || {}
      };
    });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setAssessment(null);
    setStages(createIdleStages());
    setStatusMessage('Codex is decomposing the clinical question into plan → prompt → code...');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...fields,
          symptoms
        })
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Backend rejected the request.');
      }

      const data = await response.json();
      setAssessment(data.assessment);
      setStages(normalizeStages(data.stages));
      setStatusMessage('Codex completed the assessment and documented each agentic step.');
    } catch (err) {
      setError(err.message);
      setStatusMessage('Issue running the assessment; check the network/backend logs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="header">
        <p className="eyebrow">Module 08 · Capstone · Clinical Decision Support System</p>
        <h1>Agentic CDSS Dashboard</h1>
        <p>Submit vitals and symptoms, then watch Codex narrate every reasoning step from plan to delivery.</p>
      </header>

      <main className="grid">
        <section className="panel form-panel">
          <div className="panel-header">
            <h2>Vital signs &amp; symptoms</h2>
            <p className="status">{statusMessage}</p>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <div className="field-grid">
              {Object.entries(fields).map(([field, value]) => (
                <label key={field}>
                  <span>{field.replace(/([A-Z])/g, ' $1').replace(/^./, (p) => p.toUpperCase())}</span>
                  <input
                    type="number"
                    value={value}
                    min="0"
                    onChange={(event) => handleChange(field, event.target.value)}
                  />
                </label>
              ))}
            </div>

            <div className="symptoms">
              <p>Symptoms (select multiple)</p>
              <div className="symptom-grid">
                {symptomOptions.map((symptom) => (
                  <label key={symptom} className="symptom-chip">
                    <input
                      type="checkbox"
                      checked={symptoms.includes(symptom)}
                      onChange={() => handleSymptomToggle(symptom)}
                    />
                    {symptom}
                  </label>
                ))}
              </div>
              <p className="helper-text">{selectedSymptoms} symptom(s) selected.</p>
            </div>

            {error && <p className="error">{error}</p>}

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Running the pipeline…' : 'Run Codex assessment'}
            </button>
          </form>
        </section>

        <section className="panel timeline-panel">
          <div className="panel-header">
            <h2>Agentic timeline</h2>
            <p>Each badge reflects understanding → decomposition → execution → checking → adjustment → completion.</p>
          </div>
          <StageTimeline stages={stages} />
        </section>

        <section className="panel results-panel">
          <div className="panel-header">
            <h2>Results</h2>
            <p>Codex emits a risk score, level, and care-plan recommendation based on the stated heuristics.</p>
          </div>
          {assessment ? (
            <div className="results">
              <div className="risk-card">
                <p className="label">Risk score</p>
                <p className="value">{assessment.riskScore}</p>
                <p className={`level ${assessment.riskLevel?.toLowerCase()}`}>{assessment.riskLevel} risk</p>
              </div>
              <div className="care-plan">
                <h3>Care plan</h3>
                <p>{assessment.carePlan}</p>
                <h4>Summary</h4>
                <p>{assessment.summary}</p>
                {assessment.contributors?.length > 0 && (
                  <ul>
                    {assessment.contributors.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <p className="placeholder">The summary card will fill after Codex finishes the pipeline.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
