// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import CoursePage from './pages/CoursePage';
import FacultyDashboard from './pages/FacultyDashboard';
import SignupPage from './pages/SignupPage';
import CalendarPage from './pages/CalendarPage';
import ProfilePage from './pages/ProfilePage';
import FacultyPage  from './pages/FacultyPage';
import RunSchedulerPage  from './pages/RunSchedulerPage';
import ConfigurationPage  from './pages/ConfigurationPage';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ProtectedRoute from './components/ProtectedRoute';
import LogoutPage from './pages/LogoutPage';
import ChangePassword from './pages/ChangePassword';


const clientId = '631792757334-5mrcs31gfv0f0uogr4n183ct6gkhljda.apps.googleusercontent.com';

function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/change_password" element={<ChangePassword />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['faculty']}>
                <FacultyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CoursePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <CalendarPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/faculty"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <FacultyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/configuration"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ConfigurationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/generate"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <RunSchedulerPage />
              </ProtectedRoute>
            }
          />
          {/* <Route
            path="/profile"
            element={
              <ProtectedRoute allowedRoles={['faculty', 'admin']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          /> */}
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
