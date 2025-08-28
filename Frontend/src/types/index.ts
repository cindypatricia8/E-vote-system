export interface Vote {
  electionType: string;
  votedAt: string; 
}

// User object type from backend
export interface User {
  _id: string; 
  userId: number; 
  name: string;
  surname: string;
  gender?: string;
  dob?: string;
  faculty?: string;
  level?: string;
  phone?: string;
  votes: Vote[];
  createdAt: string;
  updatedAt: string;
}

// A helper type for creating a new user. We don't send _id, votes, or timestamps.
export type NewUserPayload = Omit<User, '_id' | 'votes' | 'createdAt' | 'updatedAt'>;

// A helper type for updating a user. All fields are optional.
export type UpdateUserPayload = Partial<NewUserPayload>;