import React from 'react';
import moment from 'moment';

const CourseTable = ({ courses, onEdit, onDelete, onSort, sortConfig }) => {
  const getSortSymbol = (key) => {
    if (sortConfig.key !== key) return ' ⇅';
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };
  const authLevel = localStorage.getItem("auth_level");
  const headerStyle = {
    backgroundColor: '#212529',
    color: '#ffffff',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  };


  return (
    <table className="table table-bordered table-striped align-middle">
      <thead>
        <tr>
          <th onClick={() => onSort('CRN')} style={headerStyle}>
            CRN <span>{getSortSymbol('CRN')}</span>
          </th>
          <th onClick={() => onSort('course_code')} style={headerStyle}>
            Course Code <span>{getSortSymbol('course_code')}</span>
          </th>
          <th onClick={() => onSort('course_name')} style={headerStyle}>
            Title <span>{getSortSymbol('course_name')}</span>
          </th>
          <th onClick={() => onSort('faculty_name')} style={headerStyle}>
            Faculty <span>{getSortSymbol('faculty_name')}</span>
          </th>
          <th onClick={() => onSort('days')} style={headerStyle}>
            Days <span>{getSortSymbol('days')}</span>
          </th>
          <th style={headerStyle}>Time</th>
          <th onClick={() => onSort('duration')} style={headerStyle}>
            Duration <span>{getSortSymbol('duration')}</span>
          </th>
          <th style={headerStyle}>Pinned</th>
          
          
          {authLevel === "admin" && (
            <>
            <th style={headerStyle}>Actions</th>
            </>
          )}
              
        </tr>
      </thead>
      <tbody>
        {courses.length === 0 ? (
          <tr>
            <td colSpan="9" className="text-center">No courses found</td>
          </tr>
        ) : (
          courses.map((course) => (
            <tr key={course.CRN}>
              <td>{course.CRN}</td>
              <td>{course.course_code}</td>
              <td>{course.course_name}</td>
              <td>{course.faculty_name}</td>
              <td>{course.days}</td>
              <td>{moment().startOf('day').add(course.start_time, 'minutes').format('h:mm A')}–
                          {moment().startOf('day').add(course.end_time, 'minutes').format('h:mm A')}</td>
              <td>{course.duration} mins</td>
              <td>{course.is_pinned === 1 ? '✅' : '❌'}</td>
              
              {authLevel === "admin" && (
                <>
                <td>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => onEdit(course)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => onDelete(course.CRN)}>
                    Delete
                  </button>
                </td>
                </>
              )}
              
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default CourseTable;
