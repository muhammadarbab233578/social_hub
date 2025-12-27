import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/EditProfile.css';
import Sidebar from './components/Sidebar';
import { getMediaUrl } from '../utils/media';

function EditProfile({ userId, onLogout }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bio, setBio] = useState('');
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_URL}/users/${userId}/profile`);
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          setBio(data.user.bio || '');
          if (data.user.profilePicture) {
            setProfilePicturePreview(data.user.profilePicture);
          }
        }
      } catch (err) {
        console.error('Fetch user error', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      let profilePicturePath = user?.profilePicture || null;

      if (profileFile) {
        const formData = new FormData();
        formData.append('profilePicture', profileFile);
        const uploadRes = await fetch(`${API_URL}/upload/profile`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          profilePicturePath = uploadData.path;
        }
      }

      const res = await fetch(`${API_URL}/users/${userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bio, profilePicture: profilePicturePath })
      });

      const data = await res.json();
      if (data.success) {
        navigate(`/profile/${userId}`, { state: { message: 'Profile updated successfully' } });
      } else {
        alert('Error updating profile: ' + data.message);
      }
    } catch (err) {
      console.error('Save error', err);
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="edit-profile-page"><Sidebar userId={userId} onLogout={onLogout} /><div className="edit-profile-main" style={{ textAlign: 'center' }}>Loading...</div></div>;
  }

  return (
    <div className="edit-profile-page">
      <Sidebar userId={userId} onLogout={onLogout} />

      <div className="edit-profile-main">
        <div className="edit-card">
          <div className="edit-card-header">
            <div className="edit-avatar" style={{
              backgroundImage: profilePicturePreview
                ? `url(${profilePicturePreview.startsWith('data:') ? profilePicturePreview : getMediaUrl(profilePicturePreview)})`
                : '',
              backgroundColor: '#222'
            }}>
              {!profilePicturePreview && user?.username?.charAt(0)?.toUpperCase()}
            </div>
            <div className="edit-header-text">
              <p className="edit-name">{user?.username}</p>
              <label className="edit-photo-btn">
                Change photo
                <input type="file" accept="image/*" hidden onChange={handleProfilePictureChange} />
              </label>
            </div>
          </div>

          <div className="edit-section">
            <label className="edit-label">Username</label>
            <input
              className="edit-input"
              value={user?.username || ''}
              disabled
            />
          </div>

          <div className="edit-section">
            <label className="edit-label">Bio</label>
            <textarea
              className="edit-textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 160))}
              maxLength={160}
              placeholder="Write something about yourself"
            />
            <div className="char-count">{bio.length}/160</div>
          </div>

          <div className="edit-actions">
            <button className="secondary-btn" onClick={() => navigate(`/profile/${userId}`)}>Cancel</button>
            <button className="primary-btn" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Done'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
