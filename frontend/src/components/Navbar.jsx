import React, { useState } from 'react';
import defaultPic from '../assets/profile.png'; // Replace with your actual image path

const Navbar = ({ onLogout }) => {
  const userName = localStorage.getItem('userName') || "User";
  const userRole = localStorage.getItem('userRole') || "Guest";
//   const defaultPic = localStorage.getItem('userPic');

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        {/* Left side: Brand + View Calendar */}
        <div className="d-flex align-items-center gap-3">
          <span className="navbar-brand mb-0 fs-5">📅 Course Scheduler</span>
          <a href="/calendar" className="btn btn-outline-light btn-sm">
            View Faculty
          </a>
          <a href="/calendar" className="btn btn-outline-light btn-sm">
            View Calendar
          </a>
        </div>

        {/* Right side: Profile dropdown */}
        <div className="d-flex align-items-center position-relative">
          <div
            className="d-flex align-items-center cursor-pointer"
            onClick={toggleDropdown}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={defaultPic}
              alt="profile"
              className="rounded-circle me-2"
              style={{ width: '36px', height: '36px', objectFit: 'cover' }}
            />
            <span className="text-light">{userName}</span>
          </div>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              className={`dropdown-menu dropdown-menu-end mt-2 fade-slide ${dropdownOpen ? "show" : ""}`}
              style={{ right: 0, position: 'absolute', top: '100%' }}
            >
              <h6 className="dropdown-header">{userName} ({userRole})</h6>
              <a className="dropdown-item" href="/profile">Profile</a>
              <a className="dropdown-item" href="/settings">Settings</a>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item text-danger" onClick={onLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
