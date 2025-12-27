import React, { useState } from 'react';
import '../../styles/CommentSection.css';

function CommentSection({ postId, comments = [], onAddComment, onDeleteComment, currentUserId }) {
  const [commentText, setCommentText] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    await onAddComment(postId, commentText);
    setCommentText('');
  };

  return (
    <div className="comment-section">
      <div className="comment-stats">
        <span>{comments.length} comments</span>
      </div>

      <div className="comment-form" style={{ display: showCommentForm ? 'block' : 'none' }}>
        <textarea
          placeholder="What do you think?"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          maxLength={280}
          style={{
            width: '100%',
            padding: 12,
            backgroundColor: '#192734',
            color: '#fff',
            border: '1px solid #38444d',
            borderRadius: 4,
            fontFamily: 'inherit',
            fontSize: 13,
            marginBottom: 8,
            resize: 'vertical'
          }}
        />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={() => {
              setShowCommentForm(false);
              setCommentText('');
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: 'transparent',
              color: '#1d9bf0',
              border: '1px solid #1d9bf0',
              borderRadius: 20,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitComment}
            disabled={!commentText.trim()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1d9bf0',
              color: '#000',
              border: 'none',
              borderRadius: 20,
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
              opacity: commentText.trim() ? 1 : 0.5
            }}
          >
            Comment
          </button>
        </div>
      </div>

      {!showCommentForm && (
        <button
          onClick={() => setShowCommentForm(true)}
          style={{
            width: '100%',
            padding: 12,
            backgroundColor: 'transparent',
            color: '#71767b',
            border: '1px solid #38444d',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 13
          }}
        >
          Add a comment...
        </button>
      )}

      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment._id} className="comment-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div>
                <strong>{comment.author?.username || 'Anonymous'}</strong>
                <span style={{ color: '#71767b', fontSize: 12, marginLeft: 8 }}>
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              {currentUserId === comment.author?._id && (
                <button
                  onClick={() => onDeleteComment(postId, comment._id)}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#f4245e',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  Delete
                </button>
              )}
            </div>
            <p style={{ color: '#e1e8ed', fontSize: 13, margin: 0 }}>{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CommentSection;
