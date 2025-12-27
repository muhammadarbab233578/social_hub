import React, { useEffect, useState, useMemo } from 'react';
import '../styles/Activity.css';
import Sidebar from './components/Sidebar';
import CreatePostModal from './components/CreatePostModal';
import { getMediaUrl } from '../utils/media';

function Activity({ userId, onLogout }) {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [dismissedKeys, setDismissedKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('dismissedNotifications');
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Dismissed notifications restore error:', err);
      return [];
    }
  });

  const API_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const avatarColor = useMemo(() => (
    ['#f91880', '#1d9bf0', '#7c5dfa', '#0fb67f', '#f6c344', '#f59e0b']
  ), []);

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const then = new Date(dateString);
    const diff = now - then;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const notificationKey = (item) => [
    item.type,
    item.actor?._id || 'na',
    item.postId || 'none',
    item.commentText?.slice(0, 30) || 'no-comment',
    item.createdAt || 'na'
  ].join(':');

  useEffect(() => {
    localStorage.setItem('dismissedNotifications', JSON.stringify(dismissedKeys));
  }, [dismissedKeys]);

  useEffect(() => {
    const fetchActivity = async () => {
      if (!userId || !token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/users/${userId}/activity`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error('Activity fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [API_URL, token, userId]);

  const visibleNotifications = notifications.filter(
    (item) => !dismissedKeys.includes(notificationKey(item))
  );

  const filteredNotifications = activeTab === 'all'
    ? visibleNotifications
    : visibleNotifications.filter((item) => item.type === activeTab);

  const handleCreatePost = async (content, mediaPaths = []) => {
    try {
      const res = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content, media: mediaPaths })
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
      }
    } catch (err) {
      console.error('Create post error', err);
    }
  };

  const handleDismiss = (item) => {
    const key = notificationKey(item);
    setDismissedKeys((prev) => {
      if (prev.includes(key)) return prev;
      return [...prev, key];
    });
    setNotifications((prev) => prev.filter((n) => notificationKey(n) !== key));
  };

  const handleDismissAll = () => {
    const allKeys = notifications.map((item) => notificationKey(item));
    setDismissedKeys((prev) => Array.from(new Set([...prev, ...allKeys])));
    setNotifications([]);
  };

  return (
    <div className="activity-page">
      <Sidebar userId={userId} onLogout={onLogout} onOpenCreate={() => setShowCreateModal(true)} />

      <div className="activity-shell">
        <div className="activity-main">
          <div className="activity-header">
            <div className="activity-title-group">
              <h2>Activity</h2>
            </div>
            <div className="activity-header-row">
              <p className="activity-subtitle">Likes and comments on your posts</p>
              <button
                className="ghost-btn clear-all-btn"
                onClick={handleDismissAll}
                disabled={!visibleNotifications.length}
              >
                Clear all
              </button>
            </div>
          </div>

          <div className="activity-tabs">
            <button 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
              aria-label="All activity"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginRight:8}} xmlns="http://www.w3.org/2000/svg">
                <path d="M20.8 9.6c0 5.2-8.8 11-8.8 11S3.2 14.8 3.2 9.6A4.4 4.4 0 0 1 7.6 5.2c1.4 0 2.8.7 3.4 1.8.6-1.1 2-1.8 3.4-1.8a4.4 4.4 0 0 1 4.4 4.4z" stroke="#71767b" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              All ({visibleNotifications.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'like' ? 'active' : ''}`}
              onClick={() => setActiveTab('like')}
              aria-label="Likes"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginRight:8}} xmlns="http://www.w3.org/2000/svg">
                <path d="M20.8 9.6c0 5.2-8.8 11-8.8 11S3.2 14.8 3.2 9.6A4.4 4.4 0 0 1 7.6 5.2c1.4 0 2.8.7 3.4 1.8.6-1.1 2-1.8 3.4-1.8a4.4 4.4 0 0 1 4.4 4.4z" stroke="#71767b" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Likes
            </button>
            <button 
              className={`tab-btn ${activeTab === 'comment' ? 'active' : ''}`}
              onClick={() => setActiveTab('comment')}
              aria-label="Comments"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginRight:8}} xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="#71767b" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Comments
            </button>
            <button 
              className={`tab-btn ${activeTab === 'follow' ? 'active' : ''}`}
              onClick={() => setActiveTab('follow')}
              aria-label="Follows"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginRight:8}} xmlns="http://www.w3.org/2000/svg">
                <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3z" stroke="#71767b" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 19c0-2.21 3.58-4 8-4s8 1.79 8 4v1H2v-1z" stroke="#71767b" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Follows
            </button>
          </div>

          <div className="activity-content">
            {loading ? (
              <div className="empty-activity"><p>Loading...</p></div>
            ) : filteredNotifications.length ? (
              <div className="activity-feed">
                {filteredNotifications.map((item, idx) => {
                  const color = avatarColor[idx % avatarColor.length];
                  const actorName = item.actor?.username || 'Someone';
                  const avatarUrl = item.actor?.profilePicture ? getMediaUrl(item.actor.profilePicture) : null;
                  const key = notificationKey(item);

                  return (
                  <div className="activity-item" key={key}>
                    <div
                      className="avatar"
                      style={{ background: avatarUrl ? 'transparent' : color }}
                      aria-hidden
                    >
                      {avatarUrl ? (
                        <img src={avatarUrl} alt={actorName} />
                      ) : (
                        actorName.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="notification-body">
                      <div className="notification-header">
                        <span className="user-name">{actorName}</span>
                        <span className={`pill ${item.type}`}>
                          {item.type === 'like' ? 'Liked' : item.type === 'comment' ? 'Commented' : 'Followed'}
                        </span>
                        <span className="time-ago">{formatTime(item.createdAt)}</span>
                        <button
                          className="icon-btn dismiss-btn"
                          onClick={() => handleDismiss(item)}
                          aria-label="Dismiss notification"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 6l12 12M18 6L6 18" stroke="#9ca3af" strokeWidth="1.6" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>

                      <p className="notification-message">
                        {item.type === 'like' && 'Liked your post.'}
                        {item.type === 'comment' && 'Commented on your post.'}
                        {item.type === 'follow' && 'Followed you.'}
                      </p>

                      {item.commentText && (
                        <div className="comment-bubble">{item.commentText}</div>
                      )}

                      <div className="post-preview">
                        <div className="preview-dot" aria-hidden></div>
                        <div>
                          <p className="preview-label">Your post</p>
                          <p className="preview-text">{item.postContent}</p>
                        </div>
                      </div>

                      {item.type !== 'follow' && (
                        <div className="notification-actions">
                          <button className="cta-btn">View post</button>
                          {item.type === 'comment' && <button className="ghost-btn">Reply</button>}
                        </div>
                      )}
                    </div>
                  </div>
                );})}
              </div>
            ) : (
              <div className="empty-activity">
                <div className="empty-icon" aria-hidden>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.8 9.6c0 5.2-8.8 11-8.8 11S3.2 14.8 3.2 9.6A4.4 4.4 0 0 1 7.6 5.2c1.4 0 2.8.7 3.4 1.8.6-1.1 2-1.8 3.4-1.8a4.4 4.4 0 0 1 4.4 4.4z" fill="#f91880" />
                  </svg>
                </div>
                <h3>No activity yet</h3>
                <p>When people like or comment on your posts, they will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreatePost}
        />
      )}
    </div>
  );
}

export default Activity;
