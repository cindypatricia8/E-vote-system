import React from 'react';
import { Routes, Route } from 'react-router-dom';


import Login from './pages/login';
import SignUp from './pages/signUp';
import VotingDashboard from './pages/VoteDashboard';
import VotingPage from './pages/voting';
import MainVoting from './pages/main-voting';
import CreateClubPage from './pages/CreateClubPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateElectionPage from './pages/admin/CreateElectionPage';
import ElectionLivePage from './pages/admin/ElectionLivePage';
import AdminLayout from './pages/admin/AdminLayout';
import HomePage from './pages/HomePage';


function App() {
  return (
    <div className="App">
      <Routes>
        {/* --- Public & Main Routes --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUp />} />
        
        <Route path="/voting" element={<VotingPage />} />
        <Route path="/voting-dashboard" element={<VotingDashboard />} />
        <Route path="/create-club" element={<CreateClubPage />} />

        <Route path="/admin" element={<AdminLayout />}>

          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="create-election" element={<CreateElectionPage />} />
          <Route path="election-live/:electionId" element={<ElectionLivePage />} />
        </Route>
        
      </Routes>
    </div>
  );
}

export default App;