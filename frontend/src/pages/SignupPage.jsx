import React, { useState } from 'react';
import axios from 'axios';

const SignupPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    auth_level: 'faculty',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const res = await axios.post(`${baseURL}/signup/`, form);
      const { role } = res.data;
      localStorage.setItem('userName', res.data.name);
      localStorage.setItem('userRole', res.data.role);
      localStorage.setItem('fid', res.data.fid);
      if (role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/faculty';
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Signup failed.');
    }
  };

  return (
    <div className="d-flex vh-100 align-items-center justify-content-center bg-light">
      <div className="card p-4 shadow" style={{ width: '400px' }}>
        <h4 className="text-center mb-3">Faculty Signup</h4>
        <form onSubmit={handleSignup}>
          <input type="text" name="name" className="form-control mb-3" placeholder="Full Name"
            onChange={handleChange} required />
          <input type="email" name="email" className="form-control mb-3" placeholder="Email"
            onChange={handleChange} required />
          <input type="password" name="password" className="form-control mb-3" placeholder="Password"
            onChange={handleChange} required />
          <select name="auth_level" className="form-control mb-3" onChange={handleChange}>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>
          <button className="btn btn-success w-100">Sign Up</button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
