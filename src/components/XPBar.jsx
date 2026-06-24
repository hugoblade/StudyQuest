import React from 'react';

const XPBar = ({ currentXP, nextLevelXP, level }) => {
  const percent = (currentXP / nextLevelXP) * 100;
  return (
    <div className="xp-bar-container">
      <div className="xp-bar-header">
        <span>Level {level}</span>
        <span>{currentXP} / {nextLevelXP} XP</span>
      </div>
      <div className="xp-track">
        <div className="xp-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
};

export default XPBar;