import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddCourseModal = ({ onClose, onCourseAdded, editData = null }) => {
  const [formData, setFormData] = useState({
    course_code: '',
    name: '',
    faculty_id: '',
    duration: '',
    start_time: '',
    end_time: '',
    days: [],
    is_pinned: false,
  });

  const [facultyList, setFacultyList] = useState([]);
  const daysList = ['M', 'T', 'W', 'TH', 'F'];

  // Load faculty list once
  useEffect(() => {
    const baseURL = process.env.REACT_APP_API_BASE_URL;
    axios.get(`${baseURL}/faculty/get.php`)
      .then(res => setFacultyList(res.data))
      .catch(err => console.error("Failed to load faculty list", err));
  }, []);

  // Prefill form if editing
  useEffect(() => {
    if (editData) {
      setFormData({
        course_code: editData.course_code,
        name: editData.course_name,
        faculty_id: editData.faculty_id || '',
        duration: editData.duration || '',
        start_time: editData.start_time,
        end_time: editData.end_time,
        days: editData.days?.split(',') || [],
        is_pinned: editData.is_pinned === '1',
      });
    }
  }, [editData]);

  const handleCheckbox = (day) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;

      if (editData) {
        await axios.put(`${baseURL}/courses/update.php`, {
          ...formData,
          crn: editData.CRN,
        });
      } else {
        await axios.post(`${baseURL}/courses/create.php`, formData);
      }
      onCourseAdded();
      onClose();
    } catch (err) {
      alert('Failed to save course');
      console.error(err);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: '#00000099' }}>
      <div className="modal-dialog">
        <form onSubmit={handleSubmit} className="modal-content p-4">
          <h4>{editData ? 'Edit Course' : 'Add New Course'}</h4>

          <input type="text" className="form-control mb-2" placeholder="Course Code"
                 value={formData.course_code}
                 onChange={(e) => setFormData({ ...formData, course_code: e.target.value })} required />

          <input type="text" className="form-control mb-2" placeholder="Course Name"
                 value={formData.name}
                 onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />

          <select className="form-control mb-2"
                  value={formData.faculty_id}
                  onChange={(e) => setFormData({ ...formData, faculty_id: e.target.value })}
                  required>
            <option value="">Select Faculty</option>
            {facultyList.map(faculty => (
              <option key={faculty.fid} value={faculty.fid}>
                {faculty.name}
              </option>
            ))}
          </select>

          <input type="number" className="form-control mb-2" placeholder="Duration (mins)"
                 value={formData.duration}
                 onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />

          <input type="time" className="form-control mb-2"
                 value={formData.start_time}
                 onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} />

          <input type="time" className="form-control mb-2"
                 value={formData.end_time}
                 onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} />

          <div className="mb-2">
            <label>Days:</label><br />
            {daysList.map(day => (
              <label key={day} className="me-2">
                <input type="checkbox"
                       checked={formData.days.includes(day)}
                       onChange={() => handleCheckbox(day)} /> {day}
              </label>
            ))}
          </div>

          <div className="mb-2">
            <label>
              <input type="checkbox"
                     checked={formData.is_pinned}
                     onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })} />
              {' '}Pinned
            </label>
          </div>

          <div className="d-flex justify-content-between">
            <button type="submit" className="btn btn-success">
              {editData ? 'Update Course' : 'Add Course'}
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

export default AddCourseModal;
