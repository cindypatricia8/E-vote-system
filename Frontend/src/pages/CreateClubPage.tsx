import React, { useState, useEffect, useRef } from 'react';
import type { FormEvent, } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createClub, searchUsers } from '../api/apiService';
import type { User } from '../types';
import './CreateClubPage.css';


const CreateClubPage: React.FC = () =>  {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({ clubName: '', clubDescription: '' });
    const [errors, setErrors] = useState<{ clubName?: string }>({});
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedAdmins, setSelectedAdmins] = useState<User[]>([]);
    const [isLoadingSearch, setIsLoadingSearch] = useState(false);
    const debounceTimeout = useRef<number | null>(null);

    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        setIsLoadingSearch(true);
        debounceTimeout.current = window.setTimeout(async () => {
            try {
                const response = await searchUsers(searchQuery);
                const availableUsers = response.data.data.users.filter(
                    user => !selectedAdmins.some(admin => admin._id === user._id)
                );
                setSearchResults(availableUsers);
            } catch (error) {
                console.error("Failed to search users:", error);
            } finally {
                setIsLoadingSearch(false);
            }
        }, 500);

        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        };
    }, [searchQuery, selectedAdmins]);

    const handleSelectAdmin = (user: User) => {
        setSelectedAdmins(prev => [...prev, user]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleRemoveAdmin = (userId: string) => {
        setSelectedAdmins(prev => prev.filter(admin => admin._id !== userId));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage(null);
        
        const validationErrors = { clubName: !formData.clubName.trim() ? 'Club name is required.' : '' };
        if (validationErrors.clubName) {
            setErrors(validationErrors);
            return;
        }
        
        setIsSubmitting(true);
        try {
            const adminIds = selectedAdmins.map(admin => admin._id);
            const payload = {
                name: formData.clubName,
                description: formData.clubDescription,
                admins: adminIds,
            };

            await createClub(payload);
            setMessage({ type: 'success', text: 'Club created successfully! Redirecting...' });
            setTimeout(() => navigate('/clubs'), 2000);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'An unexpected error occurred.';
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="create-club-page">
            <header className="page-header">
                <h1>Create a New Club</h1>
                <Link to="/" className="home-button">Home</Link>
            </header>

            <div className="container">
                <div className="message-area">
                    {message && (
                        <div className={message.type === 'success' ? 'message-success' : 'message-error'}>
                            {message.text}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="clubName">Club Name</label>
                        <input
                            type="text"
                            id="clubName"
                            className="form-input"
                            value={formData.clubName}
                            onChange={(e) => setFormData({...formData, clubName: e.target.value})}
                            placeholder="e.g., Computer Science Society"
                            required
                        />
                        <div className="error-message">{errors.clubName}</div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="clubDescription">Description</label>
                        <textarea
                            id="clubDescription"
                            className="form-input"
                            value={formData.clubDescription}
                            onChange={(e) => setFormData({...formData, clubDescription: e.target.value})}
                            placeholder="A short summary of the club's mission and activities."
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="adminSearch">Add Other Admins (Optional)</label>
                        <div className="admin-search-container">
                            <input
                                type="text"
                                id="adminSearch"
                                className="form-input"
                                placeholder="Search by name or student ID to add an admin..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoComplete="off"
                            />
                            {isLoadingSearch && <div className="spinner"></div>}
                            {searchQuery.length > 1 && (
                                <div className="search-results">
                                    {!isLoadingSearch && searchResults.length === 0 && (
                                        <div className="search-empty-state">No users found.</div>
                                    )}
                                    {searchResults.map(user => (
                                        <div key={user._id} className="search-result-item" onClick={() => handleSelectAdmin(user)}>
                                            {user.name}
                                            <span className="student-id">({user.studentId})</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">The user who creates the club is automatically an admin.</div>
                        
                        <div className="selected-admins-list">
                            {selectedAdmins.map(admin => (
                                <div key={admin._id} className="admin-pill">
                                    <span>{admin.name}</span>
                                    <button type="button" onClick={() => handleRemoveAdmin(admin._id)}>×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="submit-button" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Club'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateClubPage;