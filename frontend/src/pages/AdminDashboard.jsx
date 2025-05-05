import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {

  const [facultyCount, setFacultyCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);

  useEffect(() => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    axios.get(`${baseURL}/admin/total_counts/`)
      .then((res) => {
        setFacultyCount(res.data.faculty_count);
        setCourseCount(res.data.course_count);
      })
      .catch((err) => {
        console.error('Error fetching counts:', err);
      });
  }, []);

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        {/* <p>Manage your system effectively and effortlessly.</p> */}
      </header>

      <section className="stats-section">
        <div className="stat-card">
          <h2>Total Faculty</h2>
          <p>{facultyCount}</p>
        </div>
        <div className="stat-card">
          <h2>Total Courses</h2>
          <p>{courseCount}</p>
        </div>
      </section>

      <section className="nav-section">
        {[
          { title: 'Manage Faculty', link: '/admin/faculty' },
          { title: 'Manage Courses', link: '/admin/courses' },
          { title: 'Manage Configuration', link: '/admin/configuration' },
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

export default AdminDashboard;
