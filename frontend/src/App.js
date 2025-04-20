import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import SignupPage from './pages/SignupPage';
import CalendarPage from './pages/CalendarPage';
import { GoogleOAuthProvider } from '@react-oauth/google';

const clientId = '631792757334-5mrcs31gfv0f0uogr4n183ct6gkhljda.apps.googleusercontent.com'; // Replace this with your actual Google OAuth Client ID

function App() {
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/faculty" element={<FacultyDashboard />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
