import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ConfigurationModal from '../components/ConfigurationModal';
import Navbar from '../components/Navbar';

const ConfigurationPage = () => {
  const [configs, setConfigs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  const fetchConfigs = useCallback(async () => {
    const res = await axios.get(`${baseURL}/configurations/`);
    setConfigs(res.data);
  }, [baseURL]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleSave = async (formData) => {
    try {
      if (editData) {
        await axios.put(`${baseURL}/configurations/${editData.config_id}/`, formData);
      } else {
        await axios.post(`${baseURL}/configurations/create/`, formData);
      }
      setShowModal(false);
      setEditData(null);
      fetchConfigs();
    } catch (err) {
      console.error('Save failed:', err);
      alert('Error saving configuration');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseURL}/configurations/${id}/`);
      fetchConfigs();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Error deleting configuration');
    }
  };

  const handleEdit = (config) => {
    setEditData(config);
    setShowModal(true);
  };

  return (
    <>
    <Navbar onLogout={() => { localStorage.clear(); window.location.href = '/'; }} />
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
      <h2>Configurations</h2>
      <button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>
        + Add Configuration
      </button>
      </div>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Travel Time</th>
            <th>Preferred Days</th>
            <th>Start Times</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {configs.map((cfg) => (
            <tr key={cfg.config_id}>
              <td>{cfg.config_id}</td>
              <td>{cfg.travel_time}</td>
              <td>{cfg.days.join(', ')}</td>
              <td>{cfg.times.join(', ')}</td>
              <td>
                <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(cfg)}>
                  Edit
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(cfg.config_id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Add/Edit */}
      <ConfigurationModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditData(null);
        }}
        onSubmit={handleSave}
        editData={editData}
      />
    </div>
    </>
  );
};

export default ConfigurationPage;
