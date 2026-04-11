import { useEffect, useState } from 'react';

export default function App() {
  const [taskText, setTaskText] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to load tasks');
      }
      const data = await response.json();
      setTasks(data.tasks);
    } catch (err) {
      setError('Unable to reach the backend. Please start the server first.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!taskText.trim()) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: taskText })
      });

      if (!response.ok) {
        throw new Error('Could not save task');
      }

      const data = await response.json();
      setTasks([data.task, ...tasks]);
      setTaskText('');
    } catch (err) {
      setError('Something went wrong while saving this task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <main className="card">
        <header>
          <p className="eyebrow">Module 01 · Todo UI</p>
          <h1>Your simple todo list</h1>
          <p>Type a task in the box below and press “Add Task”.</p>
        </header>

        <form className="task-form" onSubmit={handleSubmit}>
          <label htmlFor="new-task">New task</label>
          <div className="input-row">
            <input
              id="new-task"
              value={taskText}
              onChange={(event) => setTaskText(event.target.value)}
              placeholder="Buy milk, plan presentation, etc."
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Add Task'}
            </button>
          </div>
        </form>

        {error && <p className="error">{error}</p>}

        <section className="task-list">
          <h2>Tasks</h2>
          {loading && tasks.length === 0 ? (
            <p className="muted">Loading tasks…</p>
          ) : sortedTasks.length === 0 ? (
            <p className="muted">Task list is empty. Add something above.</p>
          ) : (
            <ul>
              {tasks.map((task) => (
                <li key={task.id}>{task.text}</li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
