import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getElectionById, castVote } from '../api/apiService';
import type { Election } from '../types';
import './VotingPage.css';

// Type for the state that tracks user's selections
type SelectionsState = Record<string, string>; // { [positionId]: candidateId }

const VotingPage: React.FC = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const navigate = useNavigate();

  const [election, setElection] = useState<Election | null>(null);
  const [selections, setSelections] = useState<SelectionsState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!electionId) return;

    const fetchElection = async () => {
      try {
        const response = await getElectionById(electionId);
        const fetchedElection = response.data.data.election;
        
        // Security check: If the election isn't active, redirect away
        const isClosed = fetchedElection.status === 'closed' || new Date() > new Date(fetchedElection.endTime);
        if (isClosed || fetchedElection.status !== 'active') {
          alert("This election is not currently active for voting.");
          navigate(`/election/${electionId}`);
          return;
        }
        
        setElection(fetchedElection);
      } catch (err) {
        setError('Failed to load the election ballot.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchElection();
  }, [electionId, navigate]);

  const handleSelectionChange = (positionId: string, candidateId: string) => {
    setSelections(prev => ({
      ...prev,
      [positionId]: candidateId,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Object.keys(selections).length !== election?.positions.length) {
      setError('Please make a selection for every position.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Transform the state object into the array format the API expects
      const payload = Object.entries(selections).map(([positionId, candidateId]) => ({
        positionId,
        candidateId,
      }));
      
      await castVote(electionId!, payload);

      // On success, show an alert and redirect
      alert('Your vote has been cast successfully!');
      navigate(`/club/${election?.clubId._id}`);

    } catch (err: any) {
      setError(err.response?.data?.message || 'A critical error occurred. Your vote was not cast.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Loading ballot...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!election) return <div>Election not found.</div>;

  return (
    <div className="voting-page-container">
      <div className="voting-header">
        <h1>{election.title}</h1>
        <p>Select one candidate for each position below and submit your vote.</p>
      </div>

      <form onSubmit={handleSubmit} className="ballot-form">
        {election.positions.map(position => (
          <div key={position._id} className="position-voting-card">
            <h2>{position.title}</h2>
            
            {position.candidates.map(candidate => (
              <label 
                key={candidate.candidateId._id} 
                className={`candidate-option ${selections[position._id] === candidate.candidateId._id ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={position._id}
                  value={candidate.candidateId._id}
                  checked={selections[position._id] === candidate.candidateId._id}
                  onChange={() => handleSelectionChange(position._id, candidate.candidateId._id)}
                />
                <div>
                  <div className="name">{candidate.candidateId.name}</div>
                  <div className="statement">"{candidate.statement || 'No statement provided.'}"</div>
                </div>
              </label>
            ))}
          </div>
        ))}

        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button type="submit" className="submit-vote-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Final Vote'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default VotingPage;