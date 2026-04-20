import { Link, useNavigate } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { setSession } from '../auth';

export function LoginPage() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').toLowerCase().trim();
    const password = String(formData.get('password') || '');
    const role = email.includes('admin') || password === 'Admin123!' ? 'admin' : 'patient';

    setSession({
      email: email || 'patient@example.com',
      role
    });

    navigate(role === 'admin' ? '/records' : '/care-plans');
  };

  return (
    <PageShell
      title="Login"
      description="Use the demo credentials to enter the patient or admin experience."
    >
      <section className="card">
        <form className="stack" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input name="email" type="email" placeholder="patient@example.com" />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" placeholder="Patient123!" />
          </label>
          <button type="submit">Log in</button>
        </form>
        <table className="data-table credential-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Email</th>
              <th>Password</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Patient</td>
              <td>patient@example.com</td>
              <td>Patient123!</td>
            </tr>
            <tr>
              <td>Admin</td>
              <td>admin@example.com</td>
              <td>Admin123!</td>
            </tr>
          </tbody>
        </table>
        <p className="helper-text">
          New here? <Link to="/register">Create an account</Link>.
        </p>
      </section>
    </PageShell>
  );
}
