// components/UploadCSVModal.jsx
import React from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const UploadCSVModal = ({ onClose, onSuccess }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      await axios.post(`${baseURL}/upload_csv/`, formData);
      onSuccess(); // Refresh course list
      onClose();   // Close modal
      Swal.fire('Success', 'CSV uploaded successfully!', 'success');
    } catch (err) {
      console.error('CSV Upload Error:', err);
      Swal.fire('Error', 'CSV upload failed.', 'error');
    }
  };

  return (
    <div className="modal show fade d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Upload CSV File</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <input
                type="file"
                name="csvFile"
                accept=".csv"
                className="form-control mb-3"
                required
              />
              <button type="submit" className="btn btn-primary">
                Upload
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadCSVModal;
