import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Dashboard.css';
import { getMediaUrl } from '../../utils/media';

function FollowersList({ userId, type = 'followers', onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const endpoint = type === 'followers' 
          ? `${API_URL}/users/${userId}/followers`
          : `${API_URL}/users/${userId}/following`;
        
        const res = await fetch(endpoint);
        const data = await res.json();
        if (data.success) {
          setUsers(data.followers || data.following || []);
        }
      } catch (err) {
        console.error('Fetch error', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUsers();
    }
  }, [userId, type]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2>{type === 'followers' ? 'Followers' : 'Following'}</h2>
        </div>

        <div className="modal-body" style={{ maxHeight: 400, overflowY: 'auto', padding: 0 }}>
          {loading ? (
            <div style={{ padding: 24, textAlign: 'center' }}>Loading...</div>
          ) : users.length > 0 ? (
            users.map(u => (
              <div key={u._id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                borderBottom: '1px solid #2f3336',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#161a1e'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              onClick={() => {
                navigate(`/profile/${u._id}`);
                onClose();
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundImage: u.profilePicture ? `url(${getMediaUrl(u.profilePicture)})` : 'none',
                  backgroundColor: '#192734',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  fontWeight: 700
                }}>
                  {!u.profilePicture && (u.username || '?').charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#fff' }}>{u.username}</div>
                  <div style={{ color: '#71767b', fontSize: 13 }}>{u.bio || 'No bio'}</div>
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: 24, textAlign: 'center', color: '#71767b' }}>
              No {type} yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FollowersList;
