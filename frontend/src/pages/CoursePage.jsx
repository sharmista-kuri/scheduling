import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import CourseTable from '../components/CourseTable';
import AddCourseModal from '../components/AddCourseModal';
import UploadCSVModal from '../components/UploadCSVModal';
import Navbar from '../components/Navbar';

const CoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [filters, setFilters] = useState({
    CRN: '',
    title: '',
    code: '',
    faculty: '',
    pinned: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 7;

  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState(null);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const authLevel = localStorage.getItem("auth_level");


  const fetchCourses = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const res = await axios.get(`${baseURL}/courses/`);
      setCourses(res.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = courses.filter((course) => {
      return (
        course.CRN.toString().includes(filters.CRN) &&
        course.course_name.toLowerCase().includes(filters.title.toLowerCase()) &&
        course.course_code.toLowerCase().includes(filters.code.toLowerCase()) &&
        course.faculty_name.toLowerCase().includes(filters.faculty.toLowerCase()) &&
        (filters.pinned === '' ||
          (filters.pinned === 'yes' && course.is_pinned === 1) ||
          (filters.pinned === 'no' && course.is_pinned !== 1))
      );
    });

    if (sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredCourses(filtered);
    setCurrentPage(1); // reset to page 1 when filters/sort change
  }, [courses, filters, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      } else {
        return { key, direction: 'asc' };
      }
    });
  };

  const handleEdit = (course) => {
    setEditCourse(course);
    setShowModal(true);
  };

  const handleDelete = async (crn) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this course?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        await axios.delete(`${baseURL}/course/${crn}/delete/`);
        await fetchCourses();
        Swal.fire('Deleted!', 'The course has been deleted.', 'success');
      } catch (err) {
        console.error('Delete failed:', err);
        Swal.fire('Error', 'Failed to delete the course.', 'error');
      }
    }
  };

  // Pagination logic
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);

  return (
    <>
      <Navbar onLogout={() => { localStorage.clear(); window.location.href = '/'; }} />

      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Course Table</h2>
          {authLevel === "admin" && (
          <>
            <div>
              <button className="btn btn-success me-2" onClick={() => setShowCSVModal(true)}>
                Upload CSV
              </button>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                + Add New Course
              </button>
            </div>
          </>
          )}
        </div>

        {/* Filters */}
        <div className="row mb-3">
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Filter by CRN"
              value={filters.CRN}
              onChange={(e) => setFilters({ ...filters, CRN: e.target.value })}
            />
          </div>
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Filter by Title"
              value={filters.title}
              onChange={(e) => setFilters({ ...filters, title: e.target.value })}
            />
          </div>
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Filter by Code"
              value={filters.code}
              onChange={(e) => setFilters({ ...filters, code: e.target.value })}
            />
          </div>
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Filter by Faculty"
              value={filters.faculty}
              onChange={(e) => setFilters({ ...filters, faculty: e.target.value })}
            />
          </div>
          <div className="col">
            <select
              className="form-select"
              value={filters.pinned}
              onChange={(e) => setFilters({ ...filters, pinned: e.target.value })}
            >
              <option value="">All</option>
              <option value="yes">Pinned</option>
              <option value="no">Not Pinned</option>
            </select>
          </div>
        </div>

        {/* Course Table */}
        <CourseTable
          courses={currentCourses}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSort={handleSort}
          sortConfig={sortConfig}
        />

        {/* Pagination */}
        <div className="d-flex justify-content-center mt-4">
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                ⬅ Prev
              </button>
            </li>

            {[...Array(totalPages)].map((_, i) => (
              <li
                key={i}
                className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
              >
                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}

            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                Next ➡
              </button>
            </li>
          </ul>
        </div>

        {/* Modals */}
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

        {showCSVModal && (
          <UploadCSVModal
            onClose={() => setShowCSVModal(false)}
            onSuccess={fetchCourses}
          />
        )}
      </div>
    </>
  );
};

export default CoursePage;
