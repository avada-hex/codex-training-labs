import { useState } from "react";
import { explainStackTrace } from "./stackTraceApi";

const SAMPLE_TRACES = [
  {
    label: "Component render TypeError",
    trace: `TypeError: Cannot read properties of undefined (reading 'items')
    at Dashboard.render (src/components/Dashboard.jsx:42:18)
    at commitRootImpl (react-dom.development.js:25137:33)
    at commitRoot (react-dom.development.js:24979:9)`
  },
  {
    label: "Missing hook dependency",
    trace: `Warning: Mutable values like 'countRef.current' should not be used to compute derived data (src/hooks/useCounter.ts:24:12)
    at useEffect (react-dom.development.js:2470:10)
    at Dashboard.useEffect (src/components/Dashboard.jsx:60:5)`
  }
];

function App() {
  const [stackTrace, setStackTrace] = useState(SAMPLE_TRACES[0].trace);
  const [diagnostic, setDiagnostic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setDiagnostic(null);

    try {
      const payload = await explainStackTrace(stackTrace.trim());
      setDiagnostic(payload);
    } catch (err) {
      setError("Unable to reach the diagnostics service. Did you start the backend?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header>
        <p className="eyebrow">Module 3 • Debugging with Codex</p>
        <h1>Stack Trace Playground</h1>
        <p>Paste a stack trace, see what the assistant identifies, and review the suggested patch.</p>
      </header>

      <section className="trace-input">
        <form onSubmit={handleSubmit}>
          <label htmlFor="stackTrace">Stack trace</label>
          <textarea
            id="stackTrace"
            value={stackTrace}
            onChange={(event) => setStackTrace(event.target.value)}
            rows={10}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Analyzing…" : "Explain this trace"}
          </button>
        </form>

        <div className="sample-list">
          <p>Sample traces</p>
          <div className="sample-buttons">
            {SAMPLE_TRACES.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => setStackTrace(sample.trace)}
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {error && <p className="status error">{error}</p>}

      {diagnostic && (
        <section className="diagnostic-card">
          <h2>Codex-style response</h2>
          <div className="diagnostic-detail">
            <strong>Bad line</strong>
            <p>{diagnostic.badLine}</p>
          </div>
          <div className="diagnostic-detail">
            <strong>Root cause</strong>
            <p>{diagnostic.rootCause}</p>
          </div>
          <div className="diagnostic-detail">
            <strong>Fix suggestion</strong>
            <p>{diagnostic.fixSuggestion}</p>
          </div>
          <div className="patch-preview">
            <strong>Patch preview</strong>
            <pre>{diagnostic.patchPreview}</pre>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
