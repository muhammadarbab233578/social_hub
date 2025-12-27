import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
  const LogoIcon = ({ className, size = 50 }) => (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 4c-4.4 0-8 2.9-8 6.5 0 2.6 2.1 5 5.1 6-.2.7-.7 2.3-.8 2.6 0 0-.1.3.2.2.3-.1 2.1-1.4 3-2.1.8.1 1.7.2 2.5.2 4.4 0 8-2.9 8-6.5S16.4 4 12 4z"
        stroke="#fff"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="logo-section">
            <LogoIcon className="logo-img" size={50} />
            <h1 className="logo-text">SocialHub</h1>
          </div>
          <div className="nav-buttons">
            <Link to="/login" className="nav-btn login-btn">Login</Link>
            <Link to="/register" className="nav-btn register-btn">Register</Link>
          </div>
        </div>
      </nav>

      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-left">
            <div className="logo-large">
              <LogoIcon className="logo-large-img" size={150} />
            </div>
            <h1 className="app-title">SocialHub</h1>
            <p className="app-subtitle">Where Conversations Come Alive</p>
          </div>

          <div className="hero-right">
            <div className="feature-card">
              <h2>Welcome to SocialHub</h2>
              <p className="intro-text">
                Experience the next generation of social media. SocialHub is a modern, fast-paced platform designed for sharing your thoughts, connecting with friends, and building meaningful conversations.
              </p>

              <div className="features-list">
                <div className="feature-item">
                  <span className="feature-icon">💬</span>
                  <div className="feature-text">
                    <h3>Share Your Thoughts</h3>
                    <p>Post unlimited threads and engage with your community</p>
                  </div>
                </div>

                <div className="feature-item">
                  <span className="feature-icon">👥</span>
                  <div className="feature-text">
                    <h3>Connect with Others</h3>
                    <p>Follow friends and discover new conversations</p>
                  </div>
                </div>

                <div className="feature-item">
                  <span className="feature-icon">❤️</span>
                  <div className="feature-text">
                    <h3>Engage & Interact</h3>
                    <p>Like, reply, and contribute to discussions</p>
                  </div>
                </div>

                <div className="feature-item">
                  <span className="feature-icon">🔔</span>
                  <div className="feature-text">
                    <h3>Stay Updated</h3>
                    <p>Get real-time notifications of activity</p>
                  </div>
                </div>

                <div className="feature-item">
                  <span className="feature-icon">🌙</span>
                  <div className="feature-text">
                    <h3>Dark & Light Mode</h3>
                    <p>Choose your preferred viewing experience</p>
                  </div>
                </div>

                <div className="feature-item">
                  <span className="feature-icon">🔒</span>
                  <div className="feature-text">
                    <h3>Secure & Private</h3>
                    <p>Your data is protected with enterprise-level security</p>
                  </div>
                </div>
              </div>

              <div className="cta-section">
                <h3>Ready to Get Started?</h3>
                <p>Join thousands of users sharing meaningful conversations on SocialHub</p>
                <div className="cta-buttons">
                  <Link to="/register" className="cta-btn primary-btn">
                    Get Started
                  </Link>
                  <Link to="/login" className="cta-btn secondary-btn">
                    Already have an account? Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2025 SocialHub. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#contact">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
