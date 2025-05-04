import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import Swal from 'sweetalert2';

const AddCourseModal = ({ onClose, onCourseAdded, editData = null }) => {
  const [formData, setFormData] = useState({
    crn: '', 
    course_code: '',
    name: '',
    faculty_id: null,
    duration: '',
    start_time: '',
    end_time: '',
    days: [],
    is_pinned: false,
    prereqs: [],
    coreqs: [],
  });

  const [facultyList, setFacultyList] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const daysList = ['M', 'T', 'W', 'TH', 'F'];

  function minutesToTimeString(minutes) {
    if (minutes === null || minutes === undefined || isNaN(minutes)) return '';
    const hrs = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}`;
  }
  
  // function timeStringToMinutes(str) {
  //   if (!str) return null;
  //   const [h, m] = str.split(':');
  //   return parseInt(h) * 60 + parseInt(m);
  // }
  

  const baseURL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    axios.get(`${baseURL}/faculty/`)
      .then(res => {
        setFacultyList(res.data);
      })
      .catch(err => console.error("Failed to load faculty list", err));

      axios.get(`${baseURL}/courses/`)
      .then(res => {
        console.log(res.data);     // ✅ show raw course list
        setAllCourses(res.data);   // update state
      })
      .catch(err => {
        console.error(err);        // ❌ log any error
      });
  }, [baseURL]);

  useEffect(() => {
    if (editData) {
      setFormData(prev => ({
        ...prev,
        crn: editData.CRN || '',
        course_code: editData.course_code,
        name: editData.course_name,
        faculty_id: editData.faculty_id || '',
        duration: editData.duration || '',
        start_time: minutesToTimeString(editData.start_time),
        end_time: minutesToTimeString(editData.end_time),

        days: editData.days?.split(',') || [],
        is_pinned: editData.is_pinned === 1 || editData.is_pinned === '1',

      }));
      
      axios.get(`${baseURL}/course/${editData.CRN}/relations/`)
        .then(res => {
          setFormData(prev => ({
            ...prev,
            prereqs: res.data.prereqs || [],
            coreqs: res.data.coreqs || [],
          }));
        });
    }
  }, [editData, baseURL]);

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
    e.preventDefault();

    // 🧪 Validate CRN
    if (!editData) {
      const crnValue = formData.crn;
      if (!crnValue || isNaN(crnValue) || !Number.isInteger(Number(crnValue))) {
        Swal.fire('Invalid CRN', 'CRN must be an integer.', 'error');
        return;
      }
    }
    try {
      if (editData) {
        await axios.post(`${baseURL}/course/${editData.CRN}/update/`, {
          ...formData
        });
        Swal.fire('Success', 'Course updated successfully!', 'success');
      } else {
        await axios.post(`${baseURL}/course/create/`, formData);
        Swal.fire('Success', 'Course added successfully!', 'success');
      }
      onCourseAdded();
      onClose();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save course.', 'error');
    }
  };

  const availableCourses = allCourses.filter(course =>
    !editData || course.CRN !== editData.CRN
  );

  const courseOptions = availableCourses.map(course => ({
    value: course.CRN,
    label: `${course.course_code} - ${course.course_name}`,
  }));

  const facultyOptions = facultyList.map(faculty => ({
    value: faculty.fid,
    label: faculty.NAME,
  }));

  return (
    <div className="modal show d-block" style={{ backgroundColor: '#00000099' }}>
      <div className="modal-dialog">
        <form onSubmit={handleSubmit} className="modal-content p-4">
          <h4>{editData ? 'Edit Course' : 'Add New Course'}</h4>

          <label className="form-label">CRN</label>
            <input type="text" className="form-control mb-2"
              value={formData.crn}
              onChange={(e) => setFormData({ ...formData, crn: e.target.value })}
              required={!editData}  // only required if adding
              disabled={!!editData} // disable if editing
            />


          <label className="form-label">Course Code</label>
          <input type="text" className="form-control mb-2"
            value={formData.course_code}
            onChange={(e) => setFormData({ ...formData, course_code: e.target.value })} required />

          <label className="form-label">Course Name</label>
          <input type="text" className="form-control mb-2"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />

          <label className="form-label">Faculty</label>
          <Select
            className="mb-2"
            options={facultyOptions}
            value={
              facultyOptions.find(
                opt => String(opt.value) === String(formData.faculty_id)
              ) || null
            }
            onChange={(selected) =>
              setFormData({ ...formData, faculty_id: selected ? selected.value : null })
            }
          />

          <label className="form-label">Duration (mins)</label>
          <input type="number" className="form-control mb-2"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })} />

          <label className="form-label">Start Time</label>
          <input type="time" className="form-control mb-2"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} />

          <label className="form-label">End Time</label>
          <input type="time" className="form-control mb-2"
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} />

          <label className="form-label">Days</label>
          <div className="mb-2">
            {daysList.map(day => (
              <label key={day} className="me-2">
                <input type="checkbox"
                  checked={formData.days.includes(day)}
                  onChange={() => handleCheckbox(day)} /> {day}
              </label>
            ))}
          </div>

          <div className="mb-2">
            <label className="form-label">
              <input type="checkbox"
                checked={formData.is_pinned}
                onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })} />
              {' '}Pinned
            </label>
          </div>

          <label className="form-label">Pre-requisites</label>
          <Select
            isMulti
            className="mb-2"
            options={courseOptions}
            value={formData.prereqs.map(val => {
              const match = courseOptions.find(opt => opt.value === val);
              return match || { value: val, label: `Unknown (${val})` };
            })}
            onChange={(selected) =>
              setFormData({ ...formData, prereqs: selected.map(opt => opt.value) })
            }
          />

          <label className="form-label">Co-requisites</label>
          <Select
            isMulti
            className="mb-3"
            options={courseOptions}
            value={formData.coreqs.map(val => {
              const match = courseOptions.find(opt => opt.value === val);
              return match || { value: val, label: `Unknown (${val})` };
            })}
            onChange={(selected) =>
              setFormData({ ...formData, coreqs: selected.map(opt => opt.value) })
            }
          />

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
