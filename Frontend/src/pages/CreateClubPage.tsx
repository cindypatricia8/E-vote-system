import React, { useState,  useMemo } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createClub } from '../api/apiService';
import type { User } from '../types';
import { useAuth } from '../context/authContext'; 
import UserSearchInput from '../components/UserSearchInput';
import './CreateClubPage.css';


interface FormData {
    clubName: string;
    clubDescription: string;
}
type FormErrors = Partial<Record<keyof FormData, string>>;


const CreateClubPage: React.FC = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuth(); 
    

    const [formData, setFormData] = useState<FormData>({ clubName: '', clubDescription: '' });
    const [errors, setErrors] = useState<FormErrors>({});
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [selectedAdmins, setSelectedAdmins] = useState<User[]>([]);

    const handleSelectAdmin = (user: User) => {
        setSelectedAdmins(prev => [...prev, user]);
    };

    const handleRemoveAdmin = (userId: string) => {
        setSelectedAdmins(prev => prev.filter(admin => admin._id !== userId));
    };

    const excludedAdminIds = useMemo(() => {
        const ids = selectedAdmins.map(admin => admin._id);
        if (currentUser) {
            ids.push(currentUser._id);
        }
        return ids;
    }, [selectedAdmins, currentUser]);

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
            setTimeout(() => navigate('/dashboard'), 2000);
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
                <Link to="/dashboard" className="home-button">Back to Dashboard</Link>
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
                       <label htmlFor="clubname" className="label-white">Club Name</label>
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
                        
                        <UserSearchInput
                            onUserSelect={handleSelectAdmin}
                            placeholder="Search by name or student ID..."
                            excludeIds={excludedAdminIds}
                        />
                        
                        <label htmlFor='instruction'>The user who creates the club is automatically an admin.</label>
                        
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
};
export default CreateClubPage;