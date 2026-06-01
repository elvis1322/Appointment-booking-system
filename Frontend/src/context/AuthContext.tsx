import {
    createContext,
    useContext,
    useEffect,
    useCallback,
    useReducer,
    type ReactNode,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User, AuthResponse } from '../types/auth.types';
import api from '../api/axiosConfig';

type AuthState = {
    user: User | null;
    loading: boolean;
};

type AuthAction =
    | { type: 'INIT'; user: User | null }
    | { type: 'LOGIN'; payload: AuthResponse }
    | { type: 'LOGOUT' }
    | { type: 'UPDATE_USER'; user: User };;

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'INIT':
            return { user: action.user, loading: false };
        case 'LOGIN':
            return { user: action.payload.user, loading: false };
        case 'LOGOUT':
            return { user: null, loading: false };
        case 'UPDATE_USER':
            return { ...state, user: action.user };
        default:
            return state;
        
          
    }
}

const initialState: AuthState = { user: null, loading: true };

interface AuthContextType {
    user: User | null;
    login: (data: AuthResponse) => void;
    logout: () => Promise<void>;
    updateUser: (userData: User) => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isStoredUserValid(u: unknown): u is User {
    if (!u || typeof u !== 'object') return false;
    const o = u as Record<string, unknown>;
    return (
        typeof o.id === 'string' &&
        typeof o.email === 'string' &&
        Array.isArray(o.roles) &&
        o.roles.every((r) => typeof r === 'string')
    );
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    const clearStorage = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }, []);

    const logout = useCallback(async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            try {
                await api.post('/auth/logout', { refreshToken });
            } catch {
                /* serveri mund të mos pranojë token — vazhdojmë me pastrimin lokal */
            }
        }
        clearStorage();
        dispatch({ type: 'LOGOUT' });
    }, [clearStorage]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (!token || !savedUser) {
            dispatch({ type: 'INIT', user: null });
            return;
        }

        try {
            const decoded = jwtDecode<{ exp?: number }>(token);
            const now = Date.now() / 1000;
            if (decoded.exp != null && decoded.exp < now) {
                clearStorage();
                dispatch({ type: 'INIT', user: null });
                return;
            }

            const parsed: unknown = JSON.parse(savedUser);
            if (!isStoredUserValid(parsed)) {
                clearStorage();
                dispatch({ type: 'INIT', user: null });
                return;
            }

            dispatch({ type: 'INIT', user: parsed });
        } catch {
            clearStorage();
            dispatch({ type: 'INIT', user: null });
        }
    }, [clearStorage]);

    const login = useCallback((data: AuthResponse) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        dispatch({ type: 'LOGIN', payload: data });
    },
     []);

    const updateUser = useCallback((userData: Partial<User>) => {
  
    const currentLocalUser = JSON.parse(localStorage.getItem('user') || '{}');
    

    const updatedUser = { ...currentLocalUser, ...userData };

   
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // 4. Përditësojmë state-in global
    dispatch({ type: 'UPDATE_USER', user: updatedUser });
}, []);

    return (
        <AuthContext.Provider
            value={{
                user: state.user,
                login,
                logout,
                updateUser,
                isAuthenticated: !!state.user,
                loading: state.loading,
            }}
        >
            {!state.loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
