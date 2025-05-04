import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import FacultyTable from '../components/FacultyTable';
import AddFacultyModal from '../components/AddFacultyModal';
import Navbar from '../components/Navbar';

const FacultyPage = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [paginatedFaculty, setPaginatedFaculty] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    auth: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editFaculty, setEditFaculty] = useState(null);

  const fetchFaculty = async () => {
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const res = await axios.get(`${baseURL}/faculty/`);
      setFacultyList(res.data);
    } catch (err) {
      console.error('Error fetching faculty:', err);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  useEffect(() => {
    let filtered = facultyList.filter((f) => {
      return (
        f.NAME.toLowerCase().includes(filters.name.toLowerCase()) &&
        f.email.toLowerCase().includes(filters.email.toLowerCase()) &&
        f.auth_level.toLowerCase().includes(filters.auth.toLowerCase())
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

    setFilteredFaculty(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);
    setPaginatedFaculty(paginated);
  }, [facultyList, filters, sortConfig, currentPage, pageSize]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      } else {
        return { key, direction: 'asc' };
      }
    });
  };

  const handleEdit = (faculty) => {
    setEditFaculty(faculty);
    setShowModal(true);
  };

  const handleDelete = async (fid) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this faculty?',
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
        await axios.delete(`${baseURL}/faculty/${fid}/delete/`);
        await fetchFaculty();
        Swal.fire('Deleted!', 'The faculty has been deleted.', 'success');
      } catch (err) {
        console.error('Delete failed:', err);
        Swal.fire('Error', 'Failed to delete the faculty.', 'error');
      }
    }
  };

  return (
    <>
      <Navbar />

      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Faculty Table</h2>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add New Faculty
          </button>
        </div>

        {/* Filters */}
        <div className="row mb-3">
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Filter by Name"
              value={filters.name}
              onChange={(e) => {
                setCurrentPage(1);
                setFilters({ ...filters, name: e.target.value });
              }}
            />
          </div>
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Filter by Email"
              value={filters.email}
              onChange={(e) => {
                setCurrentPage(1);
                setFilters({ ...filters, email: e.target.value });
              }}
            />
          </div>
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Filter by Auth Level"
              value={filters.auth}
              onChange={(e) => {
                setCurrentPage(1);
                setFilters({ ...filters, auth: e.target.value });
              }}
            />
          </div>
        </div>

        {/* Table */}
        <FacultyTable
          facultyList={paginatedFaculty}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSort={handleSort}
          sortConfig={sortConfig}
        />

        {/* Pagination Controls */}
        <div className="d-flex justify-content-center align-items-center mt-4">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1}>
                  ⬅ Prev
                </button>
              </li>

              {[...Array(totalPages)].map((_, idx) => (
                <li
                  key={idx + 1}
                  className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                </li>
              ))}

              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages}>
                  Next ➡
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Modal */}
        {showModal && (
          <AddFacultyModal
            editData={editFaculty}
            onClose={() => {
              setEditFaculty(null);
              setShowModal(false);
            }}
            onFacultyAdded={fetchFaculty}
          />
        )}
      </div>
    </>
  );
};

export default FacultyPage;
