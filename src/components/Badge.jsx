import React from 'react';
import { Award } from 'lucide-react';

const Badge = ({ name, earned, xpBonus }) => {
    if (!earned) return null;

    return (
        <div className="badge-item">
            <Award size={14} />
            <span>{name}</span>
            {xpBonus && <span style={{ opacity: 0.6, fontSize: '12px' }}>+{xpBonus} XP</span>}
        </div>
    );
};

export default Badge;
