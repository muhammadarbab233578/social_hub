import React, { useState, useEffect } from 'react';
import '../styles/Dashboard.css';
import Sidebar from './components/Sidebar';
import PostThread from './components/PostThread';

function Media({ userId, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_URL}/users/${userId}/profile`);
        const data = await res.json();
        if (data.success) {
          // Filter posts that have media (images or videos)
          const mediaPosts = data.posts.filter(p => p.image || (p.media && p.media.length > 0));
          setPosts(mediaPosts);
        }
      } catch (err) {
        console.error('Fetch posts error', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPosts();
    }
  }, [userId]);

  const handleDeletePost = async (postId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setPosts(posts.filter(p => p._id !== postId));
      }
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar userId={userId} onLogout={onLogout} />

      <div className="main-feed">
        <div className="feed-header">
          <div className="header-top"><h2>Media</h2></div>
          <div style={{ padding: 12, color: '#71767b', fontSize: 13 }}>
            Your posts with images and videos
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 24, textAlign: 'center' }}>Loading...</div>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <div key={post._id} style={{ borderBottom: '1px solid #2f3336' }}>
              <PostThread
                post={post}
                onDelete={() => handleDeletePost(post._id)}
                currentUserId={userId}
                showDeleteBtn={post.author._id === userId}
              />
            </div>
          ))
        ) : (
          <div style={{
            padding: 48,
            textAlign: 'center',
            color: '#71767b'
          }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>📸</div>
            <div>No media posts yet</div>
            <button
              onClick={() => document.dispatchEvent(new CustomEvent('openCreatePost'))}
              style={{
                marginTop: 16,
                padding: '10px 20px',
                backgroundColor: '#1d9bf0',
                color: '#000',
                border: 'none',
                borderRadius: 20,
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              Create a post with media
            </button>
          </div>
        )}
      </div>

      <div className="suggestions-panel">
        <div className="suggestions-header"><h3>Media Stats</h3></div>
        <div style={{ padding: 12, color: '#71767b', fontSize: 13 }}>
          Posts with media: <strong>{posts.length}</strong>
          <br />
          <br />
          Share your photos and videos with your followers!
        </div>
      </div>
    </div>
  );
}

export default Media;
