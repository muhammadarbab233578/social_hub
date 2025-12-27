import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/PostThread.css';
import CommentSection from './CommentSection';
import { getMediaUrl } from '../../utils/media';

function PostThread({ post, currentUserId, onLike, onDelete, showDeleteBtn = false }) {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(post.likes.some(like => like._id === currentUserId));
  const [likeCount, setLikeCount] = useState(post.likes.length);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);

  const API_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const handleLike = async () => {
    try {
      const response = await fetch(`${API_URL}/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount(newIsLiked ? likeCount + 1 : likeCount - 1);
        if (onLike) onLike(post._id, newIsLiked);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (postId, content) => {
    try {
      const res = await fetch(`${API_URL}/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });

      const data = await res.json();
      if (data.success) {
        const newComment = data.comment;
        setComments([...comments, newComment]);
      }
    } catch (err) {
      console.error('Comment error', err);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      const res = await fetch(`${API_URL}/posts/${postId}/comment/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (data.success) {
        setComments(comments.filter(c => c._id !== commentId));
      }
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diff = now - postDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <div className="post-thread">
      <div
        className="post-avatar"
        onClick={() => navigate(`/profile/${post.author._id}`)}
        style={{
          backgroundImage: post.author.profilePicture ? `url(${getMediaUrl(post.author.profilePicture)})` : '',
          backgroundColor: '#333'
        }}
        aria-label={`${post.author.username} avatar`}
      >
        {!post.author.profilePicture && post.author.username?.charAt(0)?.toUpperCase()}
      </div>

      <div className="post-content">
        <div className="post-header">
          <button className="post-author" onClick={() => navigate(`/profile/${post.author._id}`)}>
            <span className="author-name">{post.author.username}</span>
          </button>
          <span className="post-time">{formatDate(post.createdAt)}</span>
          {showDeleteBtn && (
            <button className="delete-chip" onClick={onDelete}>Delete</button>
          )}
        </div>

        <p className="post-text">{post.content}</p>

        {post.image && (
          <div className="post-image">
            <img src={getMediaUrl(post.image)} alt="post" />
          </div>
        )}

        {post.media && post.media.length > 0 && (
          <div className="post-media">
            {post.media.map((media, idx) => {
              const mediaPath = typeof media === 'string' ? media : media.path || media.url || '';
              const isVideo = mediaPath.endsWith('.mp4') || mediaPath.endsWith('.webm') || mediaPath.endsWith('.ogg');
              return (
                <div key={idx} className={`post-image ${isVideo ? 'video' : ''}`}>
                  {isVideo ? (
                    <>
                      <video width="100%" height="300" controls muted>
                        <source src={getMediaUrl(mediaPath)} />
                      </video>
                      <span className="video-mute-icon" aria-hidden>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6 9H4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2l4 3V6L6 9z" fill="#111" stroke="#f5f5f5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M15 9.5a3.5 3.5 0 0 1 0 5" stroke="#f5f5f5" strokeWidth="1.2" strokeLinecap="round" />
                        </svg>
                      </span>
                    </>
                  ) : (
                    <img src={getMediaUrl(mediaPath)} alt={`media-${idx}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="post-actions">
          <button
            className={`action-btn like-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
            aria-label="Like"
          >
            {isLiked ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.8 9.6c0 5.2-8.8 11-8.8 11S3.2 14.8 3.2 9.6A4.4 4.4 0 0 1 7.6 5.2c1.4 0 2.8.7 3.4 1.8.6-1.1 2-1.8 3.4-1.8a4.4 4.4 0 0 1 4.4 4.4z" fill="#f91880" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.8 9.6c0 5.2-8.8 11-8.8 11S3.2 14.8 3.2 9.6A4.4 4.4 0 0 1 7.6 5.2c1.4 0 2.8.7 3.4 1.8.6-1.1 2-1.8 3.4-1.8a4.4 4.4 0 0 1 4.4 4.4z" stroke="#c2c6cc" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            <span className="action-count">{likeCount}</span>
          </button>

          <button
            className="action-btn comment-btn"
            aria-label="Comment"
            onClick={() => setShowComments(!showComments)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 19l-3 3V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5z" stroke="#c2c6cc" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="action-count">{comments.length}</span>
          </button>

          <button className="action-btn repost-btn" aria-label="Repost">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 17H5a2 2 0 0 1-2-2V9" stroke="#c2c6cc" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1 9l4 4 4-4" stroke="#c2c6cc" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 7h3a2 2 0 0 1 2 2v6" stroke="#c2c6cc" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M23 15l-4-4-4 4" stroke="#c2c6cc" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="action-count">0</span>
          </button>

          <button className="action-btn share-btn" aria-label="Share">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" stroke="#c2c6cc" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 3v14" stroke="#c2c6cc" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 7l4-4 4 4" stroke="#c2c6cc" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {showComments && (
          <CommentSection
            postId={post._id}
            comments={comments}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </div>
  );
}

export default PostThread;
