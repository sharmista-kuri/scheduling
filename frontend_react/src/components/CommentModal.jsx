import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './commentmodal.css';

const CommentModal = ({ course, onClose }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (course) {
      axios.get(`http://localhost/project/backend/api/comments/get_comments.php?crn=${course.CRN}`)
        .then(res => setComments(res.data))
        .catch(err => console.error(err));
    }
  }, [course]);

  const handlePost = async () => {
    const fid = localStorage.getItem('fid');
    if (!commentText.trim()) return;

    try {
      await axios.post('http://localhost/project/backend/api/comments/post_comment.php', {
        crn: course.CRN,
        fid,
        comment_text: commentText
      });
      setCommentText('');
      const res = await axios.get(`http://localhost/project/backend/api/comments/get_comments.php?crn=${course.CRN}`);
      setComments(res.data);
    } catch (err) {
      alert("Failed to post comment");
    }
  };

  if (!course) return null;

  return (
    <div className="modal-overlay">
      <div className="comment-modal-box">
        <div className="d-flex justify-content-between align-items-center">
          <h5>Comments for {course.course_code}</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        <hr />

        <div className="comment-scroll-area">
          {comments.length === 0 && <p className="text-muted">No comments yet.</p>}
          {comments.map((c, i) => (
            <div key={i} className="comment-bubble">
              <div className="comment-header">
                <strong>{c.faculty_name}</strong>
                <span className="text-muted ms-2 small">{new Date(c.time_posted).toLocaleString()}</span>
              </div>
              <div>{c.comment_text}</div>
            </div>
          ))}
        </div>

        <textarea
          className="form-control mt-3"
          rows={2}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
        />
        <button className="btn btn-primary btn-sm mt-2 float-end" onClick={handlePost}>
          Post Comment
        </button>
      </div>
    </div>
  );
};

export default CommentModal;
