import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Dashboard.css';
import Sidebar from './components/Sidebar';
import PostThread from './components/PostThread';
import CreatePostModal from './components/CreatePostModal';
import SuggestionCard from './components/SuggestionCard';
import { getMediaUrl } from '../utils/media';

function Dashboard({ userId, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [hasFollowing, setHasFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [profile, setProfile] = useState(null);

  const API_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/posts/feed/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setPosts(data.posts);
          setHasFollowing(data.hasFollowing);
        }
      } catch (error) {
        console.error('Error fetching feed:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(`${API_URL}/users/suggestions/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setSuggestions(data.users);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    if (userId) {
      fetchData();
      fetchSuggestions();
    } else {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_URL}/users/${userId}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setProfile(data.user);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [userId, token]);

  useEffect(() => {
    if (location.state?.openCreate) {
      setShowCreateModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/search/${query}`);
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.users);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Error searching:', error);
    }
  };

  const handleCreatePost = async (content, mediaPaths = []) => {
    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content, media: mediaPaths })
      });
      const data = await response.json();
      if (data.success) {
        setPosts(prev => [data.post, ...prev]);
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handlePostLike = (postId, isLiked) => {
    setPosts(posts.map(post => 
      post._id === postId ? { ...post, isLiked } : post
    ));
  };

  const handleFollow = (userId) => {
    setSuggestions(suggestions.filter(user => user._id !== userId));
  };

  const avatarUrl = profile?.profilePicture ? getMediaUrl(profile.profilePicture) : null;
  const avatarInitial = (profile?.username || '?').charAt(0).toUpperCase();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <Sidebar userId={userId} onLogout={onLogout} onOpenCreate={() => setShowCreateModal(true)} />
      <div className="feed-wrapper">
        <div className="main-feed">
          <div className="feed-header">
            <div className="header-top">
              <h2>For you</h2>
            </div>
          </div>

          <div className="create-post-section">
            <div className="create-post-input" onClick={() => setShowCreateModal(true)}>
              <div
                className="avatar-placeholder"
                style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : {}}
              >
                {!avatarUrl && avatarInitial}
              </div>
              <input
                type="text"
                placeholder="What's new?"
                readOnly
              />
              <button className="create-btn">Post</button>
            </div>
          </div>

          {showSearchResults && (
            <div className="search-results">
              {searchResults.length > 0 ? (
                searchResults.map(user => (
                  <div key={user._id} className="search-result-item">
                    <div
                      className="result-avatar"
                      style={{
                        backgroundImage: user.profilePicture ? `url(${user.profilePicture})` : ''
                      }}
                    ></div>
                    <div className="result-info">
                      <p className="result-username">@{user.username}</p>
                      <p className="result-bio">{user.bio || 'No bio'}</p>
                    </div>
                    <button
                      className="follow-btn-small"
                      onClick={() => {
                        navigate(`/profile/${user._id}`);
                        setShowSearchResults(false);
                      }}
                    >View</button>
                  </div>
                ))
              ) : (
                <div className="no-results">No users found</div>
              )}
            </div>
          )}

          <div className="feed-content">
            {!hasFollowing ? (
              <div className="empty-state">
                <div className="empty-icon" aria-hidden>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3z" stroke="#71767b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 19c0-2.21 3.58-4 8-4s8 1.79 8 4v1H2v-1z" stroke="#71767b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2>No followers yet</h2>
                <p>Start following people to see their posts in your feed!</p>
              </div>
            ) : posts.length > 0 ? (
              posts.map(post => (
                <PostThread
                  key={post._id}
                  post={post}
                  currentUserId={userId}
                  onLike={handlePostLike}
                />
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon" aria-hidden>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 7h10M7 11h6" stroke="#71767b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#71767b" strokeWidth="1.2" />
                  </svg>
                </div>
                <h2>No posts yet</h2>
                <p>Your feed is empty. Follow people to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <button className="fab-post" onClick={() => setShowCreateModal(true)} aria-label="Create post">
        <span>+</span>
      </button>

      <div className="suggestions-panel hidden-panel">
        <div className="suggestions-header">
          <h3>Suggestions For You</h3>
        </div>
        <div className="suggestions-list">
          {suggestions.length > 0 ? (
            suggestions.map(user => (
              <SuggestionCard
                key={user._id}
                user={user}
                currentUserId={userId}
                onFollow={handleFollow}
              />
            ))
          ) : (
            <div className="no-suggestions">
              <p>No more suggestions</p>
            </div>
          )}
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

export default Dashboard;
