import React from 'react';
import LoginForm from '../pages/LoginForm';

const LoginPage = () => {
  return (
    <div className="d-flex vh-100 align-items-center justify-content-center bg-light">
      <div className="card p-4 shadow" style={{ width: '400px' }}>
        <h4 className="text-center mb-3">Faculty Login</h4>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
