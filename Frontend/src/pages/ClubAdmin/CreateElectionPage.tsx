import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getClubById, createElection } from '../../api/apiService';
import type { User, CreateElectionPayload } from '../../types';
import UserSearchInput from '../../components/UserSearchInput';
import './CreateElectionPage.css'; 


interface CandidateState {
  user: User | null; 
  statement: string;
}

interface PositionState {
  title: string;
  maxSelections: number;
  candidates: CandidateState[];
}

const CreateElectionPage: React.FC = () => {
  //const navigate = useNavigate();
  const {clubId} = useParams<{clubId: string}>();

  const [title, setTitle] = useState('');
  const [clubName, setClubName] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const [newElectionId, setNewElectionId] = useState<string | null>(null);

  const [positions, setPositions] = useState<PositionState[]>([
    { title: '', maxSelections: 1, candidates: [{ user: null, statement: '' }] }
  ]);
  
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch the clubs this admin manages when the component loads
  useEffect(() => {
    if (!clubId) return;
    const fetchClubName = async () => {
      try {
        const response = await getClubById(clubId);
        setClubName(response.data.data.club.name);
      } catch (err) {
        setError('Could not fetch club name. Please try again.');
      }
    };
    fetchClubName();
  }, [clubId]);

  // Form Handlers 
  const addPosition = () => {
    setPositions([...positions, { title: '', maxSelections: 1, candidates: [{ user: null, statement: '' }] }]);
  };

  const addCandidate = (positionIndex: number) => {
    const newPositions = [...positions];
    newPositions[positionIndex].candidates.push({ user: null, statement: '' });
    setPositions(newPositions);
  };

  const handlePositionChange = (index: number, field: 'title' | 'maxSelections', value: string) => {
    const newPositions = [...positions];
    if (field === 'maxSelections') {
      newPositions[index][field] = parseInt(value, 10) || 1;
    } else {
      newPositions[index][field] = value;
    }
    setPositions(newPositions);
  };

  const handleSelectCandidate = (posIndex: number, candIndex: number, selectedUser: User) => {
    const newPositions = [...positions];
    newPositions[posIndex].candidates[candIndex].user = selectedUser;
    setPositions(newPositions);
  };

  const handleCandidateStatementChange = (posIndex: number, candIndex: number, value: string) => {
    const newPositions = [...positions];
    newPositions[posIndex].candidates[candIndex].statement = value;
    setPositions(newPositions);
  };
  
  const handleRemoveCandidate = (posIndex: number, candIndex: number) => {
    const newPositions = [...positions];
    // Clearing the user allows the search input to reappear
    newPositions[posIndex].candidates[candIndex].user = null; 
    setPositions(newPositions);
  };

  // Form Submission

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!title || !clubId || !startTime || !endTime || positions.length === 0) {
      setError('Please fill in all required fields: Name, Club, Start Date, and End Date.');
      return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      setError('The end date must be after the start date.');
      return;
    }

    setSubmitting(true);
    try {
      // Create payload from format given
      const payload: CreateElectionPayload = {
        title,
        clubId: clubId!,
        description,
        startTime,
        endTime,
        positions: positions.map(p => ({
          title: p.title,
          maxSelections: p.maxSelections,
          // Filter out any empty candidate slots and map to the correct format
          candidates: p.candidates
            .filter(c => c.user) 
            .map(c => ({
              candidateId: c.user!._id, 
              statement: c.statement,
            })),
        })).filter(p => p.title.trim() !== '' && p.candidates.length > 0), 
      };
      
      if (payload.positions.length === 0) {
        setError('You must create at least one position with a title and a valid candidate.');
        setSubmitting(false);
        return;
      }

      const response = await createElection(payload);
      setNewElectionId(response.data.data.election._id);

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create the election.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    setPositions([{ title: '', maxSelections: 1, candidates: [{ user: null, statement: '' }] }]);
    setNewElectionId(null);
    setError('');
  };
    
  return (
    <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-4xl mx-auto my-8">
      {newElectionId ? (
        // Live election page
        <div className="success-view">
          <h1>Election is Live! 🎉</h1>
          <p>Your election has been created successfully and is now active.</p>
          <div className="election-id-display">
            Election ID: {newElectionId}
          </div>
          <div className="success-actions">
            <Link to={`/club/${clubId}/manage`} className="btn btn-primary">
              Back to Management
            </Link>
            <button onClick={resetForm} className="btn btn-secondary">
              Create Another Election
            </button>
          </div>
        </div>
      ) : (
        // Form view
        <>
          <h1 className="text-3xl font-bold mb-2 text-center text-indigo-700">
            Create a New Election
          </h1>
          <h2 className="text-xl font-medium mb-6 text-center text-gray-500">
            For: {clubName}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Election details */}
            <div className="p-4 border border-gray-200 rounded-lg space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Election Details
              </h2>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Election Name*
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Annual Executive Election"
                />
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-2">
                    Start Date*
                  </label>
                  <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 font-medium mb-2">
                    End Date*
                  </label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Details about this election..."
                  className="form-input"
                ></textarea>
              </div>
            </div>

            {/* Positions & Candidates */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Positions & Candidates
              </h2>
              {positions.map((pos, pIndex) => (
                <div
                  key={pIndex}
                  className="p-4 border border-gray-200 rounded-lg space-y-4 bg-gray-50"
                >
                  <input
                    type="text"
                    value={pos.title}
                    onChange={(e) =>
                      handlePositionChange(pIndex, "title", e.target.value)
                    }
                    placeholder={`Position Title (e.g., President)*`}
                    className="form-input font-semibold"
                  />

                  <label className="text-sm font-medium text-gray-600">
                    Candidates for "{pos.title || `Position ${pIndex + 1}`}"
                  </label>
                  {pos.candidates.map((cand, cIndex) => (
                    <div
                      key={cIndex}
                      className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-center"
                    >
                      <div className="flex-1 w-full">
                        {cand.user ? (
                          <div
                            className="admin-pill"
                            style={{
                              backgroundColor: "#e0e7ff",
                              color: "#4338ca",
                              justifyContent: "space-between",
                              width: "100%",
                              padding: "0.65rem 1rem",
                            }}
                          >
                            <span>
                              {cand.user.name} ({cand.user.studentId})
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveCandidate(pIndex, cIndex)
                              }
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <UserSearchInput
                            onUserSelect={(user) =>
                              handleSelectCandidate(pIndex, cIndex, user)
                            }
                            placeholder="Search for a candidate..."
                            excludeIds={
                              pos.candidates
                                .map((c) => c.user?._id)
                                .filter(Boolean) as string[]
                            }
                          />
                        )}
                      </div>
                      <input
                        type="text"
                        value={cand.statement}
                        onChange={(e) =>
                          handleCandidateStatementChange(
                            pIndex,
                            cIndex,
                            e.target.value
                          )
                        }
                        placeholder="Mission Statement (optional)"
                        className="flex-1 w-full border border-gray-300 rounded-lg p-2"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addCandidate(pIndex)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    + Add Candidate to this Position
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addPosition}
                className="w-full mt-2 p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50"
              >
                + Add another Position
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-center font-semibold">{error}</p>
            )}

            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-300"
              >
                {submitting ? "Creating..." : "Create Election"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default CreateElectionPage;