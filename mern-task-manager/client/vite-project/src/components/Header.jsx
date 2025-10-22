import React from 'react';
import { useAuth } from '../context/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();

    return (
        <header style={{
            backgroundColor: '#343a40',
            color: 'white',
            padding: '1rem 0',
            marginBottom: '2rem'
        }}>
            <div className="container">
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h1>Personal Task Manager</h1>
                    {user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span>Welcome, {user.name}</span>
                            <button
                                onClick={logout}
                                className="btn btn-primary"
                                style={{ backgroundColor: '#6c757d', border: 'none' }}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;