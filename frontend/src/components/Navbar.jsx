import React, { useState } from 'react';
import defaultPic from '../assets/profile.png'; // Replace with your actual image path

const Navbar = ({ onLogout }) => {
  const userName = localStorage.getItem('userName') || "User";
  const userRole = localStorage.getItem('userRole') || "faculty";
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

          {userRole === "faculty" && (
            <>
              <a href="/faculty/" className="navbar-brand mb-0 fs-5">📅 Course Scheduler</a>
            </>
          )}
          
          {userRole === "admin" && (
            <>
              <a href="/admin/" className="navbar-brand mb-0 fs-5">📅 Course Scheduler</a>
              <a href="/admin/faculty" className="btn btn-outline-light btn-sm">
                 Faculty
              </a>
              <a href="/admin/courses" className="btn btn-outline-light btn-sm">
                 Course
              </a>
              <a href="/admin/configuration" className="btn btn-outline-light btn-sm">
                 Configuration
              </a>
              <a href="/generate/" className="btn btn-outline-light btn-sm">
                Generate Schedule
              </a>

            </>
          )}

          <a href="/calendar" className="btn btn-outline-light btn-sm">
             Calendar
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
              <a className="dropdown-item" href="/change_password">Change Password</a>
              <div className="dropdown-divider"></div>
              <a className="dropdown-item text-danger" href="/logout">Logout</a>
              {/* <button className="dropdown-item text-danger" onClick={onLogout}>
                Logout
              </button> */}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
