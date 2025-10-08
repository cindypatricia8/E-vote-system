import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ElectionLivePage() {
    const navigate = useNavigate();
    const { electionId } = useParams(); // Get the ID from the URL

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', background: '#f4f6f9', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', margin: 0 }}>
            <div style={{ background: 'white', padding: '50px', borderRadius: '15px', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '20px', color: '#27ae60' }}>Election is Live! 🎉</h1>
                <p>Your election has been created successfully.</p>
                <p style={{ fontSize: '0.8rem', color: '#777' }}>Election ID: {electionId}</p>
                <button 
                    onClick={() => navigate('/admin/dashboard')} 
                    style={{ marginTop: '20px', padding: '15px 30px', background: '#2980b9', color: 'white', border: 'none', borderRadius: '10px', fontSize: '18px', cursor: 'pointer' }}>
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}