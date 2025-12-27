import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/Sidebar.css';

function Sidebar({ userId, onLogout, onOpenCreate }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/profile') return location.pathname.startsWith('/profile');
    return location.pathname.startsWith(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-logo" onClick={() => navigate('/dashboard')} aria-label="Home">
          <div className="logo-icon" aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4c-4.4 0-8 2.9-8 6.5 0 2.6 2.1 5 5.1 6-.2.7-.7 2.3-.8 2.6 0 0-.1.3.2.2.3-.1 2.1-1.4 3-2.1.8.1 1.7.2 2.5.2 4.4 0 8-2.9 8-6.5S16.4 4 12 4z" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          <button
            className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => navigate('/dashboard')}
            aria-label="Home"
          >
            <span className="nav-icon" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1v-8.5z" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>

          <button
            className={`nav-item ${isActive('/search') ? 'active' : ''}`}
            onClick={() => navigate('/search')}
            aria-label="Search"
          >
            <span className="nav-icon" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21l-4.35-4.35" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="11" cy="11" r="6" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>

          <button
            className="nav-item"
            onClick={() => {
              if (onOpenCreate) {
                onOpenCreate();
              } else {
                navigate('/dashboard', { state: { openCreate: true } });
              }
            }}
            aria-label="Create"
          >
            <span className="nav-icon" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>

          <button
            className={`nav-item ${isActive('/activity') ? 'active' : ''}`}
            onClick={() => navigate('/activity')}
            aria-label="Activity"
          >
            <span className="nav-icon" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.5 9.6c0 5-8.5 11-8.5 11s-8.5-6-8.5-11A4.5 4.5 0 0 1 8 5a4.6 4.6 0 0 1 4 2.3A4.6 4.6 0 0 1 16 5a4.5 4.5 0 0 1 4.5 4.6z" stroke="#fff" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>

          <button
            className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
            onClick={() => navigate(`/profile/${userId}`)}
            aria-label="Profile"
          >
            <span className="nav-icon" aria-hidden>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-7A3.5 3.5 0 0 0 5 18.5V20" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </nav>

        <button
          className="logout-btn"
          onClick={() => {
            if (onLogout) {
              onLogout();
            }
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            navigate('/login');
          }}
          aria-label="Logout"
        >
          <span className="logout-icon" aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 17.5 20 13m0 0-4.5-4.5M20 13H9" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7" stroke="#fff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
