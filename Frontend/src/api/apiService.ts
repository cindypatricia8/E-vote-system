import axios from 'axios';
import type { User, NewUserPayload, UpdateUserPayload } from '../types';

const API_URL = 'http://localhost:3000/api/users';

// --- User API Calls ---

export const fetchUsers = () => axios.get<User[]>(API_URL);

export const getUserById = (userId: number) => axios.get<User>(`${API_URL}/${userId}`);

export const createUser = (userData: NewUserPayload) => {
  return axios.post<User>(API_URL, userData);
};

export const updateUser = (userId: number, updateData: UpdateUserPayload) => {
  return axios.put<User>(`${API_URL}/${userId}`, updateData);
};

export const deleteUser = (userId: number) => axios.delete(`${API_URL}/${userId}`);

// --- Vote API Calls ---
export const addUserVote = (userId: number, electionType: string) => {
  const voteUrl = `${API_URL}/${userId}/votes`;
  return axios.post<User>(voteUrl, { electionType });
};