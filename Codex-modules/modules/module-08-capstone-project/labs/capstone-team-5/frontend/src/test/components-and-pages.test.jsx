import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { defaultLogoutRedirect, PageShell } from '../components/PageShell';
import { CarePlansPage } from '../pages/CarePlansPage';
import { ContactUsPage } from '../pages/ContactUsPage';
import { LoginPage } from '../pages/LoginPage';
import { PatientRecordsPage } from '../pages/PatientRecordsPage';
import { RegisterPage } from '../pages/RegisterPage';
import { SymptomsPage } from '../pages/SymptomsPage';
import { VitalsPage } from '../pages/VitalsPage';

function renderWithRouter(ui, initialEntries = ['/']) {
  return render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);
}

describe('shell and page components', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders role-aware navigation and logs the user out', async () => {
    window.localStorage.setItem('capstone-team-5-auth', JSON.stringify({ email: 'admin@example.com', role: 'admin' }));
    const redirectSpy = vi.fn();

    renderWithRouter(
      <PageShell title="Dashboard" description="Admin tools" onLogoutRedirect={redirectSpy}>
        <div>Inner content</div>
      </PageShell>
    );

    expect(screen.getByText(/capstone team 5/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Records' })).toBeInTheDocument();
    expect(screen.getByText('Inner content')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Logout' }));
    expect(redirectSpy).toHaveBeenCalledWith('/login');
    expect(window.localStorage.getItem('capstone-team-5-auth')).toBeNull();
  });

  it('uses the default logout redirect helper', () => {
    const locationObject = { assign: vi.fn() };

    defaultLogoutRedirect('/login', locationObject);

    expect(locationObject.assign).toHaveBeenCalledWith('/login');
  });

  it('shows the default navigation set when there is no session', () => {
    renderWithRouter(
      <PageShell title="Guest" description="">
        <div>Guest content</div>
      </PageShell>
    );

    expect(screen.getByRole('link', { name: 'Records' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument();
  });

  it('renders the static care plan, vitals, symptoms, contact, and records pages', () => {
    renderWithRouter(
      <>
        <CarePlansPage />
        <ContactUsPage />
        <PatientRecordsPage />
        <SymptomsPage />
        <VitalsPage />
      </>
    );

    expect(screen.getByText('Suggested Care Plans')).toBeInTheDocument();
    expect(screen.getAllByText('Routine monitoring').length).toBeGreaterThan(0);
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('Patient Records')).toBeInTheDocument();
    expect(screen.getByText('PT-1002')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Symptoms' })).toBeInTheDocument();
    expect(screen.getByText('Shortness of breath')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Vitals' })).toBeInTheDocument();
    expect(screen.getByText('Oxygen saturation')).toBeInTheDocument();
  });

  it('submits login for patients and admins and stores session state', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/care-plans" element={<div>Care plan target</div>} />
          <Route path="/records" element={<div>Records target</div>} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('Email'), 'patient@example.com');
    await user.type(screen.getByLabelText('Password'), 'Patient123!');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Care plan target')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('capstone-team-5-auth'))).toEqual({
      email: 'patient@example.com',
      role: 'patient'
    });

    cleanup();
    window.localStorage.clear();

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/care-plans" element={<div>Care plan target</div>} />
          <Route path="/records" element={<div>Records target</div>} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'Admin123!');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Records target')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('capstone-team-5-auth'))).toEqual({
      email: 'admin@example.com',
      role: 'admin'
    });
  });

  it('submits register and routes patients to care plans', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/care-plans" element={<div>Care plan target</div>} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('Full name'), 'Alex Patient');
    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Password'), 'Patient123!');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Care plan target')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('capstone-team-5-auth'))).toEqual({
      email: 'new@example.com',
      role: 'patient'
    });
  });

  it('uses fallback emails for blank login and register submissions', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/records" element={<div>Records target</div>} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText('Password'), 'Admin123!');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Records target')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('capstone-team-5-auth'))).toEqual({
      email: 'patient@example.com',
      role: 'admin'
    });

    cleanup();
    window.localStorage.clear();

    render(
      <MemoryRouter initialEntries={['/register']}>
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/care-plans" element={<div>Care plan target</div>} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Care plan target')).toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem('capstone-team-5-auth'))).toEqual({
      email: 'patient@example.com',
      role: 'patient'
    });
  });
});
