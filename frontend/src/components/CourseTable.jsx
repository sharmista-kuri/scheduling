import React from 'react';

const CourseTable = ({ courses, onEdit, onDelete }) => {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-bordered align-middle">
        <thead className="table-dark">
          <tr>
            <th>CRN</th>
            <th>Code</th>
            <th>Course Name</th>
            <th>Faculty</th>
            <th>Days</th>
            <th>Time</th>
            <th>Pinned</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.length > 0 ? (
            courses.map(course => (
              <tr key={course.CRN}>
                <td>{course.CRN}</td>
                <td>{course.course_code}</td>
                <td>{course.course_name}</td>
                <td>{course.faculty_name}</td>
                <td>{course.days}</td>
                <td>{course.start_time} - {course.end_time}</td>
                <td>{course.is_pinned === '1' ? '✅' : '❌'}</td>
                <td>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => onEdit(course)}>
                    Edit
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => onDelete(course.CRN)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">No courses found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CourseTable;
