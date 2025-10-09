import React from 'react';
import { useNavigate } from 'react-router-dom';
import './VoteDashboard.css';

const VoteDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Top Bar */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="alert-logo" aria-hidden="true"></div>
        </div>

        <div className="topbar-center">
          My elections
        </div>

        <div className="topbar-right">
          <i className="fas fa-bell"></i>
          <button
            className="icon-button"
            onClick={() => navigate('/login')}
            aria-label="Login"
          >
            <i className="fas fa-user-circle"></i>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="container">
        <header>
          <h1><i className="fas fa-vote-yea"></i> Election Dashboard</h1>
        </header>
        
        <div className="dashboard">
          {/* Current Elections */}
          <div className="section">
            <h2><i className="fas fa-clock"></i> Current Elections</h2>
            <div className="election-item current">
              <h3>MSA Election</h3>
             <p className="election-date"><i className="far fa-calendar-alt"></i> October 15, 2025 - October 20, 2025</p>
              <p>Student election 2025</p>
              <div className="action-buttons">
                <div className="action-buttons">
                <button
                  className="btn btn-view"
                  onClick={() => navigate('/main-voting')}
                >
                  Nominate
                </button>
              </div>
            </div>

            <div className="election-item current">
              <h3>Club Election</h3>
              <p className="election-date"><i className="far fa-calendar-alt"></i> October 20, 2025 - October 25, 2025</p>
              <p>2025 club election</p>
              <div className="action-buttons">
                <div className="action-buttons">
                <button
                  className="btn btn-view"
                  onClick={() => navigate('/main-voting')}
                >
                  Nominate
                </button>
              </div>
            </div>
          </div>

          {/* Finished Elections */}
          <div className="section">
            <h2><i className="fas fa-check-circle"></i> Finished Elections</h2>
            <div className="election-item finished">
              <h3>Club Election</h3>
              <p className="election-date"><i className="far fa-calendar-alt"></i> May 10, 2025 - May 15, 2025</p>
              <p>Previous club election</p>
              <div className="action-buttons">
                <button className="btn btn-view">View Details</button>
              </div>
            </div>
          </div>

          {/* Upcoming Elections */}
          <div className="section">
            <h2><i className="fas fa-calendar-plus"></i> Upcoming Elections</h2>
            <div className="election-item upcoming">
              <h3>Club Election</h3>
              <p className="election-date"><i className="far fa-calendar-alt"></i> November 5, 2025 - November 10, 2025</p>
              <p>Yearly club election</p>
              <div className="action-buttons">
                <button className="btn btn-view">View Details</button>
              </div>
            </div>

        <div className="divider"></div>
        <footer></footer>
      </div>
    </div>
  );
};
