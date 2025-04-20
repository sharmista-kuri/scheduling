import React, { useState } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;

      const res = await axios.post(`${baseURL}/login.php`, {
        email,
        password
      });

      const { role } = res.data;

      localStorage.setItem('userName', res.data.name);
      localStorage.setItem('userRole', res.data.role);
      localStorage.setItem('fid', res.data.fid);

      if (role === 'admin') {
        window.location.href = '/admin';
      } else if (role === 'faculty') {
        window.location.href = '/faculty';
      }
    } catch (err) {
      alert('Invalid credentials');
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    const token = credentialResponse.credential;

    try {
      const res = await fetch('http://localhost:8000/api/auth/google/', {
      // const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/google/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);
        alert('Google Login Successful!');

        // Redirect — customize this if you want role-based logic later
        window.location.href = '/calendar';
      } else {
        alert('Google Login Failed');
      }
    } catch (error) {
      console.error('Login Error:', error);
      alert('Something went wrong during Google login');
    }
  };

  return (
    <>
      <form onSubmit={handleLogin}>
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
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="btn btn-primary w-100">Login</button>
      </form>

      <hr />
      <div className="text-center mt-3">
        {/* <p>Or sign in with Google</p> */}
        <GoogleLogin
          onSuccess={handleGoogleLogin}
          onError={() => console.log('Google Login Failed')}
        />
      </div>
    </>
  );
};

export default LoginForm;
