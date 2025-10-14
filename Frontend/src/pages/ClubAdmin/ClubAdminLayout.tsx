import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useParams, Link } from 'react-router-dom';
import { getClubById } from '../../api/apiService';
import './ClubAdminLayout.css'; 

const ClubAdminLayout: React.FC = () => {
  
  const { clubId } = useParams<{ clubId: string }>();
  const [clubName, setClubName] = useState('Loading...');
  const [error, setError] = useState('');

  
  useEffect(() => {
    if (!clubId) return;

    const fetchClubName = async () => {
      try {
        const response = await getClubById(clubId);
        setClubName(response.data.data.club.name);
      } catch (err) {
        setError('Could not load club information.');
        setClubName('Unknown Club');
      }
    };
    fetchClubName();
  }, [clubId]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="club-admin-layout">
      <nav className="club-admin-sidebar">
        <h2>Manage:</h2>
        <h3 className="club-name-header">{clubName}</h3>
        <ul>
          <li><NavLink to={`/club/${clubId}/manage`}>Overview</NavLink></li>
          <li><NavLink to={`/club/${clubId}/create-election`}>New Election</NavLink></li>
        </ul>
        <div className="sidebar-footer">
          <Link to={`/club/${clubId}`}>← Back to Public View</Link>
        </div>
      </nav>
      <main className="club-admin-main-content">
        <Outlet /> 
      </main>
    </div>
  );
}

export default ClubAdminLayout;