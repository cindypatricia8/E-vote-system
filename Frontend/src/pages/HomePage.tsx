import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css'; 

export default function HomePage() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>E-Voting System Portal</h1>
        <p>Your secure platform for university club elections.</p>
        
        <div className="disclaimer-box">
          <span>⚠️</span>
          <p>
            <strong>Temporary Homepage:</strong> This page is a placeholder for development and testing. The final user homepage is currently under construction.
          </p>
        </div>

        <div className="link-groups">
          {/* Group 1: User Authentication */}
          <div className="link-group">
            <h2 className="link-group-title">User Account</h2>
            <div className="nav-links">
              <Link to="/login" className="nav-button nav-button-primary">Login</Link>
              <Link to="/register" className="nav-button nav-button-secondary">Register</Link>
            </div>
          </div>

          {/* Group 2: Main User Pages */}
          <div className="link-group">
            <h2 className="link-group-title">Voting Area</h2>
            <div className="nav-links">
              <Link to="/voting" className="nav-button nav-button-secondary">Go to Voting Page</Link>
              <Link to="/voting-dashboard" className="nav-button nav-button-secondary">Voting Dashboard</Link>
            </div>
          </div>
          
          {/* Group 3: Admin Pages */}
          <div className="link-group">
            <h2 className="link-group-title">Admin Testing Pages</h2>
            <div className="nav-links">
              <Link to="/admin/dashboard" className="nav-button nav-button-secondary">Admin Dashboard</Link>
              <Link to="/create-club" className="nav-button nav-button-secondary">Create Club Page</Link>
              <Link to="/admin/create-election" className="nav-button nav-button-secondary">Create Election Page</Link>
            </div>
          </div>
        </div>
    

      </div>
    </div>
  );
}