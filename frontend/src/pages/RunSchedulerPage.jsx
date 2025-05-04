import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const RunSchedulerPage = () => {
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');
  const [seed, setSeed] = useState('');
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  const runScheduler = async () => {
    setMessage("Running scheduler...");
    try {
      const res = await axios.post(`${baseURL}/run-scheduler/`, {
        seed: seed.trim() === '' ? null : seed.trim()
      });
      if (res.data.success) {
        setCourses(res.data.courses);
        setMessage(`✅ Scheduling complete (Seed used: ${res.data.seed}).\n` + res.data.log);
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
        <div className="d-flex gap-2 my-3">
          <input
            type="text"
            className="form-control"
            placeholder="Seed (optional)"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            style={{ maxWidth: '200px' }}
          />
          <button className="btn btn-primary" onClick={runScheduler}>Run</button>
        </div>
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
