import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from '../App';
import { ProtectedRoute } from '../routes/ProtectedRoute';

describe('routing', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('redirects unauthenticated users from protected routes', () => {
    window.history.pushState({}, '', '/records');
    render(<App />);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('renders the landing page and wildcard redirect', () => {
    window.history.pushState({}, '', '/');
    render(<App />);
    expect(screen.getByText(/frontend workspace for the clinical decision support system/i)).toBeInTheDocument();

    cleanup();
    window.history.pushState({}, '', '/does-not-exist');
    render(<App />);
    expect(screen.getByText(/frontend workspace for the clinical decision support system/i)).toBeInTheDocument();
  });

  it('renders patient and admin protected routes and dashboard redirect', () => {
    window.localStorage.setItem('capstone-team-5-auth', JSON.stringify({ email: 'patient@example.com', role: 'patient' }));
    window.history.pushState({}, '', '/care-plans');
    render(<App />);
    expect(screen.getByText('Suggested Care Plans')).toBeInTheDocument();

    cleanup();
    window.localStorage.setItem('capstone-team-5-auth', JSON.stringify({ email: 'admin@example.com', role: 'admin' }));
    window.history.pushState({}, '', '/dashboard');
    render(<App />);
    expect(screen.getByText('Admin Analytics Dashboard')).toBeInTheDocument();
  });

  it('redirects unauthorized protected route access based on role', () => {
    window.localStorage.setItem('capstone-team-5-auth', JSON.stringify({ email: 'patient@example.com', role: 'patient' }));

    render(
      <MemoryRouter initialEntries={['/admin-dashboard']}>
        <Routes>
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allow={['admin']}>
                <div>Admin only</div>
              </ProtectedRoute>
            }
          />
          <Route path="/care-plans" element={<div>Care plans redirect</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Admin only')).not.toBeInTheDocument();
    expect(screen.getByText('Care plans redirect')).toBeInTheDocument();
  });

  it('allows authorized protected route access', () => {
    window.localStorage.setItem('capstone-team-5-auth', JSON.stringify({ email: 'admin@example.com', role: 'admin' }));

    render(
      <MemoryRouter initialEntries={['/admin-dashboard']}>
        <ProtectedRoute allow={['admin']}>
          <div>Admin only</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin only')).toBeInTheDocument();
  });

  it('redirects admins away from patient-only routes and allows empty allow lists', () => {
    window.localStorage.setItem('capstone-team-5-auth', JSON.stringify({ email: 'admin@example.com', role: 'admin' }));

    render(
      <MemoryRouter initialEntries={['/patient-only']}>
        <Routes>
          <Route
            path="/patient-only"
            element={
              <ProtectedRoute allow={['patient']}>
                <div>Patient only</div>
              </ProtectedRoute>
            }
          />
          <Route path="/admin-dashboard" element={<div>Admin redirect</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin redirect')).toBeInTheDocument();

    cleanup();

    render(
      <MemoryRouter initialEntries={['/open']}>
        <ProtectedRoute allow={[]}>
          <div>Open content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Open content')).toBeInTheDocument();
  });
});
