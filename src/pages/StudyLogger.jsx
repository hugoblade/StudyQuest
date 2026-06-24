import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { logStudySession } from '../firebase/firestore';

const StudyLogger = () => {
    const { currentUser } = useAuth();
    const [subject, setSubject] = useState('');
    const [duration, setDuration] = useState('');
    const [notes, setNotes] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const xp = Math.floor(duration * 2); // 2 XP per minute
        await logStudySession(currentUser.uid, { subject, duration: parseInt(duration), notes, xp });
        alert(`Logged ${duration} min of study. +${xp} XP!`);
        setSubject('');
        setDuration('');
        setNotes('');
    };

    return (
        <div className="study-logger">
            <h2>Log Study Session</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Subject (e.g. Math, History)" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                <input type="number" placeholder="Duration (minutes)" value={duration} onChange={(e) => setDuration(e.target.value)} required />
                <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
                <button type="submit">Log Session</button>
            </form>
        </div>
    );
};

export default StudyLogger;
