import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CourseTable from '../components/CourseTable';
import AddCourseModal from '../components/AddCourseModal';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);


  // Fetch all courses from the backend
  const fetchCourses = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const res = await axios.get(`${baseURL}/courses/get.php`);
      setCourses(res.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Clear session and redirect on logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const handleEdit = (course) => {
    setEditCourse(course);
    setShowModal(true);
  };
  
  const handleDelete = async (crn) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        await axios.delete(`${baseURL}/courses/delete.php?crn=${crn}`);
        fetchCourses();
      } catch (err) {
        console.error('Delete failed:', err);
        alert('Failed to delete course');
      }
    }
  };
  

  return (
    <>
      {/* Global navbar */}
      <Navbar onLogout={handleLogout} />

      {/* Page content */}
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Admin Dashboard</h2>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add New Course
          </button>
        </div>

        {/* Table displaying all courses */}
        <CourseTable
          courses={courses}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />


        {/* Add course modal */}
        {showModal && (
          <AddCourseModal
            editData={editCourse}
            onClose={() => {
              setEditCourse(null);
              setShowModal(false);
            }}
            onCourseAdded={fetchCourses}
          />
        )}

      </div>
    </>
  );
};

export default AdminDashboard;
