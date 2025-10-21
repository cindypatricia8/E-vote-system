import axios from 'axios';
import type {
  AuthResponse,
  UserRegistrationPayload,
  LoginPayload,
  Club,
  Election,
  VoteSelectionPayload,
  ElectionResultsResponse,
  User,
  UpdateProfilePayload,
  CreateElectionPayload,
} from "../types";

// Create a configured instance of Axios
const api = axios.create({
    baseURL: 'http://localhost:3000/api', // backend url 
    headers: {
        'Content-Type': 'application/json',
    },
});

// Axios Request Interceptor
// It retrieves the token from localStorage and adds it to the Authorization header.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// USER API =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

export const registerUser = (userData: UserRegistrationPayload) =>
    api.post<AuthResponse>('/users/register', userData);

export const loginUser = (credentials: LoginPayload) =>
    api.post<AuthResponse>('/users/login', credentials);

export const getUserProfile = () =>
    api.get<{ status: 'success', data: { user: User } }>('/users/profile');

export const updateUserProfile = (updateData: UpdateProfilePayload) =>
    api.put<{ status: 'success', data: { user: User } }>('/users/profile', updateData);

export const searchUsers = (query: string) =>
    api.get<{ status: 'success', data: { users: User[] } }>(`/users/search?q=${query}`);

// CLUB API =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

export const createClub = (clubData: { name: string; description?: string; admins?: string[] }) =>
    api.post<{ status: 'success', data: { club: Club } }>('/clubs', clubData);

export const getAllClubs = () =>
    api.get<{ status: 'success', results: number, data: { clubs: Club[] } }>('/clubs');

export const getManagedClubs = () =>
    api.get<{ status: 'success', results: number, data: { clubs: Club[] } }>('/clubs');

export const getClubById = (clubId: string) =>
    api.get<{ status: 'success', data: { club: Club } }>(`/clubs/${clubId}`);

export const addMemberToClub = (clubId: string, userId: string) =>
    api.post<{ status: 'success', data: { club: Club } }>(`/clubs/${clubId}/members`, { userId });

export const removeMemberFromClub = (clubId: string, memberId: string) =>
    api.delete<{ status: 'success', data: { club: Club } }>(`/clubs/${clubId}/members/${memberId}`);

export const addAdminToClub = (clubId: string, userId: string) =>
    api.post<{ status: 'success', data: { club: Club } }>(`/clubs/${clubId}/admins`, { userId });

// ELECTION API =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

export const createElection = (electionData: CreateElectionPayload) =>
    api.post<{ status: 'success', data: { election: Election } }>('/elections', electionData);

export const getActiveElections = () =>
    api.get<{ status: 'success', results: number, data: { elections: Election[] } }>('/elections/active');

export const getElectionById = (electionId: string) =>
    api.get<{ status: 'success', data: { election: Election } }>(`/elections/${electionId}`);

export const getElectionsByClub = (clubId: string) =>
    api.get<{ status: 'success', data: { elections: Election[] } }>(`/elections/club/${clubId}`);

// VOTE API =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

export const castVote = (electionId: string, selections: VoteSelectionPayload[]) =>
    api.post<{ status: 'success', message: string }>(`/vote/election/${electionId}/cast`, { selections });

export const getElectionResults = (electionId: string) =>
    api.get<ElectionResultsResponse>(`/vote/election/${electionId}/results`);


// TOKEN MANAGEMENT =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// Functions for authentication 

export const setAuthToken = (token: string | null) => {
    if (token) {
        localStorage.setItem('authToken', token);
    } else {
        localStorage.removeItem('authToken');
    }
};