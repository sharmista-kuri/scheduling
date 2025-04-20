import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './commentmodal.css';
import { toast } from 'react-toastify';
import EmojiPicker from 'emoji-picker-react';
import InfiniteScroll from 'react-infinite-scroll-component';

const baseURL = process.env.REACT_APP_API_BASE_URL;

const CommentModal = ({ course, onClose }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [editingCid, setEditingCid] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const currentFid = localStorage.getItem('fid');
  const authLevel = localStorage.getItem('auth_level');



  const fetchComments = useCallback(async (pg = 1, reset = false) => {
    try {
      const res = await axios.get(`${baseURL}/comments/get_comments.php?crn=${course.CRN}&page=${pg}`);
      if (reset) {
        setComments(res.data);
      } else {
        setComments(prev => [...prev, ...res.data]);
      }
      setHasMore(res.data.length >= 10); // if less than 10, assume no more
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
      await axios.post(`${baseURL}/comments/post_comment.php`, {
        crn: course.CRN,
        fid: currentFid,
        comment_text: commentText
      });
      toast.success("Comment posted");
      setCommentText('');
      fetchComments(1, true);
      setPage(2);
    } catch (err) {
      toast.error("Failed to post comment");
    }
  };

  const handleDelete = async (cid) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await axios.delete(`${baseURL}/comments/delete_comment.php`, {
        data: { cid, fid: currentFid }
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
  };

  const handleUpdate = async (cid) => {
    if (!editingText.trim()) return;
    try {
      await axios.put(`${baseURL}/comments/edit_comment.php`, {
        cid,
        fid: currentFid,
        comment_text: editingText
      });
      toast.success("Comment updated");
      setEditingCid(null);
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
              // console.log(`Comment ${i}:`, c.fid);
              // console.log(currentFid);
              const canModify = String(c.fid) === currentFid || authLevel === 'admin';
              // console.log(canModify);
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
                      <div className="d-flex gap-2">
                        <button className="btn btn-success btn-sm" onClick={() => handleUpdate(c.cid)}>💾 Save</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditingCid(null)}>Cancel</button>
                      </div>
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
            <button className="btn btn-sm btn-light" onClick={() => setShowEmojiPicker(prev => !prev)}>😄</button>
            {showEmojiPicker && (
              <div className="mt-2">
                <EmojiPicker onEmojiClick={handleEmojiClick} height={300} />
              </div>
            )}
            <button className="btn btn-primary btn-sm mt-2" onClick={handlePost}>
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
