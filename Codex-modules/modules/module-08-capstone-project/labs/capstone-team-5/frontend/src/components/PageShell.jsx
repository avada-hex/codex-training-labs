import { Link } from 'react-router-dom';
import { getSession, clearSession } from '../auth';

const navItems = [
  { to: '/care-plans', label: 'Care Plans', roles: ['patient', 'admin'] },
  { to: '/vitals', label: 'Vitals', roles: ['patient', 'admin'] },
  { to: '/symptoms', label: 'Symptoms', roles: ['patient', 'admin'] },
  { to: '/contact', label: 'Contact', roles: ['patient', 'admin'] },
  { to: '/records', label: 'Records', roles: ['admin'] },
  { to: '/admin-dashboard', label: 'Dashboard', roles: ['admin'] }
];

export function PageShell({ title, description, children }) {
  const session = getSession();
  const role = session?.role;
  const visibleNavItems = navItems.filter((item) => !role || item.roles.includes(role));

  const handleLogout = () => {
    clearSession();
    window.location.assign('/login');
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Capstone Team 5 {role ? `· ${role}` : ''}</p>
          <h1>{title}</h1>
          {description ? <p className="lead">{description}</p> : null}
        </div>
        <nav className="nav">
          {visibleNavItems.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
          {session ? (
            <button type="button" className="nav-button" onClick={handleLogout}>
              Logout
            </button>
          ) : null}
        </nav>
      </header>

      {children}
    </main>
  );
}
