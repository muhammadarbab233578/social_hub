import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Search.css';
import Sidebar from './components/Sidebar';
import CreatePostModal from './components/CreatePostModal';
import { getMediaUrl } from '../utils/media';

function Search({ userId, onLogout }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [hiddenIds, setHiddenIds] = useState(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);

  const API_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!userId || !token) return;
    const fetchSuggestions = async () => {
      setSuggestionsLoading(true);
      try {
        const res = await fetch(`${API_URL}/users/suggestions/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setSuggestions(data.users || []);
      } catch (err) {
        console.error('Suggestions error', err);
      } finally {
        setSuggestionsLoading(false);
      }
    };
    fetchSuggestions();
  }, [API_URL, token, userId]);

  const handleSearch = async (q) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/search/${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) setResults(data.users || []);
    } catch (err) {
      console.error('Search error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetId) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/users/${userId}/follow/${targetId}` , {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setHiddenIds((prev) => new Set(prev).add(targetId));
        setSuggestions((prev) => prev.filter(u => u._id !== targetId));
        setResults((prev) => prev.filter(u => u._id !== targetId));
      }
    } catch (err) {
      console.error('Follow error', err);
    }
  };

  const renderRow = (u) => {
    const initial = (u.username || '?').charAt(0).toUpperCase();
    const avatarUrl = u.profilePicture ? getMediaUrl(u.profilePicture) : null;
    return (
      <div key={u._id} className="search-row" onClick={() => navigate(`/profile/${u._id}`)}>
        <div
          className={`search-avatar ${avatarUrl ? '' : 'avatar-initial'}`}
          style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : {}}
        >
          {!avatarUrl && initial}
        </div>
        <div className="search-info">
          <div className="search-name">{u.username}</div>
          <div className="search-meta">
            <span className="followers-count">{(u.followers?.length || 0).toLocaleString()} followers</span>
          </div>
        </div>
        <button
          className="search-follow"
          onClick={(e) => {
            e.stopPropagation();
            handleFollow(u._id);
          }}
        >
          Follow
        </button>
      </div>
    );
  };

  const visibleSuggestions = suggestions.filter(u => !hiddenIds.has(u._id));
  const visibleResults = results.filter(u => !hiddenIds.has(u._id));

  return (
    <div className="search-page">
      <Sidebar userId={userId} onLogout={onLogout} onOpenCreate={() => setShowCreateModal(true)} />

      <div className="search-card">
        <div className="search-header">Search</div>

        <div className="search-bar">
          <div className="search-icon" aria-hidden>
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.4" fill="none" /><path d="M15.5 15.5 21 21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
          </div>
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <div className="filter-icon" aria-hidden>
            <svg viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </div>

        <div className="search-title">Follow suggestions</div>

        <div className="search-list">
          {suggestionsLoading ? (
            <div className="search-empty">Loading suggestions...</div>
          ) : query.trim() && visibleResults.length === 0 && !loading ? (
            <div className="search-empty">No results</div>
          ) : query.trim() ? (
            loading ? <div className="search-empty">Searching...</div> : visibleResults.map(renderRow)
          ) : visibleSuggestions.length > 0 ? (
            visibleSuggestions.map(renderRow)
          ) : (
            <div className="search-empty">No suggestions</div>
          )}
        </div>
      </div>

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

export default Search;