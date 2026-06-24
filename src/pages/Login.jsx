// ================================
// STUDYQUEST - Login.jsx
// ================================

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../firebase/auth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await loginUser(email, password);

            if (result.success) {
                navigate('/dashboard'); // ✅ Correct redirect
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#0F172A'
        }}>
            <div style={{
                backgroundColor: '#1E293B',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '40px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
            }}>

                {/* Header */}
                <h1 style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '28px',
                    fontWeight: '700',
                    color: '#F8FAFC',
                    marginBottom: '8px',
                    textAlign: 'center'
                }}>
                    Welcome Back 👋
                </h1>

                <p style={{
                    fontFamily: 'Inter, sans-serif',
                    color: '#94A3B8',
                    textAlign: 'center',
                    marginBottom: '32px'
                }}>
                    Login to continue StudyQuest
                </p>

                {/* Error Message */}
                {error && (
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #EF4444',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        color: '#EF4444',
                        fontSize: '14px',
                        marginBottom: '16px',
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>

                    {/* Email Input */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{
                            display: 'block',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            color: '#94A3B8',
                            marginBottom: '6px'
                        }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                backgroundColor: '#0F172A',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#F8FAFC',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '16px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Password Input */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '14px',
                            color: '#94A3B8',
                            marginBottom: '6px'
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                backgroundColor: '#0F172A',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#F8FAFC',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '16px',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: loading ? '#4338CA' : '#4F46E5',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            fontFamily: 'Poppins, sans-serif',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                </form>

                {/* Register Link */}
                <p style={{
                    textAlign: 'center',
                    marginTop: '24px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    color: '#94A3B8'
                }}>
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        style={{
                            color: '#6366F1',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}
                    >
                        Register here
                    </Link>
                </p>

            </div>
        </div>
    );
};

export default Login;