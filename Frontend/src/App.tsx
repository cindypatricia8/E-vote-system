import React from 'react';
import { Routes, Route } from 'react-router-dom';


import Login from './pages/login';
import SignUp from './pages/signUp';

const VotingPage = () => <div>Welcome to the Voting Page!</div>; 

function App() {
  return (
    <div className="App">
      <Routes> 
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/voting" element={<VotingPage />} />
      </Routes>
    </div>
  );
}

export default App;