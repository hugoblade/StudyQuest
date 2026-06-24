// ================================
// STUDYQUEST - XP & Level Engine
// ================================

// Each level requires 100 * level XP
// Level 1: 0–100, Level 2: 100–200, Level 3: 200–300...

export const calculateLevel = (totalXP) => {
    let level = 1;
    let xpAccumulated = 0;

    while (xpAccumulated + level * 100 <= totalXP) {
        xpAccumulated += level * 100;
        level++;
    }

    const currentLevelXP = totalXP - xpAccumulated;
    const nextLevelXP = level * 100;

    return { level, currentLevelXP, nextLevelXP };
};
