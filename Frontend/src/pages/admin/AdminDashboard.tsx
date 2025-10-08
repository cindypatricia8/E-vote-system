import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Voting Dashboard</h1>
      <div className="admin-button-panel">
        <button className="new-election" onClick={() => navigate('/admin/create-election')}>
          Create New Election
        </button>
      </div>

      <div className="admin-cards">
        <div className="admin-card" style={{ background: '#27ae60' }}>
          <h3>Participation</h3><p>--%</p>
        </div>
        <div className="admin-card" style={{ background: '#2980b9' }}>
          <h3>Total Voters</h3><p>--</p>
        </div>
        <div className="admin-card" style={{ background: '#e67e22' }}>
          <h3>Active Elections</h3><p>--</p>
        </div>
        <div className="admin-card" style={{ background: '#8e44ad' }}>
          <h3>Clubs Managed</h3><p>--</p>
        </div>
      </div>

      <div className="admin-charts">
        <div className="chart-placeholder">
          <h3>Votes by Candidate</h3>
          <div className="placeholder-content">Chart Area</div>
        </div>
        <div className="chart-placeholder">
          <h3>Vote Distribution</h3>
          <div className="placeholder-content">Chart Area</div>
        </div>
        <div className="chart-placeholder">
          <h3>Votes Over Time</h3>
          <div className="placeholder-content">Chart Area</div>
        </div>
      </div>
    </div>
  );
}