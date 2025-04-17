import React from 'react';

const Navbar = ({ onLogout }) => {
  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <span className="navbar-brand">📅 Course Scheduler</span>
      <a href="/calendar" className="btn btn-outline-secondary btn-sm ms-3">
        View Calendar
      </a>


      <div className="ms-auto d-flex align-items-center">
        <span className="text-light me-3">
          👤 {userName} ({userRole})
        </span>
        <button className="btn btn-outline-light btn-sm" onClick={onLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
