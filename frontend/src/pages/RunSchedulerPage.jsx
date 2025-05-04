import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const RunSchedulerPage = () => {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  const runScheduler = async () => {
    setMessage("Running scheduler...");
    try {
      const res = await axios.post(`${baseURL}/run-scheduler/`);
      if (res.data.success) {
        setCourses(res.data.courses);
        setMessage("✅ Scheduling complete.");
      } else {
        setMessage("❌ Failed: " + res.data.error);
      }
    } catch (err) {
      setMessage("❌ Error running scheduler.");
    }
  };

  return (
    <>
    <Navbar onLogout={() => { localStorage.clear(); window.location.href = '/'; }} />
    <div className="container mt-5">
      <h2>🧮 Run Scheduler</h2>
      <button className="btn btn-primary my-3" onClick={runScheduler}>Run</button>
      <p>{message}</p>
      {courses.length > 0 && (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>CRN</th>
              <th>Code</th>
              <th>Days</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c, idx) => (
              <tr key={idx}>
                <td>{c.crn}</td>
                <td>{c.code}</td>
                <td>{c.days.join(', ')}</td>
                <td>{c.start_time}</td>
                <td>{c.end_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    </>
  );
};

export default RunSchedulerPage;
