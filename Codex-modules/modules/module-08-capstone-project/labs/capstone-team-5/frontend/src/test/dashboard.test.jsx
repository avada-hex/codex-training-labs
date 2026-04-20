import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';

describe('DashboardPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.setItem('capstone-team-5-auth', JSON.stringify({ email: 'admin@example.com', role: 'admin' }));
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-20T09:35:00Z'));
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('renders live admin metrics and refreshes them on the interval', () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Streaming live')).toBeInTheDocument();
    expect(screen.getByText('Patients monitored')).toBeInTheDocument();
    expect(screen.getByText('PT-1002')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3500);
    });

    expect(screen.getAllByText('Live update').length).toBeGreaterThan(0);
    expect(screen.getByText('PT-1000')).toBeInTheDocument();
  });
});
