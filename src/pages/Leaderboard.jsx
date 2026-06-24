import React, { useEffect, useState } from 'react';
import LeaderboardRow from '../components/LeaderboardRow';
import { getLeaderboard } from '../firebase/firestore';
import { useAuth } from '../context/AuthContext';

const Leaderboard = () => {
    const { currentUser } = useAuth();
    const [leaders, setLeaders] = useState([]);

    useEffect(() => {
        getLeaderboard().then(setLeaders);
    }, []);

    return (
        <div className="leaderboard-page">
            <h2>Leaderboard 🏆</h2>
            <div className="leaderboard-list">
                {leaders.map((user, idx) => (
                    <LeaderboardRow
                        key={user.id}
                        rank={idx + 1}
                        username={user.username}
                        xp={user.xp}
                        isCurrentUser={user.id === currentUser?.uid}
                    />
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;