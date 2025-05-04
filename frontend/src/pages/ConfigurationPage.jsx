import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ConfigurationModal from '../components/ConfigurationModal';
import Navbar from '../components/Navbar';
import './modal.css'; // make sure to include this or define styles

const ConfigurationPage = () => {
  const [configs, setConfigs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [resetMessage, setResetMessage] = useState(null);

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
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseURL}/configurations/${id}/`);
      fetchConfigs();
    } catch (err) {
      console.error('Delete failed:', err);
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
          <div>
            <button className="btn btn-primary me-2" onClick={() => setShowModal(true)}>
              + Add Configuration
            </button>
            <button className="btn btn-warning" onClick={() => setShowResetModal(true)}>
              🔁 Reset DB
            </button>
          </div>
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

      {/* Fancy Reset DB Modal */}
      {showResetModal && (
        <div className="modal-overlay">
          <div className="modal-box p-4">
            <h4 className="mb-3 text-danger">⚠️ Confirm Database Reset</h4>
            <p>Type <strong>"RESET"</strong> below to confirm:</p>
            <input
              type="text"
              className="form-control mb-3"
              placeholder='Type "RESET"'
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
            <div className="d-flex justify-content-end">
              <button
                className="btn btn-secondary me-2"
                onClick={() => {
                  setShowResetModal(false);
                  setConfirmText('');
                  setResetMessage(null);
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                disabled={confirmText !== 'RESET'}
                onClick={async () => {
                  try {
                    const res = await axios.post(`${baseURL}/reset-db/`);
                    setResetMessage({ type: 'success', text: res.data.message });
                    fetchConfigs();
                  } catch (err) {
                    setResetMessage({
                      type: 'error',
                      text: err.response?.data?.error || 'Reset failed.',
                    });
                  }
                  setConfirmText('');
                }}
              >
                ✅ Reset Now
              </button>
            </div>
            {resetMessage && (
              <div className={`alert mt-3 alert-${resetMessage.type === 'success' ? 'success' : 'danger'}`}>
                {resetMessage.text}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ConfigurationPage;
