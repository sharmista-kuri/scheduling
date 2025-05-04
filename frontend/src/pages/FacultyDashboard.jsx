import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const FacultyDashboard = () => {

  const [facultyCount, setFacultyCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);

  useEffect(() => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    const fid = localStorage.getItem("fid");  // assuming you store fid at login
    axios.get(`${baseURL}/faculty/${fid}/courses/`)
      .then((res) => setCourseCount(res.data.course_count))
      .catch((err) => console.error('Error fetching faculty courses:', err));
  }, []);

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Faculty Dashboard</h1>
        {/* <p>Manage your system effectively and effortlessly.</p> */}
      </header>

      <section className="stats-section">
        <div className="stat-card">
          <h2>Total Assigned Courses</h2>
          <p>{courseCount}</p>
        </div>
      </section>

      <section className="nav-section">
        {[
          // { title: 'Manage Faculty', link: '/admin/faculty' },
          // { title: 'Manage Courses', link: '/admin/courses' },
          // { title: 'Upload CSV', link: '/admin/courses' },
          { title: 'View Courses', link: '/admin/courses' },
          { title: 'Update Profile', link: '/profile' },
          { title: 'Change Password', link: '/change_password' },
          { title: 'Calender', link: '/calendar' },
        ].map((item, i) => (
          <a href={item.link} key={i} className="nav-card">
            <h3>{item.title}</h3>
            <p>Click to view</p>
          </a>
        ))}
      </section>
    </div>
  );
};

export default FacultyDashboard;
