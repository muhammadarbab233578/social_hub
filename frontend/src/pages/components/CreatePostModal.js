import React, { useState } from 'react';
import '../../styles/CreatePostModal.css';

function CreatePostModal({ onClose, onCreate }) {
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const API_URL = 'http://localhost:5000/api';

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setMediaType('image');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setMediaType('video');
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      alert('Please write something!');
      return;
    }
    (async () => {
      try {
        const token = localStorage.getItem('token');
        let mediaPaths = [];
        const formData = new FormData();
        if (imageFile) formData.append('media', imageFile);
        if (videoFile) formData.append('media', videoFile);

        if (imageFile || videoFile) {
          const res = await fetch(`${API_URL}/upload/media`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          const data = await res.json();
          if (data.success) mediaPaths = data.paths;
        }

        await onCreate(content, mediaPaths);
      } catch (err) {
        console.error('Upload/create error', err);
        alert('Failed to upload media');
      }
    })();
    setContent('');
    setImageFile(null);
    setVideoFile(null);
    setPreview(null);
    setMediaType(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2>Create Post</h2>
        </div>

        <div className="modal-body">
          <textarea 
            placeholder="What's new?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="post-input"
            maxLength={280}
          />
          
          <div className="char-count">
            {content.length}/280
          </div>

          {preview && (
            <div className="image-preview">
              {mediaType === 'image' ? (
                <img src={preview} alt="preview" />
              ) : (
                <video width="100%" height="200" controls>
                  <source src={preview} />
                </video>
              )}
              <button className="remove-image" onClick={() => {
                setImageFile(null);
                setVideoFile(null);
                setPreview(null);
                setMediaType(null);
              }}>✕</button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="modal-actions">
            <label className="image-btn" aria-label="Add image" title="Add Image">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="#1d9bf0" strokeWidth="1.2" />
                <path d="M8 11l2.5 3L13 10l4 6" stroke="#1d9bf0" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                hidden
              />
            </label>

            <label className="image-btn" aria-label="Add video" title="Add Video">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="#1d9bf0" strokeWidth="1.2" />
                <path d="M10 12L17 8v8l-7-4z" fill="#1d9bf0" />
              </svg>
              <input 
                type="file" 
                accept="video/*" 
                onChange={handleVideoChange}
                hidden
              />
            </label>
          </div>

          <button 
            className="post-submit-btn"
            onClick={handleSubmit}
            disabled={!content.trim()}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreatePostModal;
