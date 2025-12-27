import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

function Login({ setIsAuthenticated, setUserId }) {
  const LogoIcon = ({ className, size = 45 }) => (
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

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.email || !formData.password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Password validation
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      // Send login data to backend
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token and user data to localStorage
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Update App state
        setIsAuthenticated(true);
        setUserId(data.user.id);
      }

      // Clear form and show success
      setFormData({ email: '', password: '' });
      
      // Navigate to dashboard after successful login
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <nav className="auth-navbar">
        <div className="auth-navbar-content">
          <Link to="/" className="auth-logo">
            <LogoIcon className="auth-logo-img" size={45} />
            <span>SocialHub</span>
          </Link>
        </div>
      </nav>

      <div className="auth-content">
        <div className="auth-form-container">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Login to your SocialHub account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-options">
              <a href="#forgot-password" className="forgot-password">Forgot Password?</a>
            </div>

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register" className="auth-link">Register here</Link></p>
          </div>
        </div>

        <div className="auth-sidebar">
          <div className="sidebar-content">
            <h2>SocialHub</h2>
            <p>Connect with millions of users and share your thoughts in real-time.</p>
            <ul className="sidebar-features">
              <li>✓ Share unlimited threads</li>
              <li>✓ Connect with friends</li>
              <li>✓ Real-time notifications</li>
              <li>✓ Secure & private</li>
              <li>✓ Mobile & desktop access</li>
            </ul>
          </div>
        </div>
      </div>

      <footer className="auth-footer-bottom">
        <p>&copy; 2025 SocialHub. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Login;
