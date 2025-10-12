import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext'; 
import { getAllClubs } from '../api/apiService';   
import type { Club } from '../types';
import './UserDashboard.css'; 

// A simple helper component for the club buttons
interface ClubButtonProps {
  club: Club;
  onOpen: (club: Club) => void;
}

function ClubButton({ club, onOpen }: ClubButtonProps) {
  const emoji = club.name.charAt(0).toUpperCase() || '🏛️';

  return (
    <button type="button" className="club-button" onClick={() => onOpen(club)}>
      {/* <div className="emoji">{club.logoUrl ? <img src={club.logoUrl} alt="" /> : emoji}</div> */}
      <div className="club-text">
        <div className="name">{club.name}</div>
        <div className="desc">{club.description || 'No description available.'}</div>
      </div>
    </button>
  );
}


export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 
  
  const [memberClubs, setMemberClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // can be moved to backend instead
    const fetchMemberClubs = async () => {
      if (!user) return; 

      try {
        const response = await getAllClubs();
        const allClubs = response.data.data.clubs;
        
        // Filter the clubs to find where the current user is a member
        const userClubs = allClubs.filter(club => 
          club.members.some(memberId => memberId === user._id)
        );

        setMemberClubs(userClubs);
      } catch (err) {
        setError('Failed to load your clubs. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMemberClubs();
  }, [user]); // Re-run this effect if the user object changes

  const handleOpenClub = (club: Club) => {
    alert(`Navigating to details for: ${club.name}`);
    // navigate(`/club/${club._id}`);
  };
  
  // Render system admin button conditionally
  const isAdmin = user?.roles.includes('systemAdmin');

  return (
    <div className="dashboard-wrap">
      <header className="topbar">
        <h1>My Clubs</h1>
        <div className="spacer" />
        
        {/* Only show the Admin Panel button if the user has the 'systemAdmin' role */}
        {isAdmin && (
          <button type="button" onClick={() => navigate('/admin/dashboard')} className="admin-button">
            Admin Panel
          </button>
        )}

        <button type="button" onClick={logout} className="logout-button">
          Logout
        </button>
      </header>

      <main>
        {isLoading && <p>Loading your clubs...</p>}
        {error && <p className="error-message">{error}</p>}
        
        {!isLoading && !error && (
          <div className="grid" aria-label="My Clubs">
            {memberClubs.length > 0 ? (
              memberClubs.map((club) => (
                <ClubButton
                  key={club._id}
                  club={club}
                  onOpen={handleOpenClub}
                />
              ))
            ) : (
              <div className="hint">
                You are not a member of any clubs yet. Explore and join clubs to see them here!
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}