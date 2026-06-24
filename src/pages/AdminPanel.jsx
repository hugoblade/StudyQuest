import React, { useEffect, useState } from 'react';
import { getAllUsers, addBadgeToUser } from '../firebase/firestore';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [badgeName, setBadgeName] = useState('');

    useEffect(() => {
        getAllUsers().then(setUsers);
    }, []);

    const handleAwardBadge = async () => {
        await addBadgeToUser(selectedUser, badgeName);
        alert('Badge awarded!');
    };

    return (
        <div className="admin-panel">
            <h2>Admin Panel</h2>
            <div className="admin-section">
                <h3>Award Badge</h3>
                <select onChange={(e) => setSelectedUser(e.target.value)} value={selectedUser}>
                    <option value="">Select User</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                </select>
                <input type="text" placeholder="Badge name" value={badgeName} onChange={(e) => setBadgeName(e.target.value)} />
                <button onClick={handleAwardBadge}>Award</button>
            </div>
        </div>
    );
};

export default AdminPanel;