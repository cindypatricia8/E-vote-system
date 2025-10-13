import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { getClubById, getElectionsByClub } from '../api/apiService';
import type { Club, Election } from '../types';
import './ClubDetailsPage.css';


const ElectionItem: React.FC<{ election: Election }> = ({ election }) => {
  return (
    <div>
      <h3>{election.title}</h3>
      <p className="election-date">
        <i className="far fa-calendar-alt"></i> {new Date(election.startTime).toLocaleDateString()} - {new Date(election.endTime).toLocaleDateString()}
      </p>
      <p>{election.description}</p>
      <div className="action-buttons">
        <button className="btn btn-view">View Details</button>
      </div>
    </div>
  );
};

export default function ClubDetailsPage() {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [club, setClub] = useState<Club | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clubId) {
      setError('No club ID provided.');
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const clubPromise = getClubById(clubId);
        const electionsPromise = getElectionsByClub(clubId);
        
        const [clubResponse, electionsResponse] = await Promise.all([clubPromise, electionsPromise]);

        setClub(clubResponse.data.data.club);
        setElections(electionsResponse.data.data.elections);
      } catch (err) {
        setError('Failed to load club details. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [clubId]);


  const categorizedElections = useMemo(() => {
    const now = new Date();
    const categories = {
      current: [] as Election[],
      upcoming: [] as Election[],
      finished: [] as Election[],
    };

    elections.forEach(election => {
      const start = new Date(election.startTime);
      const end = new Date(election.endTime);
      if (end < now) {
        categories.finished.push(election);
      } else if (start > now) {
        categories.upcoming.push(election);
      } else {
        categories.current.push(election);
      }
    });
    return categories;
  }, [elections]);

  // Check if the current user is an admin of this club
  const isClubAdmin = useMemo(() => {
    if (!user || !club) return false;
    return club.admins.some(admin => (typeof admin === 'string' ? admin === user._id : admin._id === user._id));
  }, [user, club]);

  if (isLoading) return <div>Loading club details...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!club) return <div>Club not found.</div>;

  return (
    <div className="club-details-page">
      <div className="topbar">
        <div className="topbar-left">
          <button onClick={() => navigate(-1)} aria-label="Go back">
            <i className="fas fa-arrow-left"></i>
          </button>
        </div>
        <div className="topbar-center">{club.name}</div>
        <div className="topbar-right"></div> 
      </div>

      <div className="club-details-container">
        <header>
          <h1>{club.name}</h1>
          <p>{club.description}</p>
          {isClubAdmin && (
            <button onClick={() => navigate(`/club/${club._id}/manage`)}className="manage-club-btn">
              <i className="fas fa-cog"></i> Manage Club
            </button>
          )}
        </header>
        
        <div className="dashboard">
          <div className="section">
            <h2><i className="fas fa-clock"></i> Current Elections</h2>
            {categorizedElections.current.length > 0 ? (
              categorizedElections.current.map(election => (
                <div key={election._id} className="election-item current">
                  <ElectionItem election={election} />
                </div>
              ))
            ) : <p className="no-elections-message">No current elections.</p>}
          </div>

          <div className="section">
            <h2><i className="fas fa-calendar-plus"></i> Upcoming Elections</h2>
            {categorizedElections.upcoming.length > 0 ? (
              categorizedElections.upcoming.map(election => (
                <div key={election._id} className="election-item upcoming">
                  <ElectionItem election={election} />
                </div>
              ))
            ) : <p className="no-elections-message">No upcoming elections.</p>}
          </div>
          
          <div className="section">
            <h2><i className="fas fa-check-circle"></i> Finished Elections</h2>
            {categorizedElections.finished.length > 0 ? (
              categorizedElections.finished.map(election => (
                <div key={election._id} className="election-item finished">
                  <ElectionItem election={election} />
                </div>
              ))
            ) : <p className="no-elections-message">No finished elections.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};