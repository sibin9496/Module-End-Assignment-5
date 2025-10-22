import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Check if user is logged in on app start
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            getUser();
        } else {
            setLoading(false);
        }
    }, []);

    const getUser = async () => {
        try {
            const res = await axios.get('/api/auth/me');
            setUser(res.data.data);
            setError(''); // Clear any previous errors
        } catch (err) {
            console.error('Error getting user:', err);
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setError('Session expired. Please login again.');
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setError('');
            const res = await axios.post('/api/auth/register', userData);

            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                setUser(res.data.user);
                setError(''); // Clear error on success
                return { success: true };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Registration failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const login = async (userData) => {
        try {
            setError('');
            const res = await axios.post('/api/auth/login', userData);

            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                setUser(res.data.user);
                setError(''); // Clear error on success
                return { success: true };
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Login failed';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setError(''); // Clear error on logout
    };

    const clearError = () => setError('');

    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};