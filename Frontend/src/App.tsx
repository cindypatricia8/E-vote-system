import React from 'react';
import { Routes, Route } from 'react-router-dom';


import Login from './pages/login';
import SignUp from './pages/signUp';
import ClubDetailsPage from './pages/ClubDetailsPage';
import votepagetest from './pages/voting';
import VotingPage from './pages/VotingPage';
import CreateClubPage from './pages/CreateClubPage';

import ManageClubPage from './pages/ClubAdmin/ManageClubPage';
import CreateElectionPage from './pages/ClubAdmin/CreateElectionPage';
import ClubAdminLayout from './pages/ClubAdmin/ClubAdminLayout';
import UserDashboard from './pages/UserDashboard';

import RedirectIfAuth from './components/RedirectIfAuth';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* --- Public & Main Routes --- */}
        {/* UserDashboard with clubs user is in */}
        <Route element={<RedirectIfAuth />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<SignUp />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<UserDashboard />} /> 
          <Route path="/create-club" element={<CreateClubPage />} />
          
          <Route path="/club/:clubId" element={<ClubDetailsPage />} />

          <Route element={<ClubAdminLayout/>}>
            <Route path="/club/:clubId/manage" element={<ManageClubPage/>} />
            <Route path="/club/:clubId/create-election" element={<CreateElectionPage/>} />
          </Route>
        
          <Route path="/voting" element={<VotingPage />} />
        </Route>

        
      </Routes>
    </div>
  );
}

export default App;