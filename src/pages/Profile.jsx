import { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { currentUser, refreshUserData } = useAuth();
    const [name, setName] = useState(currentUser?.displayName || '');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await updateProfile(auth.currentUser, { displayName: name });

            await setDoc(doc(db, 'users', auth.currentUser.uid), {
                merge: true
            });

            await refreshUserData();
            setSuccess('Profile updated successfully!');
        } catch (err) {
            console.log('Update error:', err.code, err.message);
            setError(err.message);
        }

        setLoading(false);
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '40px 20px',
            backgroundColor: '#0F172A',
            minHeight: '100vh'
        }}>
            <div style={{
                backgroundColor: '#1E293B',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '32px',
                width: '100%',
                maxWidth: '420px'
            }}>
                <h1 style={{
                    fontFamily: 'Poppins, sans-serif',
                    fontSize: '22px',
                    color: '#F8FAFC',
                    marginBottom: '20px'
                }}>
                    Your Profile
                </h1>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(239,68,68,0.1)',
                        border: '1px solid #EF4444',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: '#EF4444',
                        fontSize: '14px',
                        marginBottom: '14px'
                    }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        backgroundColor: 'rgba(16,185,129,0.1)',
                        border: '1px solid #10B981',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        color: '#10B981',
                        fontSize: '14px',
                        marginBottom: '14px'
                    }}>
                        {success}
                    </div>
                )}

                <form onSubmit={handleUpdate}>
                    <label style={{
                        display: 'block',
                        fontSize: '13px',
                        color: '#94A3B8',
                        marginBottom: '6px'
                    }}>
                        Display Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        required
                        style={{
                            width: '100%',
                            padding: '11px 14px',
                            backgroundColor: '#0F172A',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            color: '#F8FAFC',
                            fontSize: '15px',
                            marginBottom: '18px',
                            outline: 'none',
                            boxSizing: 'border-box'
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#4F46E5',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontFamily: 'Poppins, sans-serif',
                            fontWeight: 600,
                            fontSize: '15px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;