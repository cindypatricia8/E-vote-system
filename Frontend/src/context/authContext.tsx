import {
    registerUser as apiRegisterUser,
    loginUser as apiLoginUser,
    setAuthToken
} from '../api/apiService';
import type { UserRegistrationPayload, LoginPayload } from '../types';

export const register = async (userData: UserRegistrationPayload) => {
    const response = await apiRegisterUser(userData);
    if (response.data.token) {
        setAuthToken(response.data.token);
    }
    return response.data.data; // Returns { user }
};

export const login = async (credentials: LoginPayload) => {
    const response = await apiLoginUser(credentials);
    if (response.data.token) {
        setAuthToken(response.data.token);
    }
    return response.data.data; // Returns { user }
};
