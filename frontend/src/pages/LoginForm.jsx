import React, { useState } from 'react';
import axios from 'axios';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost/project/backend/api/login.php', {
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

  return (
    <form onSubmit={handleLogin}>
      <div className="mb-3">
        <label>Email</label>
        <input type="email" className="form-control"
               value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="mb-3">
        <label>Password</label>
        <input type="password" className="form-control"
               value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button className="btn btn-primary">Login</button>
    </form>
  );
};

export default LoginForm;
