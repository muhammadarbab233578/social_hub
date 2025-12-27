import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Activity from './pages/Activity';
import Profile from './pages/Profile';
import Search from './pages/Search';
import EditProfile from './pages/EditProfile';
import Media from './pages/Media';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    
    if (token && storedUserId) {
      setIsAuthenticated(true);
      setUserId(storedUserId);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setUserId(null);
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Home />} />
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setIsAuthenticated={setIsAuthenticated} setUserId={setUserId} />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register setIsAuthenticated={setIsAuthenticated} setUserId={setUserId} />} 
        />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard userId={userId} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/activity" 
          element={isAuthenticated ? <Activity userId={userId} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route
          path="/search"
          element={isAuthenticated ? <Search userId={userId} onLogout={handleLogout} /> : <Navigate to="/login" />}
        />
        <Route 
          path="/profile/:id" 
          element={isAuthenticated ? <Profile userId={userId} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/edit-profile/:id" 
          element={isAuthenticated ? <EditProfile userId={userId} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/media" 
          element={isAuthenticated ? <Media userId={userId} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;

