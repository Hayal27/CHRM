import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import Axios from 'axios';

// --- Configuration ---
// Access environment variables using import.meta.env for Vite
// Ensure VITE_API_URL is defined in your .env file
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://hrbackend.wingtechai.com";
// --- Interfaces ---
interface User {
    user_id: string | number;
    name: string;
    lname: string;
    role_id: string | number;
    user_name: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

type AuthAction =
    | { type: 'INITIALIZE'; payload: { user: User | null; token: string | null } }
    | { type: 'LOGIN'; payload: { user: User; token: string } }
    | { type: 'LOGOUT' }
    | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextProps extends AuthState {
    login: (credentials: Record<string, any>) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    dispatch: React.Dispatch<AuthAction>;
} 

// --- Initial State ---
const getInitialState = (): AuthState => {
    try {
        const token = localStorage.getItem('token');
        const userString = localStorage.getItem('user');
        const user = userString ? JSON.parse(userString) : null;

        if (token && user) {
            return {
                user: user,
                token: token,
                isAuthenticated: true,
                isLoading: true,
            };
        }
    } catch (error) {
        console.error("Failed to parse auth state from localStorage:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
    };
};

// --- Reducer ---
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'INITIALIZE':
            // Set Axios default header only if token is valid during initialization
            if (action.payload.token) {
                 Axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
            } else {
                 delete Axios.defaults.headers.common['Authorization'];
            }
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: !!(action.payload.user && action.payload.token),
                isLoading: false,
            };
        case 'LOGIN':
            try {
                localStorage.setItem('token', action.payload.token);
                localStorage.setItem('user', JSON.stringify(action.payload.user));
                Axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
            } catch (error) {
                console.error("Failed to save auth state to localStorage:", error);
                // Consider clearing storage if saving fails critically
            }
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
            };
        case 'LOGOUT':
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            delete Axios.defaults.headers.common['Authorization'];
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            };
        case 'SET_LOADING':
             return {
                 ...state,
                 isLoading: action.payload,
             };
        default:
            return state;
    }
};

// --- Context ---
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// --- Provider ---
interface AuthProviderProps {
    children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, getInitialState());

    // --- Actions ---
    const login = useCallback(async (credentials: Record<string, any>): Promise<{ success: boolean; message?: string }> => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await Axios.post<{ success: boolean; token?: string; user?: User; message?: string }>(`${API_BASE_URL}/login`, credentials);
            if (response.data.success && response.data.token && response.data.user) {
                const { token, user } = response.data;
                dispatch({ type: 'LOGIN', payload: { user, token } });
                return { success: true };
            } else {
                console.error("Login API Error:", response.data.message || 'Unknown login error');
                dispatch({ type: 'SET_LOADING', payload: false });
                return { success: false, message: response.data.message || 'Login failed' };
            }
        } catch (error: any) {
            console.error("Login Request Failed:", error);
            const message = error.response?.data?.message || error.message || "Login failed due to a network or server error.";
             dispatch({ type: 'SET_LOADING', payload: false });
            return { success: false, message };
        }
        // No finally block needed as SET_LOADING(false) is handled in error cases and LOGIN action
    }, []); // Keep dependencies empty as dispatch is stable

    const logout = useCallback(() => {
        dispatch({ type: 'LOGOUT' });
        // Optional: Add navigation logic here if needed after logout
    }, []); // Keep dependencies empty

    // --- Effects ---
    useEffect(() => {
        const initializeAuth = async () => {
            // No need to dispatch SET_LOADING here, initial state handles it.
            const token = localStorage.getItem('token');
            const userString = localStorage.getItem('user');
            let user: User | null = null;

            if (token && userString) {
                try {
                    user = JSON.parse(userString);
                    // OPTIONAL: Add backend token validation here
                    // Example:
                    // await Axios.get('/validate-token', { headers: { Authorization: `Bearer ${token}` } });

                    // If validation passes (or not implemented), initialize
                    dispatch({ type: 'INITIALIZE', payload: { user, token } });

                } catch (error) {
                    console.error("Token validation failed or user data corrupted:", error);
                    // Token is invalid or user data is corrupt, log out
                    dispatch({ type: 'LOGOUT' }); // LOGOUT action already sets isLoading to false
                }
            } else {
                 // No token/user found, ensure state reflects this and loading is false
                 dispatch({ type: 'INITIALIZE', payload: { user: null, token: null } });
            }
        };

        initializeAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    // --- Context Value ---
    const contextValue: AuthContextProps = {
        ...state,
        login,
        logout,
        dispatch,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// --- Hook ---
const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export { AuthProvider, useAuth, AuthContext };
