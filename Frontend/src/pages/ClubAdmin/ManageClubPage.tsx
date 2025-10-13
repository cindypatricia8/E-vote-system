import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import { getClubById, getElectionsByClub, addMemberToClub, removeMemberFromClub } from '../../api/apiService';
import type { Club, Election, User } from '../../types';
import UserSearchInput from '../../components/UserSearchInput';
import './ManageClubPage.css';

export default function ManageClubPage() {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [club, setClub] = useState<Club | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!clubId) {
      setError('No club specified.');
      setIsLoading(false);
      return;
    }
    try {
      const [clubRes, electionsRes] = await Promise.all([
        getClubById(clubId),
        getElectionsByClub(clubId),
      ]);
      setClub(clubRes.data.data.club);
      setElections(electionsRes.data.data.elections);
    } catch (err) {
      setError('Failed to load club data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [clubId]);

  const stats = useMemo(() => {
    const now = new Date();
    return {
      memberCount: club?.members?.length || 0,
      adminCount: club?.admins?.length || 0,
      activeElections: elections.filter(e => new Date(e.startTime) <= now && new Date(e.endTime) >= now).length,
    };
  }, [club, elections]);

  const isAuthorized = useMemo(() => {
    if (!currentUser || !club) return false;
    return club.admins.some(admin => (typeof admin === 'string' ? admin === currentUser._id : admin._id === currentUser._id));
  }, [currentUser, club]);

  const handleAddMember = async (userToAdd: User) => {
    if (!clubId) return;
    try {
      await addMemberToClub(clubId, userToAdd._id);
      fetchData(); // Refetch data to update the member list
    } catch (error) {
      alert('Failed to add member.');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!clubId || !window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await removeMemberFromClub(clubId, memberId);
      fetchData(); // Refetch data to update the member list
    } catch (error) {
      alert('Failed to remove member.');
    }
  };
  
  // Create a list of IDs to exclude from the search (current members + current user)
  const excludeFromSearchIds = useMemo(() => {
    const memberIds = club?.members.map(member => (typeof member === 'string' ? member : member._id)) || [];
    if (currentUser) {
      return [...memberIds, currentUser._id];
    }
    return memberIds;
  }, [club, currentUser]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!club) return <div>Club not found.</div>;

  if (!isAuthorized) {
    return (
      <div>
        <h1>Access Denied</h1>
        <p>You are not an administrator for this club.</p>
        <Link to = {`/club/${clubId}`} >Back to Public Page</Link>
      </div>
    )
  }

  return (
    <div className="manage-club-page">
      <h1>Manage: {club.name}</h1>
      <div className="admin-button-panel">
        <button className="new-election" onClick={() => navigate('/club/${clubId}/create-election')}>
          + Create New Election
        </button>
        <button className="view-public" onClick={() => navigate(`/club/${clubId}`)}>
          View Public Page
        </button>
      </div>

      <div className="admin-cards">
        <div className="admin-card" style={{ background: '#2980b9' }}>
          <h3>Total Members</h3><p>{stats.memberCount}</p>
        </div>
        <div className="admin-card" style={{ background: '#27ae60' }}>
          <h3>Admins</h3><p>{stats.adminCount}</p>
        </div>
        <div className="admin-card" style={{ background: '#e67e22' }}>
          <h3>Active Elections</h3><p>{stats.activeElections}</p>
        </div>
      </div>

      <div className="manage-club-layout">
        <div className="manage-section">
          <h2>Manage Members</h2>
          <div className="add-member-section" style={{ marginBottom: '1.5rem' }}>
            <label className="block text-gray-700 font-medium mb-2">Add New Member</label>
            <UserSearchInput onUserSelect={handleAddMember} excludeIds={excludeFromSearchIds} />
          </div>
          <ul className="member-list">
            {club.members.map(member => {
              const memberDetails = typeof member === 'object' ? member : null;
              if (!memberDetails) return null;
              return (
                <li key={memberDetails._id} className="member-item">
                  <div className="member-info">
                    <div className="name">{memberDetails.name}</div>
                    <div className="id">{memberDetails.studentId}</div>
                  </div>
                  <button className="remove-member-btn" onClick={() => handleRemoveMember(memberDetails._id)}>
                    Remove
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="manage-section">
          <h2>Elections</h2>
          <ul className="member-list"> 
            {elections.map(election => (
              <li key={election._id} className="election-list-item">
                <div className="member-info">
                  <div className="name">{election.title}</div>
                  <div className="id">{new Date(election.startTime).toLocaleDateString()}</div>
                </div>
                <span className={`status status-${election.status}`}>{election.status}</span>
              </li>
            ))}
            {elections.length === 0 && <p>No elections found for this club.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}