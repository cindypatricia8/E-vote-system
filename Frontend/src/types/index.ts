// Authentication =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
export interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: User;
  };
}

// Payloads for sending data to the API
export interface UserRegistrationPayload {
  studentId: string;
  email: string;
  password: string;
  name: string;
}

export interface LoginPayload {
  studentId: string;
  password: string;
}


// Core Models =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
export interface User {
  _id: string;
  studentId: string;
  email: string;
  name: string;
  faculty?: string;     
  gender?: string;      
  yearOfStudy?: number; 
  roles: ('student' | 'clubAdmin' | 'systemAdmin')[];
  votedInElections: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Club {
  _id: string;
  name: string;
  description?: string;
  admins: User[] | string[]; // Can be populated or just IDs
  members: User[] | string[];
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  candidateId: User;
  statement?: string;
}

export interface Position {
  _id: string;
  title: string;
  maxSelections: number;
  candidates: Candidate[];
}

export interface Election {
  _id: string;
  title: string;
  description?: string;
  clubId: Club; // Assume club details are populated
  status: 'draft' | 'active' | 'closed';
  startTime: string;
  endTime: string;
  positions: Position[];
  createdAt: string;
  updatedAt: string;
}


// Voting =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
export interface VoteSelectionPayload {
  positionId: string;
  candidateId: string;
}

export interface ElectionResultCandidate {
  candidateId: string;
  name: string;
  voteCount: number;
}

export interface ElectionResultPosition {
  positionId: string;
  positionTitle: string;
  candidates: ElectionResultCandidate[];
}

export interface ElectionResultsResponse {
  status: string;
  data: {
    electionTitle: string;
    clubName: string;
    totalBallotsCast: number;
    results: ElectionResultPosition[];
  };
}