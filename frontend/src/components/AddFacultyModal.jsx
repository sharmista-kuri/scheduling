// src/components/AddFacultyModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddFacultyModal = ({ editData, onClose, onFacultyAdded }) => {
  const [name, setName] = useState('');
  const [authLevel, setAuthLevel] = useState('faculty');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');


  useEffect(() => {
    if (editData) {
      setName(editData.NAME);
      setAuthLevel(editData.auth_level);
      setEmail(editData.email);
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    try {
      if (editData) {
        await axios.post(`${baseURL}/faculty/${editData.fid}/update_all/`, {
          name,
          auth_level: authLevel,
          email,
        });
      } else {
        await axios.post(`${baseURL}/faculty/create/`, {
          name,
          auth_level: authLevel,
          email,
          password,
        });
      }
      onFacultyAdded();
      onClose();
    } catch (err) {
      console.error('Error saving faculty:', err);
      setMessage('❌ Failed to save faculty.');
      setMessageType('error');

    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h4>{editData ? 'Edit Faculty' : 'Add New Faculty'}</h4>
        {message && (
          <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!editData}
            />
          </div>
          <div className="mb-3">
            <label>Auth Level</label>
            <select
              name="auth_level"
              className="form-control"
              value={authLevel}
              onChange={(e) => setAuthLevel(e.target.value)}
              required
            >
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {!editData && (
            <div className="mb-3">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}
          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary me-2">
              {editData ? 'Update' : 'Add'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFacultyModal;
