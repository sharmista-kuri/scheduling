import React, { useState } from 'react';
import axios from 'axios';
import '../pages/modal.css';
import CommentModal from './CommentModal'; 
import moment from 'moment';

const CourseModal = ({ course, onClose, onPinToggle }) => {
  const [loading, setLoading] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const authLevel = localStorage.getItem('auth_level');
  //alert(localStorage.getItem('auth_level'));
  const canModify = authLevel === 'admin';
  if (!course) return null;

  const handlePinToggle = async () => {
    setLoading(true);
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      const newStatus = course.is_pinned === '1' || course.is_pinned === 1 ? 0 : 1 ;
      // alert("hi");
      // Send PUT request to Django endpoint
      await axios.post(`${baseURL}/course/${course.CRN}/update/`, {
        is_pinned: newStatus
      });
  
      // Update local course object and trigger parent refresh
      course.is_pinned = newStatus;
      console.log(newStatus);
      onPinToggle();
    } catch (err) {
      alert('Failed to pin/unpin course');
      console.error(err);
    } finally {
      setLoading(false);
    }
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
          <p><strong>Time:</strong> {moment().startOf('day').add(course.start_time, 'minutes').format('h:mm A')}–
            {moment().startOf('day').add(course.end_time, 'minutes').format('h:mm A')}
          </p>
          <p><strong>Duration:</strong> {course.duration} mins</p>

          <div className="d-flex gap-2 mt-3">
          
          {canModify && (            
            <button
              className="btn btn-warning btn-sm"
              onClick={handlePinToggle}
              disabled={loading}
            >
              {course.is_pinned === '1' || course.is_pinned === 1 ? 'Unpin' : 'Pin'} 📌
            </button>
            )}
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
