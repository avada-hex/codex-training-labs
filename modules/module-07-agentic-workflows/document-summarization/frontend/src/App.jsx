import { useEffect, useMemo, useState } from 'react';
import WorkflowTimeline from './components/WorkflowTimeline';
import './App.css';

const STAGE_ORDER = [
  'Understanding',
  'Decomposing',
  'Executing',
  'Checking',
  'Adjusting',
  'Completed'
];

const createIdleWorkflow = () =>
  STAGE_ORDER.map((stage) => ({
    stage,
    status: 'idle',
    details: 'Waiting for Codex to describe this step.',
    metrics: {}
  }));

const normalizeStages = (stages = []) =>
  STAGE_ORDER.map((stageName) => {
    const match = stages.find((stage) => stage.stage === stageName);
    if (!match) {
      return {
        stage: stageName,
        status: 'idle',
        details: 'Stage pending.',
        metrics: {}
      };
    }
    return {
      stage: stageName,
      status: match.status || 'done',
      details: match.details || '',
      metrics: match.metrics || {}
    };
  });

function App() {
  const [workflow, setWorkflow] = useState(createIdleWorkflow());
  const [selectedFile, setSelectedFile] = useState(null);
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [statusMessage, setStatusMessage] = useState(
    'Upload a document or paste text to see Codex reason through the summarization steps.'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  const selectedFileName = useMemo(() => selectedFile?.name ?? 'No file selected', [selectedFile]);

  useEffect(() => {
    if (!isLoading) {
      return undefined;
    }

    let current = 0;
    const handle = setInterval(() => {
      setWorkflow((previous) =>
        previous.map((stage, index) => {
          if (index < current) {
            return { ...stage, status: 'done', details: stage.details };
          }
          if (index === current) {
            return { ...stage, status: 'running', details: 'Codex is working on this stage.' };
          }
          return { ...stage, status: 'idle', details: 'Waiting in the pipeline.' };
        })
      );

      current += 1;
      if (current >= STAGE_ORDER.length) {
        clearInterval(handle);
      }
    }, 400);

    return () => clearInterval(handle);
  }, [isLoading]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!selectedFile && !inputText.trim()) {
      setError('Please add text or upload a document before summarizing.');
      return;
    }

    setWorkflow(createIdleWorkflow());
    setIsLoading(true);
    setStatusMessage('Codex is translating the document into a multi-stage plan...');
    setSummary('');

    const formData = new FormData();
    if (selectedFile) {
      formData.append('document', selectedFile);
    }
    if (inputText.trim()) {
      formData.append('text', inputText.trim());
    }

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Server rejected the request.');
      }

      const data = await response.json();
      setSummary(data.summary || '');
      setWorkflow(normalizeStages(data.stages));
      setStatusMessage('Workflow complete. Review each stage to see how Codex adapted.');
    } catch (err) {
      setError(err.message || 'Unable to summarize the document.');
      setStatusMessage('The Codex agent encountered an issue. Check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <p className="eyebrow">Module 07 · Agentic Workflows</p>
        <h1>Document Summarizer as an Agentic Codex Demo</h1>
        <p className="lede">
          Upload a text file or paste content, then watch Codex outline its understanding,
          decomposition, execution, checking, and adjustment stages before returning a concise summary.
        </p>
      </header>

      <main className="dashboard">
        <section className="panel form-panel">
          <div className="panel-header">
            <h2>Upload &amp; prompt</h2>
            <p className="status" aria-live="polite">
              {statusMessage}
            </p>
          </div>
          <form className="summarizer-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Upload a document (.txt)</span>
              <input type="file" accept=".txt,text/plain" onChange={handleFileChange} />
              <small>{selectedFileName}</small>
            </label>

            <label className="field">
              <span>Or paste the document text</span>
              <textarea
                name="text"
                rows="6"
                placeholder="Paste text that expresses the idea you want summarized."
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
              />
            </label>

            {error && <p className="error">{error}</p>}

            <button type="submit" className="primary" disabled={isLoading}>
              {isLoading ? 'Summarizing...' : 'Run Codex workflow'}
            </button>
          </form>

          <div className="summary-preview">
            <h3>Summary output</h3>
            {summary ? (
              <p>{summary}</p>
            ) : (
              <p className="placeholder">The summary will appear here after the workflow finishes.</p>
            )}
          </div>
        </section>

        <section className="panel timeline-panel">
          <div className="panel-header">
            <h2>Codex agentic timeline</h2>
            <p>Each badge reflects a stage in the planning → prompt → code → test → adjust narrative.</p>
          </div>
          <WorkflowTimeline stages={workflow} />
        </section>
      </main>
    </div>
  );
}

export default App;
