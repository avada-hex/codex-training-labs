import { Navigate } from 'react-router-dom';
import { getSession } from '../auth';

export function ProtectedRoute({ children, allow = ['patient', 'admin'] }) {
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (allow.length > 0 && !allow.includes(session.role)) {
    return <Navigate to={session.role === 'admin' ? '/admin-dashboard' : '/care-plans'} replace />;
  }

  return children;
}
