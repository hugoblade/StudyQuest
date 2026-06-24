import React from 'react';
import { Award } from 'lucide-react';

const LeaderboardRow = ({ rank, username, xp, isCurrentUser }) => {
    return (
        <div className={`leaderboard-row ${isCurrentUser ? 'current-user' : ''}`}>
            <div className="rank">#{rank}</div>
            <div className="user-info">
                <span>{username}</span>
                {rank <= 3 && <Award size={16} color="#F59E0B" />}
            </div>
            <div className="xp">{xp} XP</div>
        </div>
    );
};

export default LeaderboardRow;