const AUTH_KEY = 'capstone-team-5-auth';

export function getSession() {
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (!raw) {
      return null;
    }
    if (raw === 'true') {
      return { email: 'patient@example.com', role: 'patient' };
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(session) {
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(AUTH_KEY);
}
