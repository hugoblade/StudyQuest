import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import XPBar from '../components/XPBar';
import Badge from '../components/Badge';
import { getRecentSessions, getUserBadges, getUserData } from '../firebase/firestore';
import { calculateLevel } from '../utils/xpEngine';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const [recentSessions, setRecentSessions] = useState([]);
    const [badges, setBadges] = useState([]);
    const [xp, setXp] = useState(currentUser?.xp || 0);

    useEffect(() => {
        if (currentUser) {
            // Fetch fresh XP from Firestore (not stale auth state)
            getUserData(currentUser.uid).then(data => {
                if (data) setXp(data.xp || 0);
            });
            getRecentSessions(currentUser.uid).then(setRecentSessions);
            getUserBadges(currentUser.uid).then(setBadges);
        }
    }, [currentUser]);

    const { level, currentLevelXP, nextLevelXP } = calculateLevel(xp);
    const nextLevelNeeded = nextLevelXP - currentLevelXP;

    return (
        <div className="dashboard-page">
            <div className="dashboard-welcome">
                <h1>Welcome back, {currentUser?.username}! 👋</h1>
                <p>Ready to level up your knowledge?</p>
            </div>

            <XPBar currentXP={currentLevelXP} nextLevelXP={nextLevelXP} level={level} />

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{xp}</div>
                    <div className="stat-label">Total XP</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{nextLevelNeeded}</div>
                    <div className="stat-label">XP to Next Level</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{badges.filter(b => b.earned).length}</div>
                    <div className="stat-label">Badges Earned</div>
                </div>
            </div>

            <h2 className="dashboard-section-title">Recent Study Sessions</h2>
            {recentSessions.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                    No sessions yet. Start studying!
                </p>
            ) : (
                <div className="session-list">
                    {recentSessions.map(session => (
                        <div key={session.id} className="session-item">
                            <span className="session-subject">{session.subject}</span>
                            <span className="session-meta">{session.duration} min</span>
                            <span className="session-xp">+{session.xp} XP</span>
                        </div>
                    ))}
                </div>
            )}

            <h2 className="dashboard-section-title">Your Badges</h2>
            <div className="badges-grid">
                {badges.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        No badges yet. Complete quizzes to earn some!
                    </p>
                ) : (
                    badges.map(badge => <Badge key={badge.id} {...badge} />)
                )}
            </div>
        </div>
    );
};

export default Dashboard;
