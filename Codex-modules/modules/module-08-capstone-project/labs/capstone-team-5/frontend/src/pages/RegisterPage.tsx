import { Link, useNavigate } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { setSession } from '../auth';

export function RegisterPage() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').toLowerCase().trim();

    setSession({
      email: email || 'patient@example.com',
      role: 'patient'
    });

    navigate('/care-plans');
  };

  return (
    <PageShell
      title="Register"
      description="Create a patient account with the identity and contact details required by the spec."
    >
      <section className="card">
        <form className="stack" onSubmit={handleSubmit}>
          <label>
            <span>Full name</span>
            <input name="name" type="text" placeholder="Alex Patient" />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" placeholder="patient@example.com" />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" placeholder="Patient123!" />
          </label>
          <button type="submit">Create account</button>
        </form>
        <p className="helper-text">
          Already registered? <Link to="/login">Return to login</Link>.
        </p>
      </section>
    </PageShell>
  );
}
