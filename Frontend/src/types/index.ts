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
  faculty?: string;
  gender?: string;
  yearOfStudy?: number;
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

export interface UpdateProfilePayload {
    name?: string;
    faculty?: string;
    gender?: string;
    yearOfStudy?: number;
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

// Represents a single candidate within the results payload
export interface ResultCandidate {
  candidateId: string;
  name: string;
  voteCount: number;
}

// Represents a single position within the results payload
export interface ResultPosition {
  positionId: string;
  positionTitle: string;
  candidates: ResultCandidate[];
}

export interface ElectionResultsResponse {
  status: string;
  data: {
    results: ResultPosition[];
    totalBallotsCast: number;
  };
}
export interface CreateCandidatePayload {
    candidateId: string;
    statement: string;
}

export interface CreatePositionPayload {
    title: string;
    maxSelections: number;
    candidates: CreateCandidatePayload[];
}

export interface CreateElectionPayload {
    title: string;
    clubId: string;
    description?: string;
    startTime: string;
    endTime: string;
    positions: CreatePositionPayload[];
}

export type UpdateElectionPayload = Partial<{
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'draft' | 'active' | 'closed';
  positions: any[]; 
}>;