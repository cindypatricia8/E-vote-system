import React, { useState, useEffect, } from 'react';
import type {  ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getManagedClubs, searchUsers, createElection } from '../../api/apiService'; 
import type { Club, User } from '../../types';


const CreateElectionPage: React.FC = () =>  {
    const navigate = useNavigate();
    
    // Form State
    const [title, setTitle] = useState('');
    const [clubId, setClubId] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [positions, setPositions] = useState([
        { title: '', maxSelections: 1, candidates: [{ candidateId: '', statement: '' }] }
    ]);

    // Data-fetching state
    const [managedClubs, setManagedClubs] = useState<Club[]>([]);
    const [userSearchResults, setUserSearchResults] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Fetch clubs this admin manages
    useEffect(() => {
        const fetchClubs = async () => {
            try {
                const response = await getManagedClubs(); 
                setManagedClubs(response.data.data.clubs);
            } catch (err) {
                setError('Failed to load your clubs.');
            }
        };
        fetchClubs();
    }, []);

    // --- Dynamic Form Handlers ---
    const addPosition = () => {
        setPositions([...positions, { title: '', maxSelections: 1, candidates: [{ candidateId: '', statement: '' }] }]);
    };
    
    const addCandidate = (positionIndex: number) => {
        const newPositions = [...positions];
        newPositions[positionIndex].candidates.push({ candidateId: '', statement: '' });
        setPositions(newPositions);
    };

    const handlePositionChange = (index: number, value: string) => {
        const newPositions = [...positions];
        newPositions[index].title = value;
        setPositions(newPositions);
    };

    const handleCandidateChange = (posIndex: number, candIndex: number, field: 'candidateId' | 'statement', value: string) => {
        const newPositions = [...positions];
        newPositions[posIndex].candidates[candIndex][field] = value;
        setPositions(newPositions);
    };

    // --- Form Submission ---
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (!title || !clubId || !startTime || !endTime || positions.length === 0) {
            setError('Please fill in all required fields.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = { title, clubId, description, startTime, endTime, positions };
            const response = await createElection(payload);
            const newElectionId = response.data.data.election._id;
            navigate(`/admin/election-live/${newElectionId}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create election.');
        } finally {
            setSubmitting(false);
        }
    };
    
    return (
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">Create a New Election</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Election Details */}
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Election Name</label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Annual Executive Election" />
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Select Club</label>
                    <select value={clubId} onChange={e => setClubId(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="">-- Select a Club --</option>
                        {managedClubs.map(club => <option key={club._id} value={club._id}>{club.name}</option>)}
                    </select>
                </div>
                <div className="flex space-x-4">
                    <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">Start Date</label>
                        <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-2">End Date</label>
                        <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
                <div>
                    <label className="block text-gray-700 font-medium mb-2">Description (optional)</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Details about this election..." className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                </div>

                {/* Positions & Candidates */}
                <hr/>
                {positions.map((pos, pIndex) => (
                    <div key={pIndex} className="p-4 border border-gray-200 rounded-lg space-y-4">
                        <label className="block text-gray-700 font-bold">Position {pIndex + 1}</label>
                        <input type="text" value={pos.title} onChange={e => handlePositionChange(pIndex, e.target.value)} placeholder="e.g., President" className="w-full border border-gray-300 rounded-lg p-2" />
                        
                        {pos.candidates.map((cand, cIndex) => (
                            <div key={cIndex} className="flex space-x-2 items-center">
                                {/* NEED TO ADD SEARCH USER */}
                                <input type="text" value={cand.candidateId} onChange={e => handleCandidateChange(pIndex, cIndex, 'candidateId', e.target.value)} placeholder="Candidate User ID" className="flex-1 border border-gray-300 rounded-lg p-2" />
                                <input type="text" value={cand.statement} onChange={e => handleCandidateChange(pIndex, cIndex, 'statement', e.target.value)} placeholder="Mission Statement" className="flex-1 border border-gray-300 rounded-lg p-2" />
                            </div>
                        ))}
                        <button type="button" onClick={() => addCandidate(pIndex)} className="text-sm text-indigo-600 hover:text-indigo-800">+ Add Candidate</button>
                    </div>
                ))}
                <button type="button" onClick={addPosition} className="w-full mt-2 p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:bg-gray-50">+ Add another Position</button>
                
                {error && <p className="text-red-500 text-center">{error}</p>}
                
                <div className="text-center pt-4">
                    <button type="submit" disabled={submitting} className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-300">
                        {submitting ? 'Creating...' : 'Create Election'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateElectionPage;