import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import './ChangePassword.css';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState('');


  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage('⚠️ All fields are required.');
      setMessageType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('❌ New passwords do not match.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const userId = localStorage.getItem('fid');
      const baseURL = process.env.REACT_APP_API_BASE_URL;

      const response = await axios.post(`${baseURL}/change_password/`, {
        user_id: userId,
        old_password: oldPassword,
        new_password: newPassword,
      });
      

      const data = await response.data;

      if (data.success) {
        setMessage('✅ Password changed successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setMessageType('success');
      } else {
        setMessage(`❌ ${data.message || 'Password change failed.'}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage('❌ Server error. Please try again later.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="change-password-container">
        <h2>🔒 Change Password</h2>

        {message && <div className={`status-message ${messageType}`}>{message}</div>}

        <form onSubmit={handleChangePassword} className="change-password-form">
          <div className="form-group">
            <label>Current Password</label>
            <div className="input-group">
              <input
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter your current password"
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>New Password</label>
            <div className="input-group">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter a new password"
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="input-group">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </>
  );
};

export default ChangePassword;
