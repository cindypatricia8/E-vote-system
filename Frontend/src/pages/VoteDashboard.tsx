import React from 'react';
import './VoteDashboard.css';

export default function ElectionDashboard() {
  return (
    <div>
      {/* Top Bar */}
      <div className="topbar">
        <div className="topbar-left">
          <img src="v19_2.png" alt="Monash University Logo" />
        </div>

        <div className="topbar-center">
          My elections
        </div>

        <div className="topbar-right">
          <i className="fas fa-bell"></i>
          <i className="fas fa-user-circle"></i>
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
              <p className="election-date"><i className="far fa-calendar-alt"></i> October 15, 2023 - October 18, 2023</p>
              <p>Student association election for the academic year 2023-2024</p>
              <div className="action-buttons">
                <button className="btn btn-view">View Details</button>
                <button className="btn btn-results">Live Results</button>
              </div>
            </div>

            <div className="election-item current">
              <h3>Club Election</h3>
              <p className="election-date"><i className="far fa-calendar-alt"></i> October 20, 2023 - October 22, 2023</p>
              <p>Annual club leadership election for all student organizations</p>
              <div className="action-buttons">
                <button className="btn btn-view">View Details</button>
                <button className="btn btn-results">Live Results</button>
              </div>
            </div>
          </div>

          {/* Finished Elections */}
          <div className="section">
            <h2><i className="fas fa-check-circle"></i> Finished Elections</h2>
            <div className="election-item finished">
              <h3>Club Election</h3>
              <p className="election-date"><i className="far fa-calendar-alt"></i> September 10, 2023 - September 12, 2023</p>
              <p>Previous club leadership election with 85% voter turnout</p>
              <div className="action-buttons">
                <button className="btn btn-view">View Details</button>
                <button className="btn btn-results">Final Results</button>
              </div>
            </div>
          </div>

          {/* Upcoming Elections */}
          <div className="section">
            <h2><i className="fas fa-calendar-plus"></i> Upcoming Elections</h2>
            <div className="election-item upcoming">
              <h3>Club Election</h3>
              <p className="election-date"><i className="far fa-calendar-alt"></i> November 5, 2023 - November 7, 2023</p>
              <p>Next quarter club leadership election - nominations open</p>
              <div className="action-buttons">
                <button className="btn btn-view">View Details</button>
                <button className="btn btn-edit">Nominate</button>
              </div>
            </div>

            <div className="election-item upcoming">
              <h3>Student Senate</h3>
              <p className="election-date"><i className="far fa-calendar-alt"></i> December 1, 2023 - December 3, 2023</p>
              <p>Annual student senate election for policy making body</p>
              <div className="action-buttons">
                <button className="btn btn-view">View Details</button>
                <button className="btn btn-edit">Apply</button>
              </div>
            </div>
          </div>
        </div>

        <div className="divider"></div>
        <footer></footer>
      </div>
    </div>
  );
}
