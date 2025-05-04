import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './commentmodal.css';
import { toast } from 'react-toastify';
import EmojiPicker from 'emoji-picker-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Swal from 'sweetalert2';

const baseURL = process.env.REACT_APP_API_BASE_URL;

const CommentModal = ({ course, onClose }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editingCid, setEditingCid] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [showAddEmojiPicker, setShowAddEmojiPicker] = useState(false);
  const [showEditEmojiPickerCid, setShowEditEmojiPickerCid] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const currentFid = localStorage.getItem('fid');
  const authLevel = localStorage.getItem('auth_level');

  const fetchComments = useCallback(async (pg = 1, reset = false) => {
    try {
      const res = await axios.get(`${baseURL}/comments/${course.CRN}`);
      if (reset) {
        setComments(res.data);
      } else {
        setComments(prev => [...prev, ...res.data]);
      }
      setHasMore(res.data.length >= 10);
      setPage(pg + 1);
    } catch (err) {
      toast.error("Failed to load comments");
    }
  }, [course.CRN]);

  useEffect(() => {
    if (course) {
      fetchComments(1, true);
    }
  }, [course, fetchComments]);

  const handlePost = async () => {
    if (!commentText.trim()) return;
    try {
      await axios.post(`${baseURL}/comment/`, {
        crn: course.CRN,
        fid: currentFid,
        text: commentText
      });
      toast.success("Comment posted");
      setCommentText('');
      setShowAddEmojiPicker(false);
      fetchComments(1, true);
      setPage(2);
    } catch (err) {
      toast.error("Failed to post comment");
    }
  };

  const handleDelete = async (cid) => {
    const confirm = await Swal.fire({
      title: 'Delete comment?',
      text: 'Are you sure you want to delete this comment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.post(`${baseURL}/comment/${cid}/delete/`, {
        fid: currentFid
      });
      toast.success("Comment deleted");
      fetchComments(1, true);
      setPage(2);
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleEdit = (cid, text) => {
    setEditingCid(cid);
    setEditingText(text);
    setShowEditEmojiPickerCid(null);
  };

  const handleUpdate = async (cid) => {
    if (!editingText.trim()) return;
    try {
      await axios.post(`${baseURL}/comment/${cid}/edit/`, {
        cid,
        fid: currentFid,
        text: editingText
      });
      toast.success("Comment updated");
      setEditingCid(null);
      setShowEditEmojiPickerCid(null);
      fetchComments(1, true);
      setPage(2);
    } catch (err) {
      toast.error("Failed to update comment");
    }
  };

  const handleEmojiClick = (emojiData) => {
    setCommentText(prev => prev + emojiData.emoji);
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

        <div className="comment-scroll-area" id="comment-scroll">
          <InfiniteScroll
            dataLength={comments.length}
            next={() => fetchComments(page)}
            hasMore={hasMore}
            loader={<p className="text-center">Loading...</p>}
            scrollableTarget="comment-scroll"
          >
            {comments.length === 0 && <p className="text-muted">No comments yet.</p>}
            {comments.map((c, i) => {
              const canModify = String(c.fid) === currentFid || authLevel === 'admin';
              return (
                <div key={i} className="comment-bubble">
                  <div className="comment-header d-flex justify-content-between">
                    <div>
                      <strong>{c.faculty_name}</strong>
                      <span className="text-muted ms-2 small">
                        {new Date(c.time_posted).toLocaleString()}
                      </span>
                    </div>
                    {canModify && (
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => handleEdit(c.cid, c.comment_text)}>Edit ✏️</button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => handleDelete(c.cid)}>Delete 🗑️</button>
                      </div>
                    )}
                  </div>
                  {editingCid === c.cid ? (
                    <>
                      <textarea
                        className="form-control my-1"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        rows={2}
                      />
                      <div className="d-flex gap-2 align-items-start">
                        <button
                          className="btn btn-sm btn-light"
                          onClick={() => setShowEditEmojiPickerCid(prev => prev === c.cid ? null : c.cid)}
                        >😄</button>
                        <button className="btn btn-success btn-sm" onClick={() => handleUpdate(c.cid)}>💾 Save</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingCid(null)}>Cancel</button>
                      </div>
                      {showEditEmojiPickerCid === c.cid && (
                        <div className="mt-2">
                          <EmojiPicker onEmojiClick={(e) => setEditingText(prev => prev + e.emoji)} height={300} />
                        </div>
                      )}
                    </>
                  ) : (
                    <div>{c.comment_text}</div>
                  )}
                </div>
              );
            })}
          </InfiniteScroll>
        </div>

        <div className="d-flex gap-2 align-items-start mt-3">
          <textarea
            className="form-control"
            rows={2}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
          />
          <div>
            <button className="btn btn-sm btn-light" onClick={() => setShowAddEmojiPicker(prev => !prev)}>😄</button>
            {showAddEmojiPicker && (
              <div className="mt-2">
                <EmojiPicker onEmojiClick={handleEmojiClick} height={300} />
              </div>
            )}
            <button className="btn btn-primary btn-sm mt-2" onClick={handlePost}>Post</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;