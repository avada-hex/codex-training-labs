import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { PageShell } from './components/PageShell';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PatientRecordsPage } from './pages/PatientRecordsPage';
import { VitalsPage } from './pages/VitalsPage';
import { SymptomsPage } from './pages/SymptomsPage';
import { CarePlansPage } from './pages/CarePlansPage';
import { DashboardPage } from './pages/DashboardPage';
import { ContactUsPage } from './pages/ContactUsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PageShell
              title="Frontend workspace for the Clinical Decision Support System"
              description="This starter app is ready to run and gives the frontend team a clear place to build the patient experience described in the project spec."
            >
              <section className="card section-card">
                <h2>Frontend Tasks</h2>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Area</th>
                      <th>Task</th>
                      <th>Audience</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Authentication</td>
                      <td>Login page</td>
                      <td>Patients and admins</td>
                    </tr>
                    <tr>
                      <td>Authentication</td>
                      <td>Register page</td>
                      <td>Patients</td>
                    </tr>
                    <tr>
                      <td>Clinical data</td>
                      <td>Vitals and symptoms updates</td>
                      <td>Patients</td>
                    </tr>
                    <tr>
                      <td>Care guidance</td>
                      <td>Suggested care plans</td>
                      <td>Patients</td>
                    </tr>
                    <tr>
                      <td>Administration</td>
                      <td>Records and analytics dashboard</td>
                      <td>Admins only</td>
                    </tr>
                    <tr>
                      <td>Support</td>
                      <td>Contact us form</td>
                      <td>Patients and admins</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section className="card section-card">
                <h2>Working Order</h2>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Step</th>
                      <th>Milestone</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>App shell and auth flow</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>Patient record and update forms</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td>Care plans and dashboard</td>
                    </tr>
                    <tr>
                      <td>4</td>
                      <td>Contact us and shared states</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            </PageShell>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/records"
          element={
            <ProtectedRoute>
              <PatientRecordsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vitals"
          element={
            <ProtectedRoute>
              <VitalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/symptoms"
          element={
            <ProtectedRoute>
              <SymptomsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/care-plans"
          element={
            <ProtectedRoute>
              <CarePlansPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allow={['admin']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<Navigate to="/admin-dashboard" replace />} />
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <ContactUsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
