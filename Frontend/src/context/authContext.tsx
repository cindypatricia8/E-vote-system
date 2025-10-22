import { createContext, useContext, useState, useEffect,  } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRegistrationPayload, LoginPayload } from '../types';
import * as api from '../api/apiService';


interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean; 
    login: (credentials: LoginPayload) => Promise<void>;
    register: (userData: UserRegistrationPayload) => Promise<void>;
    logout: () => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider is used to authenticate parts of the application top allow access to some buttons or not 
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            // If we have a token in state, try to validate it with the backend
            if (token) {
                try {
                    const response = await api.getUserProfile();
                    setUser(response.data.data.user); // Set the user if the token is valid
                } catch (error) {
                    // If the token is invalid or expired clear everything
                    console.error("Token validation failed:", error);
                    localStorage.removeItem('authToken');
                    setToken(null);
                    setUser(null);
                }
            }
            setIsLoading(false);
        };

        validateToken();
    }, []); 

    // --- Authentication Functions ---

    const login = async (credentials: LoginPayload) => {
        const response = await api.loginUser(credentials);
    
        const newToken = response.data.token;
        const user = response.data.data.user;
        
        localStorage.setItem('authToken', newToken);
        setToken(newToken);
        setUser(user);
    };

    const register = async (userData: UserRegistrationPayload) => {
        const response = await api.registerUser(userData);

        const newToken = response.data.token;
        const user = response.data.data.user;

        localStorage.setItem('authToken', newToken);
        setToken(newToken);
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        window.location.href = '/login';
    };

    const value = { user, token, isLoading, login, register, logout };

    return (
        <AuthContext.Provider value={value}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};