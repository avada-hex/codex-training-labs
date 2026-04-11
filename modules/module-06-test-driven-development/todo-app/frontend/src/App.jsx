import { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:4000';

function fetchJson(path, options) {
  return fetch(path, options).then(async (response) => {
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = payload?.error || response.statusText;
      throw new Error(error);
    }
    return payload;
  });
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await fetchJson(`${API_BASE}/tasks`);
      setTasks(data);
    } catch (error) {
      setStatus({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ message: '', type: '' });
    const payload = { title, due: due || null, notes };

    try {
      setLoading(true);
      const created = await fetchJson(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setTasks((prev) => [created, ...prev]);
      setTitle('');
      setDue('');
      setNotes('');
      setStatus({ message: 'Task saved to the backend.', type: 'success' });
    } catch (error) {
      setStatus({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleCompletion = async (task) => {
    try {
      const updated = await fetchJson(`${API_BASE}/tasks/${task.id}/complete`, {
        method: 'PATCH'
      });
      setTasks((current) => current.map((t) => (t.id === updated.id ? updated : t)));
    } catch (error) {
      setStatus({ message: error.message, type: 'error' });
    }
  };

  return (
    <main className="app-shell">
      <section className="hero">
        <h1>ToDo App (React + Node)</h1>
        <p className="subtitle">
          Submit a task, see it recorded in the backend, and quickly toggle completion.
        </p>
      </section>

      <section className="form-card">
        <form onSubmit={handleSubmit}>
          <label htmlFor="title">Task title</label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Write a quick reminder"
            required
          />

          <label htmlFor="due">Optional due date</label>
          <input
            id="due"
            type="date"
            value={due}
            onChange={(event) => setDue(event.target.value)}
          />

          <label htmlFor="notes">Notes/details</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Add context (e.g., location, priority, links)"
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Saving …' : 'Save task to backend'}
          </button>
        </form>
        {status.message && (
          <p className={`status ${status.type}`}>{status.message}</p>
        )}
      </section>

      <section className="list">
        <header>
          <h2>Tasks recorded in the backend</h2>
          <span>{tasks.length} item(s)</span>
        </header>
        <div className="list-body">
          {loading && !tasks.length && <p>Loading saved tasks …</p>}
          {!tasks.length && !loading ? (
            <p className="empty">No tasks yet. Submit one above.</p>
          ) : (
            tasks.map((task) => (
              <article key={task.id} className={task.completed ? 'completed' : ''}>
                <div>
                  <p className="task-title">{task.title}</p>
                  <p className="meta">
                    {task.due ? `Due ${task.due}` : 'No due date'} · saved {new Date(task.createdAt).toLocaleTimeString()}
                  </p>
                  {task.notes && <p className="meta">{task.notes}</p>}
                </div>
                <button type="button" onClick={() => toggleCompletion(task)}>
                  {task.completed ? 'Mark undone' : 'Mark complete'}
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
