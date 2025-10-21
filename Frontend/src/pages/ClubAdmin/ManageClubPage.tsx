import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import
  {
    getClubById,
    getElectionsByClub,
    addMemberToClub,
    removeMemberFromClub,
    addAdminToClub,
  } from "../../api/apiService";
import type { Club, Election, User } from "../../types";
import UserSearchInput from "../../components/UserSearchInput";
import "./ClubAdminLayout.css";

const ManageClubPage: React.FC = () =>
{
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [club, setClub] = useState<Club | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () =>
  {
    if (!clubId)
    {
      setError("No club specified.");
      setIsLoading(false);
      return;
    }
    try
    {
      const [clubRes, electionsRes] = await Promise.all([
        getClubById(clubId),
        getElectionsByClub(clubId),
      ]);
      setClub(clubRes.data.data.club);
      setElections(electionsRes.data.data.elections);
    } catch (err)
    {
      setError("Failed to load club data.");
    } finally
    {
      setIsLoading(false);
    }
  };

  useEffect(() =>
  {
    fetchData();
  }, [clubId]);

  const stats = useMemo(() =>
  {
    const now = new Date();
    return {
      memberCount: club?.members?.length || 0,
      adminCount: club?.admins?.length || 0,
      activeElections: elections.filter(
        (e) => new Date(e.startTime) <= now && new Date(e.endTime) >= now
      ).length,
    };
  }, [club, elections]);

  const isAuthorized = useMemo(() =>
  {
    if (!currentUser || !club) return false;
    return club.admins.some((admin) =>
      typeof admin === "string"
        ? admin === currentUser._id
        : admin._id === currentUser._id
    );
  }, [currentUser, club]);

  const handleAddMember = async (userToAdd: User) =>
  {
    if (!clubId) return;
    try
    {
      await addMemberToClub(clubId, userToAdd._id);
      fetchData(); // Refetch data to update the member list
    } catch (error)
    {
      alert("Failed to add member.");
    }
  };

  const handleRemoveMember = async (memberId: string) =>
  {
    if (
      !clubId ||
      !window.confirm("Are you sure you want to remove this member?")
    )
      return;
    try
    {
      await removeMemberFromClub(clubId, memberId);
      fetchData(); // Refetch data to update the member list
    } catch (error)
    {
      alert("Failed to remove member.");
    }
  };

  const handlePromoteMember = async (memberId: string) => {
    if (
      !clubId ||
      !window.confirm(
        "Are you sure you want to promote this member to an admin?"
      )
    )
      return;
    try {
      await addAdminToClub(clubId, memberId);
      fetchData(); // Refetch all data to update both admin and member lists
    } catch (error) {
      alert("Failed to promote member.");
    }
  };

  // Create a list of IDs to exclude from the search (current members + current user)
  const excludeFromSearchIds = useMemo(() =>
  {
    const memberIds =
      club?.members.map((member) =>
        typeof member === "string" ? member : member._id
      ) || [];
    if (currentUser)
    {
      return [...memberIds, currentUser._id];
    }
    return memberIds;
  }, [club, currentUser]);

  if (isLoading)
  {
    return <div style={{ padding: "2rem" }}>Loading management panel...</div>;
  }

  if (error)
  {
    return <div style={{ padding: "2rem", color: "red" }}>Error: {error}</div>;
  }

  if (!club)
  {
    return <div style={{ padding: "2rem" }}>Club not found.</div>;
  }

  if (!isAuthorized)
  {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Access Denied</h1>
        <p>You are not an administrator for this club.</p>
        <Link
          to={`/club/${clubId}`}
          style={{ color: "#3498db", textDecoration: "underline" }}
        >
          Back to Public Page
        </Link>
      </div>
    );
  }

  return (
    <div className="manage-club-page">
      <h1>Manage: {club.name}</h1>
      <div className="admin-button-panel">
        <button
          className="new-election"
          onClick={() => navigate(`/club/${clubId}/create-election`)}
        >
          + Create New Election
        </button>
        <Link to={`/club/${clubId}`} className="view-public">
          View Public Page
        </Link>
      </div>

      <div className="admin-cards">
        <div className="admin-card" style={{ background: "#2980b9" }}>
          <h3>Total Members</h3>
          <p>{stats.memberCount}</p>
        </div>
        <div className="admin-card" style={{ background: "#27ae60" }}>
          <h3>Admins</h3>
          <p>{stats.adminCount}</p>
        </div>
        <div className="admin-card" style={{ background: "#e67e22" }}>
          <h3>Active Elections</h3>
          <p>{stats.activeElections}</p>
        </div>
      </div>

      <div className="manage-club-layout">
        <div className="manage-section">
          <h2>Manage Members</h2>
          <div className="add-member-section">
            <label className="block text-gray-700 font-medium mb-2">
              Add New Member
            </label>
            <UserSearchInput
              onUserSelect={handleAddMember}
              excludeIds={excludeFromSearchIds}
            />
          </div>
            <ul className="member-list">
                {club.members.length > 0 ? (
                    club.members.map((member) => {
                        const memberDetails = typeof member === 'object' ? member : null;
                        if (!memberDetails) return null;

                        // Check if this member is already an admin
                        const isMemberAdmin = club.admins.some(admin => 
                            (typeof admin === 'string' ? admin : admin._id) === memberDetails._id
                        );

                        // Prevent removing the last admin
                        const isLastAdmin = isMemberAdmin && club.admins.length === 1;

                        return (
                            <li key={memberDetails._id} className="member-item">
                                <div className="member-info">
                                    <div className="name">{memberDetails.name}</div>
                                    <div className="id">ID: {memberDetails.studentId}</div>
                                </div>
                                
                                <div className="member-actions">
                                    {!isMemberAdmin && (
                                        <button
                                            className="promote-member-btn"
                                            onClick={() => handlePromoteMember(memberDetails._id)}
                                        >
                                            Promote
                                        </button>
                                    )}
                                    <button
                                        className="remove-member-btn"
                                        onClick={() => handleRemoveMember(memberDetails._id)}
                                        disabled={isLastAdmin}
                                        title={isLastAdmin ? "Cannot remove the last admin" : "Remove member"}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        );
                    })
                ) : (
                    <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '1rem' }}>
                        No members in this club yet.
                    </p>
                )}
            </ul>
        </div>

        <div className="manage-section">
          <h2>Elections</h2>
          <ul className="member-list">
            {elections.length > 0 ? (
              elections.map((election) => (
                <li key={election._id} className="election-list-item">
                  <div className="member-info">
                    <div className="name">{election.title}</div>
                    <div className="id">
                      Starts:{" "}
                      {new Date(election.startTime).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`status status-${election.status}`}>
                    {election.status}
                  </span>
                </li>
              ))
            ) : (
              <p
                style={{
                  textAlign: "center",
                  color: "#7f8c8d",
                  padding: "1rem",
                }}
              >
                No elections found for this club.
              </p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ManageClubPage;