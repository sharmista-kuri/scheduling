import React, { useState } from 'react';
import axios from 'axios';
import '../pages/modal.css';
import CommentModal from './CommentModal'; 

const CourseModal = ({ course, onClose, onPinToggle }) => {
  const [loading, setLoading] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  if (!course) return null;

  const handlePinToggle = async () => {
    setLoading(true);
    try {
      const newStatus = course.is_pinned === '1' ? '0' : '1';
      await axios.put('http://localhost/project/backend/api/courses/update.php', {
        crn: course.CRN,
        is_pinned: newStatus
      });
      course.is_pinned = newStatus;
      onPinToggle(); // refresh parent state
    } catch (err) {
      alert('Failed to pin/unpin course');
    }
    setLoading(false);
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-box">
          <h4>{course.course_code} – {course.course_name}</h4>
          <hr />
          <p><strong>CRN:</strong> {course.CRN}</p>
          <p><strong>Faculty:</strong> {course.faculty_name}</p>
          <p><strong>Days:</strong> {course.days}</p>
          <p><strong>Time:</strong> {course.start_time} – {course.end_time}</p>
          <p><strong>Duration:</strong> {course.duration} mins</p>

          <div className="d-flex gap-2 mt-3">
            <button
              className="btn btn-warning btn-sm"
              onClick={handlePinToggle}
              disabled={loading}
            >
              {course.is_pinned === '1' ? 'Unpin' : 'Pin'} 📌
            </button>

            <button
              className="btn btn-info btn-sm"
              onClick={() => setShowCommentModal(true)}
            >
              💬 Comments
            </button>

            <button className="btn btn-secondary btn-sm ms-auto" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <CommentModal
          course={course}
          onClose={() => setShowCommentModal(false)}
        />
      )}
    </>
  );
};

export default CourseModal;
