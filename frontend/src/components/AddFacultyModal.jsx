// src/components/AddFacultyModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddFacultyModal = ({ editData, onClose, onFacultyAdded }) => {
  const [name, setName] = useState('');
  const [authLevel, setAuthLevel] = useState('faculty');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const isEditing = !!editData;

  useEffect(() => {
    if (isEditing) {
      setName(editData.NAME);
      setAuthLevel(editData.auth_level);
      setEmail(editData.email);
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const baseURL = process.env.REACT_APP_API_BASE_URL;

    try {
      if (isEditing) {
        const updateData = {
          name,
          auth_level: authLevel,
          email,
        };
        if (password.trim()) {
          updateData.password = password;
        }
        await axios.post(`${baseURL}/faculty/${editData.fid}/update_all/`, updateData);
      } else {
        await axios.post(`${baseURL}/faculty/create/`, {
          name,
          auth_level: authLevel,
          email,
          password,
        });
      }

      setMessage(isEditing ? '✅ Faculty account updated successfully!' : '✅ Faculty account created successfully!');
      setMessageType('success');

      // Wait 1.5 seconds to show the success message before closing
      setTimeout(() => {
        onFacultyAdded();
        onClose();
      }, 4500);
    } catch (err) {
      console.error('Error saving faculty:', err);
      setMessage('❌ Failed to save faculty.');
      setMessageType('error');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h4>{isEditing ? 'Update Faculty Account' : 'Create Faculty Account'}</h4>

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
              disabled={isEditing}
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

          <div className="mb-3">
            <label>{isEditing ? 'Change Password (optional)' : 'Set Password'}</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditing ? 'Leave blank to keep current password' : ''}
                {...(!isEditing && { required: true })}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                style={{ fontSize: '1.2rem' }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary me-2">
              {isEditing ? 'Update' : 'Create'}
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
