import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Profile.css';
import Sidebar from './components/Sidebar';
import PostThread from './components/PostThread';
import FollowersList from './components/FollowersList';
import CreatePostModal from './components/CreatePostModal';
import { getMediaUrl } from '../utils/media';

function Profile({ userId, onLogout }) {
  const { id: profileId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [showFollowersList, setShowFollowersList] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const API_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');
  const location = useLocation();
  const successMessage = location.state?.message || null;

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/users/${profileId}/profile`);
      const data = await response.json();
      if (data.success) {
        setProfile(data.user);
        setPosts(data.posts);
        // Check if current user follows this profile
        const currentUserObj = data.user.followers.find(f => f._id === userId);
        setIsFollowing(!!currentUserObj);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [profileId, userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleFollow = async () => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/follow/${profileId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setIsFollowing(data.isFollowing);
        fetchProfile(); // Refresh to update counts
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleDeletePost = async (postId) => {
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

  if (loading || !profile) {
    return (
      <div className="profile-page">
        <Sidebar userId={userId} onLogout={onLogout} />
        <div className="profile-main" style={{ textAlign: 'center', padding: 24 }}>Loading...</div>
      </div>
    );
  }

  const isOwnProfile = userId === profileId;
  const mediaPosts = posts.filter(p => p.image || (p.media && p.media.length > 0));

  return (
    <div className="profile-page">
      <Sidebar userId={userId} onLogout={onLogout} onOpenCreate={() => setShowCreateModal(true)} />

      <div className="profile-main">
        {successMessage && (
          <div className="profile-alert">{successMessage}</div>
        )}

        <div className="profile-card">
          <div className="profile-topbar">
            <div />
            <div className="topbar-actions">
              {isOwnProfile ? (
                <button
                  className="primary-btn"
                  onClick={() => navigate(`/edit-profile/${userId}`)}
                >
                  Edit profile
                </button>
              ) : (
                <button
                  className={`primary-btn ${isFollowing ? 'neutral' : ''}`}
                  onClick={handleFollow}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          </div>

          <div className="profile-hero">
            <div className="avatar-stack">
              <div className="avatar-outline">
                <div
                  className="profile-avatar-large"
                  style={{
                    backgroundImage: profile.profilePicture ? `url(${getMediaUrl(profile.profilePicture)})` : '',
                  }}
                >
                  {!profile.profilePicture && profile.username?.charAt(0)?.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="profile-intro">
              <div className="name-row">
                <h1>{profile.username}</h1>
              </div>
              <p className="profile-bio">{profile.bio || 'Add a short bio to introduce yourself.'}</p>

              <div className="numbers-row">
                <button
                  className="number-pill"
                  onClick={() => setShowFollowersList('followers')}
                >
                  <span className="number">{profile.followers.length}</span>
                  <span className="label">Followers</span>
                </button>
                <button
                  className="number-pill"
                  onClick={() => setShowFollowersList('following')}
                >
                  <span className="number">{profile.following.length}</span>
                  <span className="label">Following</span>
                </button>
                <div className="number-pill muted">
                  <span className="number">{posts.length}</span>
                  <span className="label">Threads</span>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-tabs">
            <button
              className={`tab ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              Threads
            </button>
            <button
              className={`tab ${activeTab === 'media' ? 'active' : ''}`}
              onClick={() => setActiveTab('media')}
            >
              Media
            </button>
          </div>
        </div>

        <div className="profile-feed">
          {activeTab === 'posts' ? (
            posts.length > 0 ? (
              posts.map(post => (
                <div key={post._id} className="feed-item">
                  <PostThread
                    post={post}
                    currentUserId={userId}
                    onDelete={() => handleDeletePost(post._id)}
                    showDeleteBtn={isOwnProfile}
                  />
                </div>
              ))
            ) : (
              <div className="empty-profile">
                <div className="empty-icon" aria-hidden>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 7h10M7 11h6" stroke="#71767b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#71767b" strokeWidth="1.2" />
                  </svg>
                </div>
                <h3>No posts yet</h3>
                <p>{profile.username} hasn't posted anything yet</p>
              </div>
            )
          ) : (
            mediaPosts.length > 0 ? (
              mediaPosts.map(post => (
                <div key={post._id} className="feed-item">
                  <PostThread
                    post={post}
                    currentUserId={userId}
                    onDelete={() => handleDeletePost(post._id)}
                    showDeleteBtn={isOwnProfile}
                  />
                </div>
              ))
            ) : (
              <div className="empty-profile">
                <div className="empty-icon" aria-hidden>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="14" rx="2" stroke="#71767b" strokeWidth="1.2" />
                    <circle cx="8" cy="8" r="2" stroke="#71767b" strokeWidth="1.2" />
                  </svg>
                </div>
                <h3>No media</h3>
                <p>No photos or videos shared yet</p>
              </div>
            )
          )}
        </div>
      </div>

      {showFollowersList && (
        <FollowersList
          userId={profileId}
          type={showFollowersList}
          onClose={() => setShowFollowersList(null)}
        />
      )}

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onCreate={async (content, mediaPaths = []) => {
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
          }}
        />
      )}
    </div>
  );
}

export default Profile;
