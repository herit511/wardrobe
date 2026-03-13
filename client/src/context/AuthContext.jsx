import { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Initial load: verify token
    useEffect(() => {
        const loadUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get('/auth/me');
                if (res.success) {
                    setUser(res.data);
                }
            } catch (error) {
                console.error('Failed to load user:', error);
                localStorage.removeItem('token');
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, [token]);

    const register = async (name, email, password) => {
        try {
            const res = await api.post('/auth/register', { name, email, password });
            if (res.success) {
                localStorage.setItem('token', res.token);
                setToken(res.token);
                setUser(res.user);
                return { success: true };
            }
            return { success: false, error: res.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            if (res.success) {
                localStorage.setItem('token', res.token);
                setToken(res.token);
                setUser(res.user);
                return { success: true };
            }
            return { success: false, error: res.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
