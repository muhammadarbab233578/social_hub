import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/SuggestionCard.css';
import { getMediaUrl } from '../../utils/media';

function SuggestionCard({ user, currentUserId, onFollow }) {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);

  const API_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const handleFollow = async () => {
    try {
      const response = await fetch(`${API_URL}/users/${currentUserId}/follow/${user._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setIsFollowing(data.isFollowing);
        if (data.isFollowing) {
          setTimeout(() => onFollow(user._id), 500);
        }
      }
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  return (
    <div className="suggestion-card">
      <div className="suggestion-header">
        <div 
          className="suggestion-avatar"
          onClick={() => navigate(`/profile/${user._id}`)}
          style={{
            backgroundImage: user.profilePicture ? `url(${getMediaUrl(user.profilePicture)})` : '',
            backgroundColor: '#333'
          }}
        >
          {!user.profilePicture && (user.username || '?').charAt(0).toUpperCase()}
        </div>
        
        <div className="suggestion-info">
          <h4 className="suggestion-name" onClick={() => navigate(`/profile/${user._id}`)}>
            {user.username}
          </h4>
          <p className="suggestion-bio">{user.bio || 'No bio'}</p>
        </div>
      </div>

      <button 
        className={`follow-suggestion-btn ${isFollowing ? 'following' : ''}`}
        onClick={handleFollow}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}

export default SuggestionCard;
