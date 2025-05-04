import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import './LoginForm.css'; // Optional: create this CSS file for custom styles

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;

      const res = await axios.post(`${baseURL}/login/`, {
        email,
        password,
      });

      const { role } = res.data;

      localStorage.setItem('userName', res.data.name);
      localStorage.setItem('auth_level', res.data.role);
      localStorage.setItem('userRole', res.data.role);
      localStorage.setItem('fid', res.data.fid);
      localStorage.setItem('isLoggedIn', 'true');

      if (role === 'admin') {
        window.location.href = '/admin';
      } else if (role === 'faculty') {
        window.location.href = '/faculty';
      }
    } catch (err) {
      setMessage('❌ Invalid credentials. Please try again.');
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    const token = credentialResponse.credential;

    try {
      const res = await fetch('http://localhost:8000/api/auth/google/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        alert('Google Login Successful!');
        window.location.href = '/calendar';
      } else {
        setMessage('❌ Google login failed.');
      }
    } catch (error) {
      console.error('Login Error:', error);
      setMessage('❌ Something went wrong during Google login.');
    }
  };

  return (
    <>
      <form onSubmit={handleLogin}>
        <h2 className="text-center mb-4">🔐 Login</h2>

        {message && (
          <div className="status-message mb-3">{message}</div>
        )}

        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label>Password</label>
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button className="btn btn-primary w-100">Login</button>
      </form>

      <hr />
      {/* <div className="text-center mt-3">
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => setMessage('❌ Google Login Failed')}
        />
      </div> */}
    </>
  );
};

export default LoginForm;
