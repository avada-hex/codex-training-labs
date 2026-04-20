import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { api } from '../services/api';
import { clearSession, getSession, setSession } from '../auth';

describe('auth helpers', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('stores and retrieves a serialized session', () => {
    setSession({ email: 'patient@example.com', role: 'patient' });
    expect(getSession()).toEqual({ email: 'patient@example.com', role: 'patient' });
  });

  it('supports the legacy true session flag', () => {
    window.localStorage.setItem('capstone-team-5-auth', 'true');
    expect(getSession()).toEqual({ email: 'patient@example.com', role: 'patient' });
  });

  it('returns null for missing or invalid session data and clears sessions', () => {
    expect(getSession()).toBeNull();
    window.localStorage.setItem('capstone-team-5-auth', '{');
    expect(getSession()).toBeNull();

    setSession({ email: 'admin@example.com', role: 'admin' });
    clearSession();
    expect(getSession()).toBeNull();
  });

  it('exports the placeholder api surface', () => {
    expect(api).toEqual({});
  });
});
